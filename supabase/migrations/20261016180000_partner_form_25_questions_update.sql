-- ==============================================================================
-- Migration: Partner Form 25-Question Restructure & Non-Kenya Default
-- File: supabase/migrations/20261016180000_partner_form_25_questions_update.sql
-- Description:
-- 1. Removes default 'Kenya' and 'Kenyan' from country and nationality columns.
-- 2. Adds dedicated columns for new questions:
--    - manager_full_name (Q5)
--    - manager_phone (Q6)
--    - outlet_category (Q21: 'Restaurant with Bar', 'Liquor Store / Retail Outlet', 'Supermarket')
-- 3. Relaxes NOT NULL constraints to allow clean multi-step draft saving without errors.
-- ==============================================================================

-- 1. Add dedicated columns for the new questions
ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS manager_full_name text,
  ADD COLUMN IF NOT EXISTS manager_phone text,
  ADD COLUMN IF NOT EXISTS outlet_category text;

-- 2. Remove default 'Kenya' and 'Kenyan' constraints
ALTER TABLE public.partner_applications
  ALTER COLUMN country DROP DEFAULT,
  ALTER COLUMN country DROP NOT NULL,
  ALTER COLUMN owner_nationality DROP DEFAULT,
  ALTER COLUMN owner_nationality DROP NOT NULL;

-- 3. Relax NOT NULL constraints for address fields to support non-Kenyan regions & partial drafts
ALTER TABLE public.partner_applications
  ALTER COLUMN county DROP NOT NULL,
  ALTER COLUMN town_city DROP NOT NULL;

-- 4. Relax NOT NULL constraints for legacy signatory & owner fields during draft saves
ALTER TABLE public.partner_applications
  ALTER COLUMN owner_full_name DROP NOT NULL,
  ALTER COLUMN owner_position DROP NOT NULL,
  ALTER COLUMN owner_email DROP NOT NULL,
  ALTER COLUMN owner_phone DROP NOT NULL,
  ALTER COLUMN signatory_full_name DROP NOT NULL,
  ALTER COLUMN signatory_designation DROP NOT NULL,
  ALTER COLUMN signatory_business_name DROP NOT NULL;

-- 5. Add column comments for documentation
COMMENT ON COLUMN public.partner_applications.manager_full_name IS 'Q5: Full name of the business manager';
COMMENT ON COLUMN public.partner_applications.manager_phone IS 'Q6: Official phone number of the business manager';
COMMENT ON COLUMN public.partner_applications.outlet_category IS 'Q21: Outlet category (e.g. Restaurant with Bar, Liquor Store, Supermarket)';
