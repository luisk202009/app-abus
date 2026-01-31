-- Update the Regularización template with 2026 data
UPDATE route_templates
SET 
  name = 'Regularización Extraordinaria 2026',
  description = 'Nueva vía de regularización con arraigo social de 2 años bajo la reforma de extranjería 2026.',
  estimated_cost = '200 - 500€',
  required_savings = 'Variable',
  difficulty = 'facil'
WHERE id = '57b27d4a-190b-4ece-a1c3-de1859d58217';

-- Delete existing steps for this template
DELETE FROM route_template_steps WHERE template_id = '57b27d4a-190b-4ece-a1c3-de1859d58217';

-- Insert the 5 new steps
INSERT INTO route_template_steps (template_id, step_order, title, description)
VALUES
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 1, 'Verificación de Permanencia', 
   'Conseguir empadronamiento histórico que demuestre al menos 2 años de residencia continuada en España. Solicitar en tu Ayuntamiento local.'),
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 2, 'Antecedentes Penales', 
   'Solicitar certificado de antecedentes penales de tu país de origen y apostillarlo con la Apostilla de la Haya. Algunos países requieren traducción jurada.'),
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 3, 'Prueba de Medios Económicos', 
   'Preparar contrato de trabajo (mín. 1 año, 40h/semana) o compromiso de formación acreditado. Alternativa: recursos propios demostrables.'),
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 4, 'Tasa 790-052', 
   'Generar y pagar la tasa administrativa 790-052 en una entidad bancaria colaboradora. Importe aprox: 16-20€.'),
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 5, 'Presentación Telemática', 
   'Subir todos los documentos a la plataforma Mercurio del Ministerio. Agendar cita si es requerido por tu oficina de extranjería.');