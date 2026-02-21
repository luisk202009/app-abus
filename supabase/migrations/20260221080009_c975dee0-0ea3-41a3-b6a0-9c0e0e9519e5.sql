-- Fix: Add storage policies for admin and partner access to user-documents bucket

-- Admin can view all user documents in storage
CREATE POLICY "Admin can view all user documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' 
  AND is_admin()
);

-- Admin can update user documents in storage
CREATE POLICY "Admin can update user documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-documents' AND is_admin())
WITH CHECK (bucket_id = 'user-documents' AND is_admin());

-- Admin can delete user documents in storage
CREATE POLICY "Admin can delete user documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-documents' AND is_admin());

-- Partners can view assigned user documents in storage
CREATE POLICY "Partners can view assigned user documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND is_assigned_to_partner(
    ((storage.foldername(name))[1])::uuid
  )
);