-- ==============================================================================
-- Migration: SAGO Collective Members Table
-- Description: Stores registrations from the Sago Collective page and modal
-- Supports: Upsert by email_normalized, RLS policies for anon and service_role
-- ==============================================================================

create extension if not exists pgcrypto;

-- 1. Create table
create table if not exists public.sago_collective_members (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text not null,
  email_normalized text not null unique,
  birth_year integer,
  country text default 'Zambia',
  is_bartender boolean not null default false,
  consent boolean not null default true,
  source text not null default 'sago_collective_page',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Indexes
create index if not exists idx_sago_collective_email_norm 
  on public.sago_collective_members(email_normalized);

create index if not exists idx_sago_collective_country 
  on public.sago_collective_members(country);

-- 3. Enable Row Level Security (RLS)
alter table public.sago_collective_members enable row level security;

-- 4. Policies for anon role (used when public anon key is provided)
create policy "Allow anon insert to sago_collective_members"
  on public.sago_collective_members
  for insert
  to anon
  with check (true);

create policy "Allow anon update to sago_collective_members"
  on public.sago_collective_members
  for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon select to sago_collective_members"
  on public.sago_collective_members
  for select
  to anon
  using (true);

-- 5. Policies for service_role (full backend access)
create policy "Allow service_role full access to sago_collective_members"
  on public.sago_collective_members
  for all
  to service_role
  using (true)
  with check (true);
