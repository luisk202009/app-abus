-- 1. Agregar columna difficulty a route_templates
ALTER TABLE route_templates
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'media';

-- 2. RLS para route_templates (admin CRUD)
CREATE POLICY "Admin can insert route templates"
ON route_templates FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admin can update route templates"
ON route_templates FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin can delete route templates"
ON route_templates FOR DELETE
USING (is_admin());

-- 3. RLS para route_template_steps (admin CRUD)
CREATE POLICY "Admin can insert route template steps"
ON route_template_steps FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admin can update route template steps"
ON route_template_steps FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin can delete route template steps"
ON route_template_steps FOR DELETE
USING (is_admin());