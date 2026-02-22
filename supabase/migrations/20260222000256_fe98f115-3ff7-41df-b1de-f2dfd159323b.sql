CREATE POLICY "Users can insert their own submissions"
ON onboarding_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);