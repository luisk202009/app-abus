
## Plan: Vista de Seguimiento Jurídico en "Gestión de Cita"

### Resumen
Cuando el usuario tenga una `lawyer_inquiry` activa con un abogado asignado, mostrar una nueva sección de **Seguimiento Jurídico** en la parte superior de "Gestión de Cita". Esta vista refleja en tiempo real el progreso que el abogado registra desde el `/portal-abogado` (etapa, cita, TIE, checklist). La vista actual de gestión manual permanece debajo (los datos del abogado complementan, no reemplazan).

---

### Archivos

**Nuevo: `src/components/dashboard/LegalCaseTracker.tsx`**
Componente que recibe `userId` y se autoinstancia. Si no hay inquiry activa → no renderiza nada (return null). Si existe → renderiza la vista completa.

**Modificar: `src/components/dashboard/AppointmentManager.tsx`**
Agregar `<LegalCaseTracker userId={userId} />` justo al inicio del `<div className="space-y-6">`. No se cambia nada más.

---

### Lógica de carga (`LegalCaseTracker`)

1. Query 1: `lawyer_inquiries` filtrado por `user_id = userId` y `status IN ('assigned','active','pending')` (el cliente ya tiene la política RLS para verlo). Tomar la más reciente (`order by created_at desc limit 1`).
2. Si no hay inquiry → `return null`.
3. Query 2 (paralelo): 
   - `lawyers` por `id = inquiry.lawyer_id` (verified+active es público).
   - `case_management` por `inquiry_id = inquiry.id` (RLS "Users can view own case").
4. Query 3 (si hay case): `tie_checklist_items` por `case_id` ordenado por `order_index`.

---

### Estructura visual

**1. Card del abogado asignado** (parte superior)
- Foto circular (o iniciales) + nombre + especialidades (badges).
- Botón: `<a href="mailto:{email}">Contactar</a>` con ícono Mail.
- Si `case.appointment_date` existe y está próxima → mostrar también un sub-texto sutil "Próxima cita: [fecha]".

**2. Stepper horizontal** de las 4 etapas
- `[Por presentar] → [En trámite] → [Requerimiento] → [Resuelto]`
- Reutiliza el patrón visual del stepper TIE existente en `AppointmentManager.tsx` (círculos numerados, línea conectora).
- Etapa activa: círculo `bg-foreground text-background`.
- Etapas anteriores: checkmark verde + línea verde.
- Caso especial: si `stage === 'requerimiento'`, el círculo se pinta en naranja (no verde) para indicar pausa/atención.

**3. Banner de cita programada** (condicional: `appointment_date != null`)
- Card destacada con fondo `bg-blue-50 border-blue-200`.
- "📅 Tu cita está programada para [fecha en español, formato 'EEEE, d MMMM yyyy']"
- Si `appointment_lot`: "Lote/Turno: [lot]"
- Si `appointment_notes`: bloque de notas debajo.

**4. Estado del TIE** (condicional: `tie_status != null && tie_status !== 'pending'`)
- Badge con label legible:
  - `pending` → "Pendiente" (gris)
  - `appointment_scheduled` → "En proceso" (azul)
  - `collected` → "Entregado" (verde)
- Si `tie_appointment_date`: mostrar fecha de cita TIE.

**5. Checklist de documentos** (solo lectura, condicional: hay items)
- Card con lista de `tie_checklist_items`.
- Cada ítem: ícono check verde (si `is_completed`) o círculo gris (si no).
- Ítems completados: texto en verde con `line-through`.
- Ítems pendientes: texto en `text-muted-foreground`.
- Sin checkbox interactivo (solo el abogado los marca).

**6. Banners de estado especial**
- Si `stage === 'requerimiento'`: 
  - Card naranja: `bg-orange-50 border-orange-200`.
  - "⚠️ Tu expediente tiene un requerimiento pendiente. Tu abogado se pondrá en contacto contigo próximamente."
- Si `stage === 'resuelto'`:
  - Card verde: `bg-green-50 border-green-200`.
  - "🎉 ¡Felicidades! Tu proceso ha sido resuelto favorablemente."
  - Disparar `SuccessConfetti` (componente existente en `src/components/dashboard/SuccessConfetti.tsx`) una sola vez al montar si stage es resuelto.

---

### Mapeo de etapas y colores
```text
por_presentar  → gris   (Por presentar)
en_tramite     → azul   (En trámite)
requerimiento  → naranja(Requerimiento)
resuelto       → verde  (Resuelto)
```

### Permisos (RLS ya cubiertos, no hay migración)
- `lawyer_inquiries`: política "Users can view own inquiries" ✅
- `case_management`: política "Users can view own case" ✅
- `tie_checklist_items`: política "Users can view own checklist" ✅
- `lawyers`: política pública para verified+active ✅

### Lo que NO cambia
- La vista actual de gestión manual del TIE (steps, cita de huellas autogestionada, checklist de documentos genéricos, generador Tasa 790) permanece intacta debajo del nuevo bloque.
- Tablas, RLS, migraciones: ninguna modificación necesaria.
- Portal del abogado, sección "Abogados" del dashboard, navbar: sin cambios.
