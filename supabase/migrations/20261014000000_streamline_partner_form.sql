-- ==============================================================================
-- Migration: Streamline SAGO Partner Onboarding (5-Step Form)
-- Description:
-- 1. Makes optional fields nullable in partner_applications:
--    - business_registration_number (optional for early-stage / independent bars)
--    - street_building (optional address line)
--    - auth_contact_* (consolidated with primary contact/owner)
-- 2. Relaxes pricing constraints in partner_products_and_offers since product
--    pricing is negotiated and tailored directly after onboarding.
-- 3. Keeps all document tables non-blocking (0 uploads allowed).
-- ==============================================================================

-- 1. Relax NOT NULL constraints for newly optional business & address fields
ALTER TABLE public.partner_applications 
  ALTER COLUMN business_registration_number DROP NOT NULL,
  ALTER COLUMN street_building DROP NOT NULL;

-- 2. Relax NOT NULL constraints for secondary representative fields
-- (Step 2 now captures primary contact/owner directly)
ALTER TABLE public.partner_applications 
  ALTER COLUMN auth_contact_name DROP NOT NULL,
  ALTER COLUMN auth_contact_title DROP NOT NULL,
  ALTER COLUMN auth_contact_email DROP NOT NULL,
  ALTER COLUMN auth_contact_phone DROP NOT NULL,
  ALTER COLUMN auth_agreement_person DROP NOT NULL;

-- 3. In partner_products_and_offers, allow pricing fields to be nullable
-- since product pricing is discussed after onboarding
ALTER TABLE public.partner_products_and_offers
  ALTER COLUMN standard_price DROP NOT NULL,
  ALTER COLUMN standard_price SET DEFAULT NULL,
  ALTER COLUMN proposed_discount_type DROP NOT NULL,
  ALTER COLUMN proposed_discount_type SET DEFAULT 'Percentage',
  ALTER COLUMN proposed_discount_value DROP NOT NULL,
  ALTER COLUMN proposed_discount_value SET DEFAULT NULL,
  ALTER COLUMN proposed_promotional_price DROP NOT NULL,
  ALTER COLUMN proposed_promotional_price SET DEFAULT NULL;

-- 4. Add helpful metadata comment
COMMENT ON TABLE public.partner_applications IS 'SAGO Business Partner applications (streamlined 5-step onboarding flow)';
