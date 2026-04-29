CREATE TABLE public.pending_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  route_template TEXT,
  price_id TEXT NOT NULL,
  amount_cents INTEGER,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pending payments"
ON public.pending_payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own pending payments"
ON public.pending_payments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all pending payments"
ON public.pending_payments
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION public.update_pending_payments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pending_payments_updated_at
BEFORE UPDATE ON public.pending_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_pending_payments_updated_at();

CREATE INDEX idx_pending_payments_user_status ON public.pending_payments(user_id, status);
CREATE INDEX idx_pending_payments_session ON public.pending_payments(stripe_session_id);

CREATE POLICY "Validate pending payment status"
ON public.pending_payments
FOR INSERT
TO authenticated
WITH CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));