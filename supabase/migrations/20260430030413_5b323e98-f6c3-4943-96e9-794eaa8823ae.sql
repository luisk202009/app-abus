CREATE OR REPLACE FUNCTION public.increment_total_routes_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot increment routes for other users';
  END IF;

  -- Reg2026 es un producto de pago independiente: no consume el slot Free
  IF NEW.template_id = '57b27d4a-190b-4ece-a1c3-de1859d58217'::uuid THEN
    RETURN NEW;
  END IF;

  UPDATE onboarding_submissions
  SET total_routes_created = total_routes_created + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$function$;