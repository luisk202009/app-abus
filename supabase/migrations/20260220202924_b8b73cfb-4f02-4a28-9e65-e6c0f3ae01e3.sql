
CREATE OR REPLACE FUNCTION public.validate_user_document_category()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.category NOT IN ('identidad', 'residencia', 'antecedentes', 'identidad_permanente') THEN
    RAISE EXCEPTION 'Invalid category. Must be identidad, residencia, antecedentes, or identidad_permanente';
  END IF;
  RETURN NEW;
END;
$function$;
