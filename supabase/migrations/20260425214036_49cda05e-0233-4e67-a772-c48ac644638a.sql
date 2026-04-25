CREATE POLICY "Lawyers can view assigned client submissions"
ON public.onboarding_submissions
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT li.user_id
    FROM public.lawyer_inquiries li
    JOIN public.lawyers l ON l.id = li.lawyer_id
    WHERE l.user_id = auth.uid()
  )
);