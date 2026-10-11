-- ==============================================================================
-- Migration: SAGO Business Partner Onboarding System
-- Description: Supports multi-step partner registration, outlets, documents,
--              offers, verification checklist, decision workflow, and audit logs.
-- ==============================================================================

create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.partner_app_status as enum (
    'draft',
    'pending_review',
    'under_review',
    'additional_info_required',
    'approved',
    'rejected',
    'on_hold'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.doc_verification_status as enum (
    'pending',
    'under_review',
    'verified',
    'rejected',
    'expired'
  );
exception when duplicate_object then null; end $$;

-- 1. Main Applications Table
create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  application_reference text not null unique,
  applicant_user_id uuid,
  
  -- Step 1: Business Information
  registered_business_name text not null,
  trading_name text not null,
  business_type text not null,
  business_type_other text,
  business_registration_number text not null,
  date_of_establishment date,
  business_website text,
  business_email text not null,
  business_phone text not null,
  
  -- Business Address
  country text not null default 'Kenya',
  county text not null,
  town_city text not null,
  estate_area text,
  street_building text not null,
  postal_address text,
  gps_coordinates text,
  google_maps_link text,
  
  -- Operations
  number_of_outlets integer not null default 1,
  daily_customer_footfall text,
  operating_days text[],
  opening_hours text,
  monthly_sales_volume text,
  sells_alcohol boolean not null default true,
  has_bar_manager boolean not null default true,
  
  -- Step 2: Owner & Ownership Details
  owner_full_name text not null,
  owner_position text not null,
  owner_nationality text not null default 'Kenyan',
  owner_email text not null,
  owner_phone text not null,
  owner_alt_phone text,
  
  auth_contact_name text not null,
  auth_contact_title text not null,
  auth_contact_email text not null,
  auth_contact_phone text not null,
  auth_contact_can_sign boolean not null default true,
  
  ownership_structure text not null default 'Individually Owned',
  directors_partners jsonb not null default '[]'::jsonb,
  auth_agreement_person text not null,
  
  -- Step 4 & 5: Partnership & Campaign Terms
  proposed_partner_id text,
  partnership_type text not null default 'Promotional Discount Partner',
  partnership_type_other text,
  preferred_start_date date,
  agreement_duration text not null default '12 Months',
  outlets_joining_count integer not null default 1,
  
  campaign_discount_type text not null default 'Percentage',
  proposed_discount_rates text,
  minimum_purchase_req text,
  max_discount_per_tx text,
  eligible_products_terms text,
  discount_days_hours text,
  campaign_start_date date,
  campaign_end_date date,
  redemption_limit integer,
  combinable_with_offers boolean not null default false,
  campaign_exclusions text,
  
  -- Step 6: Redemption Configuration
  outlet_display_name text,
  outlet_id_assigned text,
  redemption_method text not null default 'Both Methods',
  staff_access_count integer not null default 2,
  designated_outlet_manager text,
  staff_training_status text not null default 'Pending',
  has_smartphone_tablet boolean not null default true,
  has_reliable_internet boolean not null default true,
  has_computer_device boolean not null default true,
  preferred_redemption_device text not null default 'Smartphone / Tablet',
  requires_onboarding_assistance boolean not null default true,
  redemption_rules_acknowledged boolean not null default false,
  
  -- Step 7: Payment & Settlement Details (conditional)
  requires_settlement boolean not null default false,
  settlement_arrangement text default 'No Payment or Reimbursement Required',
  settlement_bank_name text,
  settlement_account_name text,
  settlement_account_number text,
  settlement_branch text,
  settlement_currency text default 'KES',
  settlement_alt_method text,
  settlement_contact_name text,
  settlement_contact_email text,
  settlement_contact_phone text,
  settlement_agreed_terms text,
  settlement_frequency text default 'Monthly',
  settlement_invoice_req text,
  
  -- Step 8: Marketing Permissions
  perm_list_partner boolean not null default true,
  perm_display_name_address boolean not null default true,
  perm_use_photos boolean not null default true,
  perm_display_promo_materials boolean not null default true,
  perm_social_channels boolean not null default true,
  marketing_social_handles text,
  marketing_contact_person text,
  marketing_contact_email text,
  marketing_contact_phone text,
  
  -- Step 9: Declarations & Signature
  declarations_acknowledged boolean not null default false,
  privacy_notice_acknowledged boolean not null default false,
  marketing_comms_consent boolean not null default false,
  signatory_full_name text not null,
  signatory_designation text not null,
  signatory_business_name text not null,
  signature_data text,
  signature_date date not null default current_date,
  
  -- Status & Lifecycle
  status public.partner_app_status not null default 'pending_review',
  assigned_officer_id text,
  assigned_officer_name text,
  partner_id_assigned text unique,
  agreement_reference text,
  activation_date date,
  renewal_date date,
  decision_notes text,
  decision_reason text,
  
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Partner Outlets Table (for multi-outlet applications)
create table if not exists public.partner_outlets (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  outlet_display_name text not null,
  county text not null,
  town_city text not null,
  street_address text not null,
  gps_coordinates text,
  manager_name text,
  manager_phone text,
  operating_hours text,
  redemption_method text not null default 'Both Methods',
  outlet_id_assigned text,
  onboarding_status text not null default 'Pending Review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Partner Contacts Table
create table if not exists public.partner_contacts (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  contact_type text not null, -- 'Owner', 'Authorized Signatory', 'Manager', 'Marketing', 'Finance'
  full_name text not null,
  job_title text not null,
  email text not null,
  phone text not null,
  authorization_details text,
  created_at timestamptz not null default now()
);

-- 4. Partner Documents Table
create table if not exists public.partner_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  outlet_id uuid references public.partner_outlets(id) on delete set null,
  document_type text not null,
  document_number text,
  issuing_authority text,
  issue_date date,
  expiry_date date,
  file_name text not null,
  file_size integer not null default 0,
  mime_type text not null,
  storage_path text not null,
  verification_status public.doc_verification_status not null default 'pending',
  verification_notes text,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. Partner Products & Offers Table
create table if not exists public.partner_products_and_offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  product_name text not null,
  serving_type text, -- 'Bottle', 'Glass', 'Cocktail'
  standard_price numeric(12, 2) not null default 0,
  currency text not null default 'KES',
  proposed_discount_type text not null default 'Percentage',
  proposed_discount_value numeric(12, 2) not null default 0,
  proposed_promotional_price numeric(12, 2) not null default 0,
  approved_discount_type text,
  approved_discount_value numeric(12, 2),
  approved_promotional_price numeric(12, 2),
  approval_status text not null default 'Pending Approval',
  created_at timestamptz not null default now()
);

-- 6. Partner Verification Checklist & Details
create table if not exists public.partner_verification (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  assigned_officer_id text,
  checklist jsonb not null default '{
    "business_registration_verified": false,
    "business_address_verified": false,
    "owner_rep_verified": false,
    "licences_verified": false,
    "tax_docs_reviewed": false,
    "terms_reviewed": false,
    "agreement_signed": false,
    "outlet_access_configured": false,
    "staff_accounts_configured": false,
    "training_completed": false,
    "test_coupon_redeemed": false,
    "final_approval_granted": false
  }'::jsonb,
  decision public.partner_app_status not null default 'pending_review',
  decision_reason text,
  approved_by text,
  approved_at timestamptz,
  activation_date date,
  renewal_date date,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Partner Audit Logs
create table if not exists public.partner_audit_logs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  actor_user_id text,
  actor_name text not null default 'System',
  action text not null,
  previous_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  timestamp timestamptz not null default now()
);

-- Indexes
create index if not exists idx_partner_apps_ref on public.partner_applications(application_reference);
create index if not exists idx_partner_apps_email on public.partner_applications(business_email);
create index if not exists idx_partner_apps_status on public.partner_applications(status);
create index if not exists idx_partner_apps_county on public.partner_applications(county);
create index if not exists idx_partner_docs_app on public.partner_documents(application_id);
create index if not exists idx_partner_offers_app on public.partner_products_and_offers(application_id);
create index if not exists idx_partner_outlets_app on public.partner_outlets(application_id);
create index if not exists idx_partner_audit_app on public.partner_audit_logs(application_id);

-- Row Level Security (RLS)
alter table public.partner_applications enable row level security;
alter table public.partner_outlets enable row level security;
alter table public.partner_contacts enable row level security;
alter table public.partner_documents enable row level security;
alter table public.partner_products_and_offers enable row level security;
alter table public.partner_verification enable row level security;
alter table public.partner_audit_logs enable row level security;

-- Policies
-- Allow server-side (service_role) writes only; anon users cannot insert directly
-- Client-side inserts go through API routes that use service_role

-- Service role full access
create policy "Allow service_role all on partner_applications" on public.partner_applications for all to service_role using (true) with check (true);
create policy "Allow service_role all on partner_outlets" on public.partner_outlets for all to service_role using (true) with check (true);
create policy "Allow service_role all on partner_contacts" on public.partner_contacts for all to service_role using (true) with check (true);
create policy "Allow service_role all on partner_documents" on public.partner_documents for all to service_role using (true) with check (true);
create policy "Allow service_role all on partner_products_and_offers" on public.partner_products_and_offers for all to service_role using (true) with check (true);
create policy "Allow service_role all on partner_verification" on public.partner_verification for all to service_role using (true) with check (true);
create policy "Allow service_role all on partner_audit_logs" on public.partner_audit_logs for all to service_role using (true) with check (true);
