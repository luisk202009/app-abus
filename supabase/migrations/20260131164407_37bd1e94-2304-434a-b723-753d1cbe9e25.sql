-- Tabla para notas en pasos (estilo Asana)
CREATE TABLE step_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES user_route_progress(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para step_notes
ALTER TABLE step_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
ON step_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_route_progress urp
    JOIN user_active_routes uar ON urp.user_route_id = uar.id
    WHERE urp.id = step_notes.step_id
    AND uar.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own notes"
ON step_notes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM user_route_progress urp
    JOIN user_active_routes uar ON urp.user_route_id = uar.id
    WHERE urp.id = step_notes.step_id
    AND uar.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own notes"
ON step_notes FOR DELETE
USING (user_id = auth.uid());

-- Tabla para documentos adjuntos a pasos
CREATE TABLE step_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES user_route_progress(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para step_attachments
ALTER TABLE step_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their step attachments"
ON step_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_route_progress urp
    JOIN user_active_routes uar ON urp.user_route_id = uar.id
    WHERE urp.id = step_attachments.step_id
    AND uar.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their step attachments"
ON step_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_route_progress urp
    JOIN user_active_routes uar ON urp.user_route_id = uar.id
    WHERE urp.id = step_attachments.step_id
    AND uar.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their step attachments"
ON step_attachments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_route_progress urp
    JOIN user_active_routes uar ON urp.user_route_id = uar.id
    WHERE urp.id = step_attachments.step_id
    AND uar.user_id = auth.uid()
  )
);