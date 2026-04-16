

# Plan: Tres nuevas pestañas en el Admin Panel

## Resumen
Agregar pestañas "Abogados", "Tipos de Servicio" y "Leads Jurídicos" al panel de administración, siguiendo el patrón existente de los otros tabs (tabla + acciones + drawer/modal).

## Requisitos previos — Migraciones de base de datos

### 1. Políticas RLS faltantes
Las tablas `lawyers`, `service_types` y `lawyer_inquiries` no tienen políticas para que el admin pueda gestionar registros. Se necesitan:

```sql
-- lawyers: admin puede ver todos, insertar, actualizar y eliminar
CREATE POLICY "Admin can manage lawyers" ON lawyers FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- service_types: admin puede insertar, actualizar, eliminar
CREATE POLICY "Admin can manage service types" ON service_types FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- lawyer_inquiries: admin puede ver todos y actualizar
CREATE POLICY "Admin can view all inquiries" ON lawyer_inquiries FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "Admin can update inquiries" ON lawyer_inquiries FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- case_management: admin puede insertar
CREATE POLICY "Admin can manage all cases" ON case_management FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- tie_checklist_items: admin puede insertar
CREATE POLICY "Admin can manage all checklist items" ON tie_checklist_items FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
```

## Archivos a crear

### 1. `src/components/admin/AdminLawyersTab.tsx`
- Consulta `lawyers` con `supabase.from("lawyers").select("*")`.
- Tabla con columnas: avatar (círculo con `photo_url` o iniciales), nombre, ciudad, colegio, especialidades (badges), estado (badges verde/gris para verificado/activo).
- Botones inline "Verificar" y "Activar/Desactivar" que hacen `.update()` con toggle.
- Botón "Nuevo abogado" que abre un Drawer con formulario: nombre, email, teléfono, número colegiado, colegio, ciudad, bio, especialidades (checkboxes: regularización, arraigos, recursos, nómada digital), idiomas (checkboxes: español, inglés, francés, árabe). Inserta con `is_verified = false`.

### 2. `src/components/admin/AdminServiceTypesTab.tsx`
- Consulta `service_types` con `.select("*")`.
- Tabla con: nombre, slug, descripción, activo (badge).
- Botón "Nuevo tipo" con drawer/dialog: nombre, descripción. El slug se genera automáticamente del nombre.
- Edición inline: al hacer clic en "Editar", los campos de la fila se convierten en inputs.
- Toggle activar/desactivar con `.update({ is_active })`.

### 3. `src/components/admin/AdminLegalLeadsTab.tsx`
- Consulta `lawyer_inquiries` con datos del usuario vía query separada a `onboarding_submissions` (por `user_id`), y nombre del abogado vía query a `lawyers` (por `lawyer_id`).
- Filtro superior por estado (todos, pending, assigned, active, closed).
- Tabla con: fecha, nombre usuario, mensaje (80 chars), abogado asignado, estado (badge con colores: pending=gris, assigned=azul, active=verde, closed=negro).
- Botón "Asignar" en filas pending: abre modal con dropdown de abogados (`lawyers` donde `is_verified=true` y `is_active=true`). Al asignar:
  1. Actualiza `lawyer_inquiries`: `lawyer_id`, `assigned_by`, `assigned_at`, `status = 'assigned'`.
  2. Inserta en `case_management`: `inquiry_id`, `stage = 'por_presentar'`.
  3. Inserta 6 ítems en `tie_checklist_items`: pasaporte original, TIE provisional, foto carnet x2, tasa 790-012 pagada, formulario EX-17, justificante de cita.

## Archivo a modificar

### 4. `src/pages/Admin.tsx`
- Importar los 3 nuevos componentes.
- Agregar iconos: `Scale` (abogados), `Briefcase` (tipos servicio), `Inbox` (leads).
- Agregar 3 `TabsTrigger` y 3 `TabsContent` al final de las pestañas existentes.

## Lo que NO cambia
- Las pestañas existentes (Analytics, Usuarios, Planes, Recursos, Rutas, Documentos).
- Las Edge Functions y la lógica de checkout.
- El portal de partners ni el dashboard de usuarios.

