-- Enable RLS on onboarding_submissions (policies already exist but RLS was not enabled)
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;