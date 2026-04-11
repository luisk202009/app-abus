
-- 1. Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create has_role() function FIRST (needed by policies below)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. RLS policies for user_roles (only admins can manage, users can read own)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 4. Seed existing admin into user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'l@albus.com.co'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update is_admin() to use roles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 6. Restrict anonymous inserts on onboarding_submissions
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.onboarding_submissions;
CREATE POLICY "Allow anonymous inserts"
ON public.onboarding_submissions
FOR INSERT TO public
WITH CHECK (
  stripe_customer_id IS NULL
  AND subscription_status IS NULL
  AND crm_tag IS NULL
  AND next_billing_date IS NULL
  AND avatar_url IS NULL
  AND user_id IS NULL
  AND ai_recommendation IS NULL
  AND total_routes_created = 0
);

-- 7. Fix resources storage bucket policies
DROP POLICY IF EXISTS "Admin can upload resources" ON storage.objects;
CREATE POLICY "Admin can upload resources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resources' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can update resources" ON storage.objects;
CREATE POLICY "Admin can update resources"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'resources' AND public.is_admin())
WITH CHECK (bucket_id = 'resources' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can delete resources" ON storage.objects;
CREATE POLICY "Admin can delete resources"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resources' AND public.is_admin());

-- 8. Harden increment_total_routes_created() with ownership check
CREATE OR REPLACE FUNCTION public.increment_total_routes_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot increment routes for other users';
  END IF;

  UPDATE onboarding_submissions
  SET total_routes_created = total_routes_created + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- 9. Add missing receipts UPDATE policy
CREATE POLICY "Users can update their own receipts"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
