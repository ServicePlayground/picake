-- Drop redundant per-terms timestamp columns on consumers/sellers.
-- Consent is tracked via consumer_terms_agreements / seller_terms_agreements (terms_document_id → version).

ALTER TABLE "consumers" DROP COLUMN IF EXISTS "agreed_to_terms_at";
ALTER TABLE "consumers" DROP COLUMN IF EXISTS "agreed_to_privacy_at";
ALTER TABLE "consumers" DROP COLUMN IF EXISTS "agreed_to_third_party_at";
ALTER TABLE "consumers" DROP COLUMN IF EXISTS "agreed_to_location_terms_at";

ALTER TABLE "sellers" DROP COLUMN IF EXISTS "agreed_to_terms_at";
ALTER TABLE "sellers" DROP COLUMN IF EXISTS "agreed_to_privacy_at";
