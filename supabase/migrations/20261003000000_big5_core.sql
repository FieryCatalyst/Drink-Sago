create extension if not exists pgcrypto;

create type public.campaign_status as enum ('draft', 'scheduled', 'active', 'paused', 'ended');
create type public.coupon_status as enum ('ISSUED', 'REDEEMED', 'EXPIRED', 'VOID');
create type public.session_status as enum ('ACTIVE', 'EXPIRED', 'CLOSED');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status public.campaign_status not null default 'draft',
  market text,
  start_at timestamptz,
  end_at timestamptz,
  reward_config jsonb not null default '{}'::jsonb,
  commercial_rules jsonb not null default '{}'::jsonb,
  legal_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  country text not null,
  address text,
  activation_start timestamptz,
  activation_end timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_venues (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  primary key (campaign_id, venue_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  email_normalized text not null unique,
  country text,
  city text,
  preferred_social_platform text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id),
  marketing_consent boolean not null default false,
  consent_timestamp timestamptz,
  source text,
  terms_version text,
  privacy_version text,
  created_at timestamptz not null default now()
);

create table public.age_verifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  market text not null,
  verified_at timestamptz not null default now(),
  source text not null default 'sago-age-gate'
);

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  venue_id uuid not null references public.venues(id),
  campaign_id uuid not null references public.campaigns(id),
  status public.session_status not null default 'ACTIVE',
  play_count integer not null default 0 check (play_count >= 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  ip_hash text,
  device_hash text
);

create table public.symbols (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  name text not null,
  asset_path text not null,
  active boolean not null default true,
  unique (campaign_id, name)
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  reward_type text not null,
  discount_value numeric,
  eligible_product text,
  probability_config jsonb not null default '{}'::jsonb,
  tier text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plays (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id),
  customer_id uuid not null references public.customers(id),
  venue_id uuid not null references public.venues(id),
  campaign_id uuid not null references public.campaigns(id),
  result_1 text,
  result_2 text,
  result_3 text,
  reward_id uuid references public.rewards(id),
  status text not null default 'STARTED',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  secure_code_hash text not null unique,
  customer_id uuid not null references public.customers(id),
  venue_id uuid not null references public.venues(id),
  campaign_id uuid not null references public.campaigns(id),
  reward_id uuid references public.rewards(id),
  reward_type text not null,
  discount_value numeric,
  eligible_product text,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  status public.coupon_status not null default 'ISSUED',
  redeemed_at timestamptz,
  redeemed_by uuid,
  redemption_transaction_id text
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null unique references public.coupons(id),
  customer_id uuid not null references public.customers(id),
  venue_id uuid not null references public.venues(id),
  campaign_id uuid not null references public.campaigns(id),
  reward_id uuid references public.rewards(id),
  staff_user_id uuid,
  transaction_reference text,
  redeemed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  campaign_id uuid references public.campaigns(id),
  session_id uuid references public.game_sessions(id),
  customer_id uuid references public.customers(id),
  venue_id uuid references public.venues(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.social_clicks (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  campaign_id uuid references public.campaigns(id),
  session_id uuid references public.game_sessions(id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.redemption_attempts (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.coupons(id),
  venue_id uuid references public.venues(id),
  staff_user_id uuid,
  success boolean not null,
  reason text,
  created_at timestamptz not null default now()
);

create index game_sessions_customer_idx on public.game_sessions(customer_id);
create index game_sessions_campaign_venue_idx on public.game_sessions(campaign_id, venue_id);
create index coupons_customer_idx on public.coupons(customer_id);
create index coupons_venue_status_idx on public.coupons(venue_id, status);
create index analytics_events_name_idx on public.analytics_events(event_name, created_at);

alter table public.campaigns enable row level security;
alter table public.venues enable row level security;
alter table public.campaign_venues enable row level security;
alter table public.customers enable row level security;
alter table public.consents enable row level security;
alter table public.age_verifications enable row level security;
alter table public.game_sessions enable row level security;
alter table public.symbols enable row level security;
alter table public.rewards enable row level security;
alter table public.plays enable row level security;
alter table public.coupons enable row level security;
alter table public.redemptions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.social_clicks enable row level security;
alter table public.audit_logs enable row level security;
alter table public.redemption_attempts enable row level security;

create policy active_campaigns_public_read on public.campaigns for select using (status = 'active');
create policy active_venues_public_read on public.venues for select using (active = true);
create policy active_campaign_venues_public_read on public.campaign_venues for select using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.status = 'active'));

create or replace function public.issue_game_play(
  p_session_id uuid,
  p_result_1 text,
  p_result_2 text,
  p_result_3 text,
  p_reward_id uuid,
  p_reward_type text,
  p_discount_value numeric,
  p_eligible_product text,
  p_secure_code_hash text,
  p_expires_at timestamptz
)
returns table (play_id uuid, coupon_id uuid, venue_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_session public.game_sessions%rowtype;
  target_campaign public.campaigns%rowtype;
  session_play_limit int;
  max_coupons_limit int;
  customer_coupon_count int;
  created_play_id uuid;
  created_coupon_id uuid;
begin
  select * into locked_session
  from public.game_sessions
  where id = p_session_id
  for update;

  if locked_session.id is null then
    raise exception 'GAME_SESSION_NOT_FOUND';
  end if;

  if locked_session.status <> 'ACTIVE' then
    raise exception 'GAME_SESSION_INACTIVE';
  end if;

  select * into target_campaign
  from public.campaigns
  where id = locked_session.campaign_id;

  -- Enforce campaign-configured per-session play limit
  session_play_limit := coalesce(
    (target_campaign.commercial_rules->>'max_plays_per_session')::int,
    (target_campaign.commercial_rules->>'session_play_limit')::int,
    (target_campaign.commercial_rules->>'play_limit_per_session')::int,
    (target_campaign.commercial_rules->>'max_plays')::int
  );

  if session_play_limit is not null and locked_session.play_count >= session_play_limit then
    update public.game_sessions
    set status = 'CLOSED'
    where id = locked_session.id;
    raise exception 'SESSION_PLAY_LIMIT_REACHED';
  end if;

  -- Enforce maximum coupons per customer and campaign
  max_coupons_limit := coalesce(
    (target_campaign.commercial_rules->>'max_coupons_per_customer')::int,
    (target_campaign.commercial_rules->>'max_coupons_per_customer_campaign')::int,
    (target_campaign.commercial_rules->>'max_coupons')::int,
    (target_campaign.commercial_rules->>'coupons_per_customer')::int
  );

  if max_coupons_limit is not null then
    perform 1
    from public.customers
    where id = locked_session.customer_id
    for update;

    select count(*) into customer_coupon_count
    from public.coupons
    where customer_id = locked_session.customer_id
      and campaign_id = locked_session.campaign_id;

    if customer_coupon_count >= max_coupons_limit then
      raise exception 'CUSTOMER_COUPON_LIMIT_REACHED';
    end if;
  end if;

  update public.game_sessions
  set play_count = play_count + 1,
      status = case
        when session_play_limit is not null and (play_count + 1) >= session_play_limit then 'CLOSED'::public.session_status
        else status
      end
  where id = locked_session.id;

  insert into public.plays (
    session_id, customer_id, venue_id, campaign_id,
    result_1, result_2, result_3, reward_id,
    status, completed_at
  ) values (
    locked_session.id, locked_session.customer_id, locked_session.venue_id, locked_session.campaign_id,
    p_result_1, p_result_2, p_result_3, p_reward_id,
    'COMPLETED', now()
  ) returning id into created_play_id;

  insert into public.coupons (
    secure_code_hash, customer_id, venue_id, campaign_id, reward_id,
    reward_type, discount_value, eligible_product, expires_at
  ) values (
    p_secure_code_hash, locked_session.customer_id, locked_session.venue_id, locked_session.campaign_id, p_reward_id,
    p_reward_type, p_discount_value, p_eligible_product, p_expires_at
  ) returning id into created_coupon_id;

  return query select created_play_id, created_coupon_id, locked_session.venue_id, p_expires_at;
end;
$$;

revoke execute on function public.issue_game_play(uuid, text, text, text, uuid, text, numeric, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.issue_game_play(uuid, text, text, text, uuid, text, numeric, text, text, timestamptz) to service_role;
