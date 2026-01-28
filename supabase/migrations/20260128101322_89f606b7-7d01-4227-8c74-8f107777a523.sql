-- Crear función is_admin() para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND email = 'l@albus.com.co'
  )
$$;

-- Políticas RLS para tabla resources
CREATE POLICY "Admin can insert resources"
ON public.resources
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update resources"
ON public.resources
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete resources"
ON public.resources
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Políticas RLS para tabla plans
CREATE POLICY "Admin can insert plans"
ON public.plans
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update plans"
ON public.plans
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete plans"
ON public.plans
FOR DELETE
TO authenticated
USING (public.is_admin());