-- Add user_id column to onboarding_submissions to link with auth users
ALTER TABLE public.onboarding_submissions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_onboarding_submissions_user_id ON public.onboarding_submissions(user_id);

-- Update RLS policy to allow users to update their own submissions
CREATE POLICY "Users can update their own submissions" 
ON public.onboarding_submissions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own submissions
CREATE POLICY "Users can view their own submissions" 
ON public.onboarding_submissions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);