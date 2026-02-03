-- Create user_documents table for Document Vault
CREATE TABLE public.user_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'waiting',
  validation_message TEXT,
  route_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create validation trigger for category values
CREATE OR REPLACE FUNCTION public.validate_user_document_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category NOT IN ('identidad', 'residencia', 'antecedentes') THEN
    RAISE EXCEPTION 'Invalid category. Must be identidad, residencia, or antecedentes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_category_trigger
  BEFORE INSERT OR UPDATE ON public.user_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_document_category();

-- Create validation trigger for status values
CREATE OR REPLACE FUNCTION public.validate_user_document_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('waiting', 'analyzing', 'valid', 'error') THEN
    RAISE EXCEPTION 'Invalid status. Must be waiting, analyzing, valid, or error';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_status_trigger
  BEFORE INSERT OR UPDATE ON public.user_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_document_status();

-- Create validation trigger for route_type values
CREATE OR REPLACE FUNCTION public.validate_user_document_route_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.route_type IS NOT NULL AND NEW.route_type NOT IN ('regularizacion2026', 'arraigos') THEN
    RAISE EXCEPTION 'Invalid route_type. Must be regularizacion2026 or arraigos';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_route_type_trigger
  BEFORE INSERT OR UPDATE ON public.user_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_document_route_type();

-- Enable RLS
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own documents"
ON public.user_documents FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own documents"
ON public.user_documents FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own documents"
ON public.user_documents FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
ON public.user_documents FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Indexes for faster queries
CREATE INDEX idx_user_documents_user_id ON public.user_documents(user_id);
CREATE INDEX idx_user_documents_route_type ON public.user_documents(route_type);
CREATE INDEX idx_user_documents_status ON public.user_documents(status);