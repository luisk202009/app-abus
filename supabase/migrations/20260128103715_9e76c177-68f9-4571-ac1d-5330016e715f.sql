-- Enable RLS on route tables
ALTER TABLE route_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_route_progress ENABLE ROW LEVEL SECURITY;

-- Policies for templates (public read)
CREATE POLICY "Anyone can view route templates"
ON route_templates FOR SELECT USING (true);

CREATE POLICY "Anyone can view route template steps"
ON route_template_steps FOR SELECT USING (true);

-- Policies for user active routes
CREATE POLICY "Users can view their active routes"
ON user_active_routes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their active routes"
ON user_active_routes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their active routes"
ON user_active_routes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their active routes"
ON user_active_routes FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for user route progress
CREATE POLICY "Users can view their route progress"
ON user_route_progress FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_active_routes 
    WHERE id = user_route_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their route progress"
ON user_route_progress FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_active_routes 
    WHERE id = user_route_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their route progress"
ON user_route_progress FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_active_routes 
    WHERE id = user_route_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_active_routes 
    WHERE id = user_route_id AND user_id = auth.uid()
  )
);

-- Add max_routes column to plans
ALTER TABLE plans ADD COLUMN max_routes integer NOT NULL DEFAULT 1;

-- Insert initial route templates
INSERT INTO route_templates (name, description, country, required_savings, estimated_cost)
VALUES 
  ('Nómada Digital', 'Visado para trabajadores remotos con ingresos estables desde cualquier parte del mundo', 'España', '€10,000+', '€800-€1,200'),
  ('Estudiante', 'Visa de estudios para cursos universitarios o de formación de larga duración', 'España', '€6,000+', '€400-€600'),
  ('Emprendedor', 'Visa para emprendedores que desean iniciar su propio negocio en España', 'España', '€25,000+', '€1,500-€2,500'),
  ('Arraigo Social', 'Residencia por vínculos familiares, laborales o sociales en España', 'España', '€3,000+', '€300-€500');

-- Insert steps for each template
-- Nómada Digital steps
INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Preparar documentación base', 'Pasaporte vigente, antecedentes penales, certificado médico', 1
FROM route_templates WHERE name = 'Nómada Digital';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Demostrar ingresos remotos', 'Contratos de trabajo remoto o facturas de clientes (mín. €2,520/mes)', 2
FROM route_templates WHERE name = 'Nómada Digital';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Seguro médico', 'Contratar seguro médico privado con cobertura completa en España', 3
FROM route_templates WHERE name = 'Nómada Digital';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Solicitar cita consular', 'Agendar cita en el consulado español de tu país de residencia', 4
FROM route_templates WHERE name = 'Nómada Digital';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Entrevista consular', 'Asistir a la entrevista con toda la documentación', 5
FROM route_templates WHERE name = 'Nómada Digital';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Obtener TIE', 'Una vez en España, solicitar la Tarjeta de Identidad de Extranjero', 6
FROM route_templates WHERE name = 'Nómada Digital';

-- Estudiante steps
INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Carta de admisión', 'Obtener carta de admisión de una institución educativa española', 1
FROM route_templates WHERE name = 'Estudiante';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Demostrar solvencia económica', 'Certificado bancario con fondos suficientes para la estancia', 2
FROM route_templates WHERE name = 'Estudiante';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Seguro médico estudiantil', 'Contratar seguro médico válido para estudiantes', 3
FROM route_templates WHERE name = 'Estudiante';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Solicitar visa de estudios', 'Presentar solicitud en el consulado con toda la documentación', 4
FROM route_templates WHERE name = 'Estudiante';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Empadronamiento', 'Registrarse en el padrón municipal al llegar a España', 5
FROM route_templates WHERE name = 'Estudiante';

-- Emprendedor steps
INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Plan de negocio', 'Elaborar un plan de negocio detallado y viable', 1
FROM route_templates WHERE name = 'Emprendedor';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Demostrar capital', 'Certificar disponibilidad de capital para la inversión', 2
FROM route_templates WHERE name = 'Emprendedor';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Informe favorable', 'Obtener informe favorable de la Oficina Económica y Comercial', 3
FROM route_templates WHERE name = 'Emprendedor';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Solicitar visa', 'Presentar solicitud de visa de emprendedor', 4
FROM route_templates WHERE name = 'Emprendedor';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Constituir empresa', 'Crear la sociedad mercantil en España', 5
FROM route_templates WHERE name = 'Emprendedor';

-- Arraigo Social steps
INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Demostrar permanencia', 'Acreditar 3 años de residencia continuada en España', 1
FROM route_templates WHERE name = 'Arraigo Social';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Vínculos familiares o sociales', 'Documentar vínculos con ciudadanos españoles o residentes', 2
FROM route_templates WHERE name = 'Arraigo Social';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Contrato de trabajo', 'Obtener oferta o contrato de trabajo de al menos 1 año', 3
FROM route_templates WHERE name = 'Arraigo Social';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Informe de integración', 'Obtener informe de arraigo del ayuntamiento', 4
FROM route_templates WHERE name = 'Arraigo Social';

INSERT INTO route_template_steps (template_id, title, description, step_order)
SELECT id, 'Solicitar autorización', 'Presentar solicitud de autorización de residencia', 5
FROM route_templates WHERE name = 'Arraigo Social';