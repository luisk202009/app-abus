-- 1. Agregar columna total_routes_created
ALTER TABLE onboarding_submissions 
ADD COLUMN IF NOT EXISTS total_routes_created INTEGER NOT NULL DEFAULT 0;

-- 2. Inicializar contador para usuarios existentes basado en rutas ya creadas
UPDATE onboarding_submissions os
SET total_routes_created = (
  SELECT COUNT(*) 
  FROM user_active_routes uar 
  WHERE uar.user_id = os.user_id
);

-- 3. Crear trigger para incrementar contador automáticamente al crear ruta
CREATE OR REPLACE FUNCTION public.increment_total_routes_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE onboarding_submissions
  SET total_routes_created = total_routes_created + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Crear el trigger en user_active_routes
DROP TRIGGER IF EXISTS on_route_created ON user_active_routes;
CREATE TRIGGER on_route_created
AFTER INSERT ON user_active_routes
FOR EACH ROW
EXECUTE FUNCTION public.increment_total_routes_created();

-- 5. Política DELETE para user_route_progress (permitir a usuarios eliminar su progreso)
CREATE POLICY "Users can delete their route progress"
ON user_route_progress FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_active_routes
    WHERE user_active_routes.id = user_route_progress.user_route_id
    AND user_active_routes.user_id = auth.uid()
  )
);