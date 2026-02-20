
-- Fix 1: waitlist — Correct the Admin SELECT Policy
DROP POLICY IF EXISTS "Admins can read waitlist" ON public.waitlist;
CREATE POLICY "Admins can read waitlist"
ON public.waitlist FOR SELECT TO authenticated
USING (is_admin());

-- Fix 3: referrals — Add Secure INSERT Policy (blocks client-side, service_role bypasses)
CREATE POLICY "Service role can insert referrals"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (false);

-- Fix 4: onboarding_submissions — Tighten UPDATE to authenticated only
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.onboarding_submissions;
CREATE POLICY "Users can update their own submissions"
ON public.onboarding_submissions FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
