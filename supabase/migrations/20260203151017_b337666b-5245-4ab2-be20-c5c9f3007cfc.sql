-- Fix search_path for validation functions
CREATE OR REPLACE FUNCTION public.validate_user_document_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.category NOT IN ('identidad', 'residencia', 'antecedentes') THEN
    RAISE EXCEPTION 'Invalid category. Must be identidad, residencia, or antecedentes';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_user_document_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('waiting', 'analyzing', 'valid', 'error') THEN
    RAISE EXCEPTION 'Invalid status. Must be waiting, analyzing, valid, or error';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_user_document_route_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.route_type IS NOT NULL AND NEW.route_type NOT IN ('regularizacion2026', 'arraigos') THEN
    RAISE EXCEPTION 'Invalid route_type. Must be regularizacion2026 or arraigos';
  END IF;
  RETURN NEW;
END;
$$;