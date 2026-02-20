-- G05-FIX Issue 1: Remove OR (user_id IS NULL) data leak from onboarding_submissions SELECT policy
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.onboarding_submissions;

CREATE POLICY "Users can view their own submissions"
ON public.onboarding_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);