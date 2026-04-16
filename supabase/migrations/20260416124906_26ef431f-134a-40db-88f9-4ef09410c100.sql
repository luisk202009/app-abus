
-- lawyers: admin puede gestionar todos
CREATE POLICY "Admin can manage lawyers" ON public.lawyers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- service_types: admin puede gestionar
CREATE POLICY "Admin can manage service types" ON public.service_types FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- lawyer_inquiries: admin puede ver todos y actualizar
CREATE POLICY "Admin can view all inquiries" ON public.lawyer_inquiries FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admin can update inquiries" ON public.lawyer_inquiries FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- case_management: admin puede gestionar todos
CREATE POLICY "Admin can manage all cases" ON public.case_management FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- tie_checklist_items: admin puede gestionar todos
CREATE POLICY "Admin can manage all checklist items" ON public.tie_checklist_items FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
