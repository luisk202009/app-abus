-- Add subscription_status column to onboarding_submissions
ALTER TABLE public.onboarding_submissions
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';

-- Create index for quick status lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_subscription_status 
ON public.onboarding_submissions(subscription_status);