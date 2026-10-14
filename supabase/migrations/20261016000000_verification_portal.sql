-- ==============================================================================
-- SAGO PROMOTION VERIFICATION PORTAL MIGRATION
-- File: supabase/migrations/20261016000000_verification_portal.sql
-- Description: Creates bars, bar_staff, promotions, coupons, and redemption_logs
--              with Row Level Security (RLS) policies and atomic redemption functions.
-- ==============================================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. BARS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.bars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  outlet_code text unique not null,
  location text,
  address text,
  city text not null default 'Lusaka',
  country text not null default 'Zambia',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast outlet_code lookup
create index if not exists bars_outlet_code_idx on public.bars(outlet_code);
create index if not exists bars_active_idx on public.bars(is_active);

-- ------------------------------------------------------------------------------
-- 2. BAR STAFF TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.bar_staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  bar_id uuid not null references public.bars(id) on delete cascade,
  role text not null check (role in ('bartender', 'bar_manager', 'admin')) default 'bartender',
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bar_staff_user_idx on public.bar_staff(user_id);
create index if not exists bar_staff_bar_idx on public.bar_staff(bar_id);

-- ------------------------------------------------------------------------------
-- 3. PROMOTIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.portal_promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')) default 'percentage',
  discount_value numeric not null check (discount_value >= 0 and discount_value <= 100),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 4. PORTAL COUPONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.portal_coupons (
  id uuid primary key default gen_random_uuid(),
  coupon_code text unique not null,
  promotion_id uuid references public.portal_promotions(id),
  status text not null check (status in ('issued', 'redeemed', 'expired', 'revoked')) default 'issued',
  tier text check (tier in ('HIGH', 'MID+', 'MID', 'LOW+', 'LOW')) default 'LOW',
  bottle_discount numeric not null default 5 check (bottle_discount >= 0 and bottle_discount <= 100),
  shot_discount numeric not null default 10 check (shot_discount >= 0 and shot_discount <= 100),
  eligible_product text not null default 'SAGO Bottles & Signature Pours',
  combination text,
  venue_id text,
  customer_name text,
  customer_email text,
  security_sig text,
  qr_payload text,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  redeemed_at timestamptz,
  redeemed_by_user_id uuid references auth.users(id),
  redeemed_at_bar_id uuid references public.bars(id),
  created_at timestamptz not null default now()
);

create index if not exists portal_coupons_code_idx on public.portal_coupons(coupon_code);
create index if not exists portal_coupons_status_idx on public.portal_coupons(status);
create index if not exists portal_coupons_bar_idx on public.portal_coupons(redeemed_at_bar_id);

-- ------------------------------------------------------------------------------
-- 5. REDEMPTION LOGS TABLE (AUDIT TRAIL)
-- ------------------------------------------------------------------------------
create table if not exists public.redemption_logs (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.portal_coupons(id),
  coupon_code text not null,
  bar_id uuid not null references public.bars(id),
  staff_user_id uuid references auth.users(id),
  action text not null check (action in ('verification_success', 'verification_failed', 'redeemed', 'redemption_rejected')),
  result text not null,
  request_id text,
  discount_applied text,
  created_at timestamptz not null default now()
);

create index if not exists redemption_logs_bar_idx on public.redemption_logs(bar_id, created_at desc);
create index if not exists redemption_logs_coupon_idx on public.redemption_logs(coupon_id);
create index if not exists redemption_logs_request_idx on public.redemption_logs(request_id);

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.bars enable row level security;
alter table public.bar_staff enable row level security;
alter table public.portal_promotions enable row level security;
alter table public.portal_coupons enable row level security;
alter table public.redemption_logs enable row level security;

-- Function to check the authenticated user's active bar_id
create or replace function public.get_auth_bar_id()
returns uuid language sql stable security definer
set search_path = public
as $$
  select bar_id
  from public.bar_staff
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

-- Bars Policies:
-- Staff can view only their own active bar
create policy "Staff can view their assigned bar"
  on public.bars for select
  using (id = public.get_auth_bar_id());

-- Bar Staff Policies:
-- Staff can view their own profile
create policy "Staff can view own staff record"
  on public.bar_staff for select
  using (user_id = auth.uid());

-- Redemption Logs Policies:
-- Staff can view only redemption logs belonging to their own bar
create policy "Staff can view own bar redemption logs"
  on public.redemption_logs for select
  using (bar_id = public.get_auth_bar_id());

-- Staff cannot insert, update, or delete redemption logs directly (handled via functions)
create policy "Prevent manual modification of redemption logs"
  on public.redemption_logs for insert
  with check (false);

create policy "Prevent manual update of redemption logs"
  on public.redemption_logs for update
  using (false);

create policy "Prevent manual delete of redemption logs"
  on public.redemption_logs for delete
  using (false);

-- Coupons Policies:
-- Staff can view coupons redeemed at their bar or check coupon existence through verified RPC
create policy "Staff can view coupons redeemed at their bar"
  on public.portal_coupons for select
  using (redeemed_at_bar_id = public.get_auth_bar_id());

-- ------------------------------------------------------------------------------
-- 7. ATOMIC VERIFICATION AND REDEMPTION DATABASE PROCEDURES
-- ------------------------------------------------------------------------------

-- Procedure to safely verify a coupon without mutating state
create or replace function public.verify_coupon_code(
  p_coupon_code text,
  p_bar_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon record;
  v_bar record;
  v_result jsonb;
  v_auth_bar_id uuid;
begin
  -- Reject unauthenticated callers
  if auth.uid() is null then
    return jsonb_build_object(
      'is_valid', false,
      'error', 'Authentication required'
    );
  end if;

  -- Ensure p_bar_id matches the authenticated user's bar
  v_auth_bar_id := public.get_auth_bar_id();
  if v_auth_bar_id is null or v_auth_bar_id <> p_bar_id then
    return jsonb_build_object(
      'is_valid', false,
      'error', 'Unauthorized bar access'
    );
  end if;

  -- Validate bar exists and is active
  select * into v_bar from public.bars where id = p_bar_id and is_active = true;
  if not found then
    return jsonb_build_object(
      'is_valid', false,
      'error', 'Unauthorized or inactive bar establishment'
    );
  end if;

  -- Lookup coupon
  select * into v_coupon
  from public.portal_coupons
  where upper(coupon_code) = upper(trim(p_coupon_code));

  if not found then
    insert into public.redemption_logs (coupon_code, bar_id, staff_user_id, action, result)
    values (upper(trim(p_coupon_code)), p_bar_id, auth.uid(), 'verification_failed', 'Coupon code does not exist');

    return jsonb_build_object(
      'is_valid', false,
      'error', 'Invalid coupon code. Not found in system.'
    );
  end if;

  -- Check status
  if v_coupon.status = 'redeemed' then
    return jsonb_build_object(
      'is_valid', false,
      'error', 'Coupon already redeemed on ' || to_char(v_coupon.redeemed_at, 'DD Mon YYYY HH24:MI'),
      'redeemed_at', v_coupon.redeemed_at,
      'tier', v_coupon.tier,
      'bottle_discount', v_coupon.bottle_discount,
      'shot_discount', v_coupon.shot_discount
    );
  end if;

  if v_coupon.status = 'expired' or (v_coupon.expires_at is not null and v_coupon.expires_at < now()) then
    return jsonb_build_object(
      'is_valid', false,
      'error', 'This promotional coupon has expired',
      'expires_at', v_coupon.expires_at
    );
  end if;

  if v_coupon.status != 'issued' then
    return jsonb_build_object(
      'is_valid', false,
      'error', 'Coupon is not eligible for redemption (' || v_coupon.status || ')'
    );
  end if;

  -- Log verification success
  insert into public.redemption_logs (coupon_id, coupon_code, bar_id, staff_user_id, action, result, discount_applied)
  values (
    v_coupon.id,
    v_coupon.coupon_code,
    p_bar_id,
    auth.uid(),
    'verification_success',
    'Coupon verified successfully',
    v_coupon.bottle_discount || '% bottle / ' || v_coupon.shot_discount || '% shot'
  );

  return jsonb_build_object(
    'is_valid', true,
    'coupon_code', v_coupon.coupon_code,
    'tier', v_coupon.tier,
    'bottle_discount', v_coupon.bottle_discount,
    'shot_discount', v_coupon.shot_discount,
    'combination', v_coupon.combination,
    'eligible_product', v_coupon.eligible_product,
    'customer_name', v_coupon.customer_name,
    'expires_at', v_coupon.expires_at,
    'status', v_coupon.status
  );
end;
$$;

-- Procedure to atomically confirm and execute redemption with row lock
create or replace function public.redeem_coupon_code(
  p_coupon_code text,
  p_bar_id uuid,
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon record;
  v_bar record;
  v_redemption_ref text;
  v_now timestamptz := now();
  v_auth_bar_id uuid;
begin
  -- Reject unauthenticated callers
  if auth.uid() is null then
    return jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  end if;

  -- Ensure p_bar_id matches the authenticated user's bar
  v_auth_bar_id := public.get_auth_bar_id();
  if v_auth_bar_id is null or v_auth_bar_id <> p_bar_id then
    return jsonb_build_object(
      'success', false,
      'error', 'Unauthorized bar access'
    );
  end if;

  -- Validate bar exists and is active
  select * into v_bar from public.bars where id = p_bar_id and is_active = true;
  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'Unauthorized or inactive bar establishment'
    );
  end if;

  -- Check idempotency if request_id supplied (match request_id, action, bar_id, and normalized coupon_code)
  if p_request_id is not null then
    select * into v_coupon from public.redemption_logs
    where request_id = p_request_id
      and action = 'redeemed'
      and bar_id = p_bar_id
      and upper(coupon_code) = upper(trim(p_coupon_code));
    if found then
      return jsonb_build_object(
        'success', true,
        'idempotent_replay', true,
        'message', 'Redemption previously confirmed'
      );
    end if;
  end if;

  -- Explicit row lock to prevent race conditions
  select * into v_coupon
  from public.portal_coupons
  where upper(coupon_code) = upper(trim(p_coupon_code))
  for update;

  if not found then
    insert into public.redemption_logs (coupon_code, bar_id, staff_user_id, action, result, request_id)
    values (upper(trim(p_coupon_code)), p_bar_id, auth.uid(), 'redemption_rejected', 'Coupon code does not exist', p_request_id);

    return jsonb_build_object(
      'success', false,
      'error', 'Invalid coupon code'
    );
  end if;

  -- Check expiry first for ALL coupons (including 'issued' status)
  if v_coupon.expires_at is not null and v_coupon.expires_at < v_now then
    insert into public.redemption_logs (coupon_id, coupon_code, bar_id, staff_user_id, action, result, request_id)
    values (v_coupon.id, v_coupon.coupon_code, p_bar_id, auth.uid(), 'redemption_rejected', 'Coupon has expired', p_request_id);

    return jsonb_build_object(
      'success', false,
      'error', 'Coupon has expired'
    );
  end if;

  -- Reject coupons whose status is not 'issued'
  if v_coupon.status <> 'issued' then
    if v_coupon.status = 'redeemed' then
      insert into public.redemption_logs (coupon_id, coupon_code, bar_id, staff_user_id, action, result, request_id)
      values (v_coupon.id, v_coupon.coupon_code, p_bar_id, auth.uid(), 'redemption_rejected', 'Coupon already redeemed', p_request_id);

      return jsonb_build_object(
        'success', false,
        'error', 'Coupon already redeemed on ' || to_char(v_coupon.redeemed_at, 'DD Mon YYYY HH24:MI')
      );
    end if;

    -- Other statuses (e.g., 'expired', 'revoked')
    return jsonb_build_object(
      'success', false,
      'error', 'Coupon is not eligible for redemption (' || v_coupon.status || ')'
    );
  end if;

  -- Generate confirmation reference
  v_redemption_ref := 'SAGO-RED-' || to_char(v_now, 'YYYY') || '-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));

  -- Execute atomic update
  update public.portal_coupons
  set
    status = 'redeemed',
    redeemed_at = v_now,
    redeemed_at_bar_id = p_bar_id,
    redeemed_by_user_id = auth.uid()
  where id = v_coupon.id;

  -- Record audit log
  insert into public.redemption_logs (
    coupon_id,
    coupon_code,
    bar_id,
    staff_user_id,
    action,
    result,
    request_id,
    discount_applied
  )
  values (
    v_coupon.id,
    v_coupon.coupon_code,
    p_bar_id,
    auth.uid(),
    'redeemed',
    'Successfully redeemed under confirmation ' || v_redemption_ref,
    p_request_id,
    v_coupon.bottle_discount || '% Bottle / ' || v_coupon.shot_discount || '% Pour'
  );

  return jsonb_build_object(
    'success', true,
    'confirmation_ref', v_redemption_ref,
    'redeemed_at', v_now,
    'coupon_code', v_coupon.coupon_code,
    'tier', v_coupon.tier,
    'bottle_discount', v_coupon.bottle_discount,
    'shot_discount', v_coupon.shot_discount,
    'bar_name', v_bar.name,
    'message', 'Coupon successfully redeemed'
  );
end;
$$;

-- ------------------------------------------------------------------------------
-- 9. FUNCTION PERMISSIONS
-- ------------------------------------------------------------------------------
-- Revoke EXECUTE from PUBLIC and anon for both functions
revoke execute on function public.verify_coupon_code(text, uuid) from public, anon;
revoke execute on function public.redeem_coupon_code(text, uuid, text) from public, anon;

-- Grant EXECUTE only to authenticated role
grant execute on function public.verify_coupon_code(text, uuid) to authenticated;
grant execute on function public.redeem_coupon_code(text, uuid, text) to authenticated;

-- ------------------------------------------------------------------------------
-- 10. INITIAL SEED FOR THE 4 ZAMBIA PARTNER BARS
-- ------------------------------------------------------------------------------
insert into public.bars (id, name, outlet_code, location, address, city, country, is_active)
values
  ('b0000001-0000-0000-0000-000000000001', 'Social Kitwe', 'ZM-KITWE-SOCIAL', 'Parklands', 'Shop 35, ECL Mall, Parklands', 'Kitwe', 'Zambia', true),
  ('b0000002-0000-0000-0000-000000000002', 'Social Munali', 'ZM-LUSAKA-MUNALI', 'Munali Mall', 'Cnr Munali Rd & 12th St, near Munali Mall', 'Lusaka', 'Zambia', true),
  ('b0000003-0000-0000-0000-000000000003', 'Zorgi''s Pub & Grill', 'ZM-KITWE-ZORGIS', 'Parklands', '15 Kuomboka Drive, Parklands', 'Kitwe', 'Zambia', true),
  ('b0000004-0000-0000-0000-000000000004', 'Lusaka Sports Club', 'ZM-LUSAKA-SPORTS', 'Longacres', 'Plot 4978, Los Angeles Blvd, Longacres', 'Lusaka', 'Zambia', true)
on conflict (outlet_code) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  location = excluded.location;
