
## Plan: Portal del Abogado en `/portal-abogado`

### Resumen
Nueva ruta protegida y completamente independiente del Dashboard del usuario. Solo accesible para usuarios cuyo `user_id` exista en la tabla `lawyers`. Incluye 3 secciones navegables por tabs: Mis Casos, Mis Servicios y Mi Perfil. Reutiliza patrones existentes del `PartnerDashboard` (header con logo, layout simple, redirect-on-unauthorized).

---

### Estructura de archivos a crear

```text
src/
├── pages/
│   └── LawyerPortal.tsx                    (página principal con tabs + guard de acceso)
├── hooks/
│   └── useLawyerData.tsx                   (carga abogado actual + casos + servicios)
└── components/
    └── lawyer-portal/
        ├── LawyerPortalHeader.tsx          (logo Albus + nombre abogado + logout)
        ├── LawyerCasesList.tsx             (lista de inquiries con badges de etapa)
        ├── LawyerCaseDetail.tsx            (vista detalle 2 columnas)
        ├── CaseStageSelector.tsx           (stepper/dropdown de etapas)
        ├── CaseAppointmentPanel.tsx        (columna derecha: cita + TIE + checklist)
        ├── TieChecklistEditor.tsx          (checkbox list + agregar item)
        ├── LawyerServicesTab.tsx           (lista + formulario servicios)
        └── LawyerProfileTab.tsx            (formulario editable del perfil)
```

### Modificación
- `src/App.tsx`: registrar nueva ruta `<Route path="/portal-abogado" element={<LawyerPortal />} />`.

---

### Sección 1 — "Mis Casos"

**Lista (`LawyerCasesList.tsx`)**
- Query: `lawyer_inquiries` filtrado por `lawyer_id` del abogado actual, con LEFT JOIN a `case_management` (vía relación por `inquiry_id`) y a `onboarding_submissions` (vía `submission_id` o `user_id`) para obtener nombre/email del usuario.
- Cada card: nombre, fecha (`created_at`), preview del `message` (truncado a 120 chars), badge de etapa.
- Mapeo de etapas → colores (Tailwind, respetando paleta B&N + acentos sutiles):
  - `por_presentar` → gris (`bg-muted text-muted-foreground`)
  - `en_tramite` → azul (`bg-blue-100 text-blue-800`)
  - `requerimiento` → naranja (`bg-orange-100 text-orange-800`)
  - `resuelto` → verde (`bg-green-100 text-green-800`)
- Click en card → setSelectedInquiryId → renderiza `LawyerCaseDetail`.

**Detalle (`LawyerCaseDetail.tsx`) — Grid 2 columnas en desktop, stack en móvil**

*Columna izquierda:*
- Datos del usuario (nombre, email, mensaje original).
- `CaseStageSelector`: dropdown con las 4 etapas. Al cambiar → UPDATE `case_management.stage` + `updated_at = now()` + `updated_by = auth.uid()`. Si no existe registro de `case_management` para ese inquiry, crearlo (INSERT) en el primer cambio.
- Textarea `lawyer_notes` con autosave debounced (1s) o botón "Guardar notas".

*Columna derecha (`CaseAppointmentPanel`):*
- Visible siempre, pero **deshabilitada** con overlay sutil "Disponible cuando el caso esté En trámite" si `stage !== 'en_tramite'`.
- Campos editables (todos en `case_management`):
  - `appointment_date` → date picker (shadcn Calendar + Popover, con `pointer-events-auto`).
  - `appointment_lot` → Input text.
  - `appointment_notes` → Textarea.
  - `tie_status` → Select: Pendiente / En proceso / Entregado (mapea a `pending`, `appointment_scheduled`, `card_ready` según validación de trigger existente — ver nota técnica).
  - `tie_appointment_date` → date picker.
- `TieChecklistEditor`: lista de `tie_checklist_items` filtrados por `case_id`. Cada ítem con checkbox (toggle `is_completed`). Input + botón "Agregar ítem" que inserta nueva fila con `order_index = max+1`.
- Botón "Guardar cambios" → UPDATE `case_management` con todos los campos.

---

### Sección 2 — "Mis Servicios"

`LawyerServicesTab.tsx`
- Lista de `lawyer_services` del abogado actual (cards con: tipo de servicio, descripción, precio + moneda, badge activo/inactivo).
- Botón "Nuevo servicio" → abre Sheet con formulario:
  - `service_type_id` → Select poblado desde `service_types` donde `is_active = true`.
  - `description` → Textarea.
  - `price` → Input number.
  - `currency` → Select (EUR por defecto, USD/COP opcionales).
  - `is_active` → Switch (true por defecto).
- Cada servicio existente tiene botones "Editar" (abre mismo Sheet en modo edición) y "Activar/Desactivar" (toggle `is_active`).

---

### Sección 3 — "Mi Perfil"

`LawyerProfileTab.tsx`
- Formulario con campos editables: `bio`, `phone`, `city`, `specialties` (checkboxes con SPECIALTIES const), `languages` (checkboxes con LANGUAGES const), `photo_url` (subida a bucket `avatars`, mismo patrón que perfil de usuario).
- Campos solo lectura (deshabilitados, con tooltip "Solo el admin puede modificar"): `bar_number`, `college`, `is_verified` (badge).
- Botón "Guardar cambios" → UPDATE `lawyers` WHERE `user_id = auth.uid()`.

---

### Hook `useLawyerData.tsx`

Centraliza:
- `lawyer`: registro completo del abogado actual (`SELECT * FROM lawyers WHERE user_id = auth.uid()`).
- `isLawyer`: boolean (lawyer existe).
- `isLoading`.
- `inquiries`: lista de casos con datos de usuario + case_management.
- `services`: lista de lawyer_services del abogado.
- Funciones: `refreshInquiries`, `refreshServices`, `updateLawyerProfile`, `updateCaseStage`, `updateCaseManagement`, `createService`, `updateService`, `toggleServiceActive`, `addChecklistItem`, `toggleChecklistItem`.

---

### Guard de acceso (en `LawyerPortal.tsx`)

```text
if (authLoading || lawyerLoading) → spinner
if (!user) → navigate("/")
if (!isLawyer) → navigate("/")  // no es abogado
```

---

### Notas técnicas

**RLS**: Las políticas existentes ya cubren todo lo necesario:
- `lawyers`: "Lawyers can update own profile" permite UPDATE donde `user_id = auth.uid()`.
- `lawyer_inquiries`: "Lawyers can view assigned inquiries" permite SELECT por lawyer_id propio.
- `case_management`: "Lawyers can manage assigned cases" permite ALL.
- `lawyer_services`: "Lawyers can manage own services" permite ALL.
- `tie_checklist_items`: "Lawyers can manage checklist" permite ALL.
- `onboarding_submissions`: ⚠️ las RLS actuales NO permiten al abogado leer datos de usuarios. Para mostrar nombre/email del cliente en la lista de casos, haremos el JOIN desde el lado del cliente: primero leer `lawyer_inquiries` (que devuelve `user_id`), luego una segunda query a `onboarding_submissions` filtrando por esos `user_id`. **Esto requerirá añadir una política RLS** que permita a abogados leer submissions de usuarios que tienen un inquiry asignado a ellos. Migración necesaria:

```sql
CREATE POLICY "Lawyers can view assigned client submissions"
ON onboarding_submissions FOR SELECT TO authenticated
USING (user_id IN (
  SELECT li.user_id FROM lawyer_inquiries li
  JOIN lawyers l ON l.id = li.lawyer_id
  WHERE l.user_id = auth.uid()
));
```

**Validación de etapas**: El esquema actual de `case_management.stage` no tiene trigger de validación. Las 4 etapas usadas serán strings: `por_presentar`, `en_tramite`, `requerimiento`, `resuelto`. Si más adelante se quiere endurecer, añadir trigger.

**Validación de `tie_status`**: El trigger `validate_tie_status` solo acepta: `pending`, `appointment_scheduled`, `fingerprints_done`, `card_ready`, `collected`. Mapearemos la UI:
- "Pendiente" → `pending`
- "En proceso" → `appointment_scheduled`
- "Entregado" → `collected`

**Logout**: Reutiliza `signOut()` del hook `useAuth` y redirige a `/`.

**Foto de perfil**: Sube a bucket `avatars` (público) en path `lawyers/{user_id}.jpg`, guarda URL pública en `lawyers.photo_url`.

**Date picker**: shadcn Calendar dentro de Popover con `className="p-3 pointer-events-auto"`.

---

### Lo que NO cambia
- Dashboard del usuario, sidebar interno, secciones existentes.
- Admin panel y `AdminLawyersTab` (gestión de `is_verified`, `bar_number`, `college`).
- La sección de Abogados en el Dashboard del usuario (creada anteriormente).
- Tablas existentes: solo se añade una política RLS a `onboarding_submissions`.
