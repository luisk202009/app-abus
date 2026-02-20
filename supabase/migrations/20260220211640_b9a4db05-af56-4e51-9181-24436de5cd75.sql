
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id uuid,
  referred_name text,
  status text NOT NULL DEFAULT 'pendiente',
  reward_amount numeric NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own code" ON public.referral_codes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own code" ON public.referral_codes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all codes" ON public.referral_codes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Users can view their referrals" ON public.referrals
  FOR SELECT TO authenticated USING (
    referrer_id IN (SELECT id FROM public.referral_codes WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can manage all referrals" ON public.referrals
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Allow authenticated insert referrals" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.validate_referral_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pendiente', 'completado') THEN
    RAISE EXCEPTION 'Invalid status. Must be pendiente or completado';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_referral_status_trigger
  BEFORE INSERT OR UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.validate_referral_status();
