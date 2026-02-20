
-- Create user_appointments table
CREATE TABLE public.user_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  appointment_date DATE,
  appointment_time TEXT,
  police_station_address TEXT,
  lot_number TEXT,
  tie_status TEXT DEFAULT 'pending',
  application_status TEXT DEFAULT 'en_tramite',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_appointments ENABLE ROW LEVEL SECURITY;

-- Validation triggers
CREATE OR REPLACE FUNCTION public.validate_tie_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tie_status NOT IN ('pending', 'appointment_scheduled', 'fingerprints_done', 'card_ready', 'collected') THEN
    RAISE EXCEPTION 'Invalid tie_status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_tie_status_trigger
BEFORE INSERT OR UPDATE ON public.user_appointments
FOR EACH ROW EXECUTE FUNCTION public.validate_tie_status();

CREATE OR REPLACE FUNCTION public.validate_application_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.application_status NOT IN ('en_tramite', 'aprobada', 'denegada') THEN
    RAISE EXCEPTION 'Invalid application_status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_application_status_trigger
BEFORE INSERT OR UPDATE ON public.user_appointments
FOR EACH ROW EXECUTE FUNCTION public.validate_application_status();

-- RLS: Users CRUD own records
CREATE POLICY "Users can view own appointments"
ON public.user_appointments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
ON public.user_appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
ON public.user_appointments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
ON public.user_appointments FOR DELETE
USING (auth.uid() = user_id);

-- RLS: Admin full access
CREATE POLICY "Admin can manage appointments"
ON public.user_appointments FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- RLS: Partners view/update assigned users
CREATE POLICY "Partners can view assigned user appointments"
ON public.user_appointments FOR SELECT
USING (is_assigned_to_partner(user_id));

CREATE POLICY "Partners can update assigned user appointments"
ON public.user_appointments FOR UPDATE
USING (is_assigned_to_partner(user_id))
WITH CHECK (is_assigned_to_partner(user_id));

-- Also update the case_status validator to allow 'aprobada'
CREATE OR REPLACE FUNCTION public.validate_case_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.case_status NOT IN ('en_revision', 'listo_presentar', 'requiere_accion', 'aprobada') THEN
    RAISE EXCEPTION 'Invalid case_status. Must be en_revision, listo_presentar, requiere_accion, or aprobada';
  END IF;
  RETURN NEW;
END;
$$;
