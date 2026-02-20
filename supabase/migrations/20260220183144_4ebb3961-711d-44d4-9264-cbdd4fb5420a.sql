
-- Create partners table
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  team_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create partner_assignments table
CREATE TABLE public.partner_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  case_status text NOT NULL DEFAULT 'en_revision',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  UNIQUE(partner_id, user_id)
);

ALTER TABLE public.partner_assignments ENABLE ROW LEVEL SECURITY;

-- Validation trigger for case_status
CREATE OR REPLACE FUNCTION public.validate_case_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.case_status NOT IN ('en_revision', 'listo_presentar', 'requiere_accion') THEN
    RAISE EXCEPTION 'Invalid case_status. Must be en_revision, listo_presentar, or requiere_accion';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_partner_assignment_status
BEFORE INSERT OR UPDATE ON public.partner_assignments
FOR EACH ROW EXECUTE FUNCTION public.validate_case_status();

-- Security definer functions
CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partners WHERE user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_to_partner(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_assignments pa
    JOIN public.partners p ON pa.partner_id = p.id
    WHERE p.user_id = auth.uid() AND pa.user_id = _user_id
  )
$$;

-- RLS policies for partners table
CREATE POLICY "Admin can manage partners"
ON public.partners FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Partners can view own record"
ON public.partners FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- RLS policies for partner_assignments table
CREATE POLICY "Admin can manage assignments"
ON public.partner_assignments FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Partners can view their assignments"
ON public.partner_assignments FOR SELECT TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

CREATE POLICY "Partners can update their assignment status"
ON public.partner_assignments FOR UPDATE TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Additional RLS policies on existing tables for partners
CREATE POLICY "Partners can view assigned user docs"
ON public.user_documents FOR SELECT TO authenticated
USING (is_assigned_to_partner(user_id));

CREATE POLICY "Partners can update assigned user doc status"
ON public.user_documents FOR UPDATE TO authenticated
USING (is_assigned_to_partner(user_id))
WITH CHECK (is_assigned_to_partner(user_id));

CREATE POLICY "Partners can view assigned user comments"
ON public.document_comments FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_documents ud
  WHERE ud.id = document_comments.document_id
  AND is_assigned_to_partner(ud.user_id)
));

CREATE POLICY "Partners can comment on assigned user docs"
ON public.document_comments FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_documents ud
  WHERE ud.id = document_id
  AND is_assigned_to_partner(ud.user_id)
));

CREATE POLICY "Partners can view assigned user submissions"
ON public.onboarding_submissions FOR SELECT TO authenticated
USING (is_assigned_to_partner(user_id));

CREATE POLICY "Partners can view assigned user routes"
ON public.user_active_routes FOR SELECT TO authenticated
USING (is_assigned_to_partner(user_id));
