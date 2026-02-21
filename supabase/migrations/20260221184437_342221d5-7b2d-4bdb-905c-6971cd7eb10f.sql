ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS has_documents boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_fiscal_simulator boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_appointments boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_life_in_spain boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_business boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_referrals boolean NOT NULL DEFAULT false;