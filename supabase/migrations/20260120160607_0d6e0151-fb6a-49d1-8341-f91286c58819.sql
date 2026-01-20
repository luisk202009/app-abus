-- Create waitlist table for coming soon countries
CREATE TABLE public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  country text NOT NULL,
  accepts_updates boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert to waitlist
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (true);

-- Only admins can read waitlist (via service role)
CREATE POLICY "Admins can read waitlist"
ON public.waitlist
FOR SELECT
USING (false);

-- Create plans table for pricing management
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  interval text NOT NULL DEFAULT 'month',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  stripe_price_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read active plans (for pricing page)
CREATE POLICY "Anyone can view active plans"
ON public.plans
FOR SELECT
USING (is_active = true);

-- Create resources table
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_url text,
  file_name text,
  plan_requirement text NOT NULL DEFAULT 'free',
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Anyone can view active resources
CREATE POLICY "Anyone can view active resources"
ON public.resources
FOR SELECT
USING (is_active = true);

-- Insert default plans
INSERT INTO public.plans (name, slug, price_cents, features)
VALUES 
  ('Gratis', 'free', 0, '["Análisis de perfil migratorio", "Hoja de ruta personalizada", "Checklist de tareas", "Soporte por email"]'),
  ('Pro', 'pro', 999, '["Todo del plan gratuito", "Bóveda de documentos segura", "Generación automática de formularios", "Tasa 790 pre-rellenada", "Soporte prioritario"]');

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true);

-- Storage policies for resources bucket
CREATE POLICY "Public can view resources files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resources');

CREATE POLICY "Admin can upload resources"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resources');