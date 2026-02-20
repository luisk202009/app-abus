
-- 1. Add crm_tag column to onboarding_submissions
ALTER TABLE public.onboarding_submissions
ADD COLUMN crm_tag text;

-- 2. Create document_comments table
CREATE TABLE public.document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.user_documents(id) ON DELETE CASCADE,
  author_email text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

-- 4. Admin can manage all comments
CREATE POLICY "Admin can manage comments"
  ON public.document_comments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Users can view comments on their own documents
CREATE POLICY "Users can view comments on their docs"
  ON public.document_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_documents ud
      WHERE ud.id = document_comments.document_id
        AND ud.user_id = auth.uid()
    )
  );

-- 6. Admin RLS policy for reading all user_documents
CREATE POLICY "Admin can view all documents"
  ON public.user_documents FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 7. Admin can update any user document status
CREATE POLICY "Admin can update all documents"
  ON public.user_documents FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. Admin can view all onboarding_submissions
CREATE POLICY "Admin can view all submissions"
  ON public.onboarding_submissions FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 9. Admin can view all user_active_routes
CREATE POLICY "Admin can view all active routes"
  ON public.user_active_routes FOR SELECT
  TO authenticated
  USING (public.is_admin());
