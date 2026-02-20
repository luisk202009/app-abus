

# Plan: F03 - Appointment & TIE Management Module

## Resumen

Crear un modulo post-aprobacion en el dashboard para gestionar la cita de huellas y el seguimiento de la Tarjeta de Identidad de Extranjero (TIE). Incluye tracker de cita, checklist policial, estado del TIE, y notificacion celebratoria cuando el Partner/Admin marca la solicitud como "Aprobada".

---

## 1. Nueva tabla: `user_appointments`

Migracion SQL para almacenar datos de cita y estado TIE por usuario:

```sql
CREATE TABLE user_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  appointment_date DATE,
  appointment_time TEXT,
  police_station_address TEXT,
  lot_number TEXT,
  tie_status TEXT DEFAULT 'pending',
  application_status TEXT DEFAULT 'en_tramite',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_appointments ENABLE ROW LEVEL SECURITY;
```

**Valores de `application_status`**: `en_tramite`, `aprobada`, `denegada`
**Valores de `tie_status`**: `pending`, `appointment_scheduled`, `fingerprints_done`, `card_ready`, `collected`

**RLS Policies:**
- Users can CRUD their own records (`user_id = auth.uid()`)
- Admin can view/update all records (`is_admin()`)
- Partners can view/update assigned user records (`is_assigned_to_partner(user_id)`)

---

## 2. Nuevo archivo: `src/components/dashboard/AppointmentManager.tsx`

Componente principal con tres secciones, usando una paleta de tonos verdes/dorados para reflejar el resultado positivo:

### Seccion A: Estado de Solicitud
- Banner celebratorio verde cuando `application_status === 'aprobada'`:
  "Enhorabuena! Tu residencia ha sido concedida. Empecemos con la gestion de tu TIE."
- Estado normal (en tramite): Informacion de espera con icono reloj

### Seccion B: Appointment Tracker
- Campos editables: Fecha (DatePicker), Hora (Input), Direccion comisaria (Input)
- Countdown: "Faltan X dias para tu cita de huellas" (solo si fecha > hoy)
- Boton "Guardar Cita" que persiste en `user_appointments`

### Seccion C: TIE Status Tracker
- Campo "Numero de Lote" editable
- Info box con enlace externo: "Consulta aqui si tu tarjeta esta lista para recoger" -> enlace al sede electronica
- Progreso visual con steps: Solicitud Aprobada > Cita Programada > Huellas Tomadas > Tarjeta Lista > Recogida

### Seccion D: Checklist Policial (TIE)
Checklist estatica de documentos necesarios para la cita:
- Formulario EX-17 (con enlace a descarga oficial)
- Tasa 790-012 (con boton que llama al generador existente `generateTasa790PDF`)
- Resolucion de concesion (con nota: "Descargable desde la Boveda si tu abogado la subio")
- Certificado de Empadronamiento (nota: "Actualizado, maximo 3 meses")
- Cada item con checkbox local (no persiste, visual de referencia)

---

## 3. Modificar: `src/components/dashboard/DashboardSidebar.tsx`

Agregar nuevo item de navegacion despues de "Simulador Fiscal":

```typescript
{ id: "appointment", label: "Gestion de Cita", icon: <CalendarCheck className="w-5 h-5" /> }
```

---

## 4. Modificar: `src/pages/Dashboard.tsx`

Agregar caso en `renderContent()`:

```typescript
case "appointment":
  if (!isPremium) {
    return <PremiumGate feature="Gestion de Cita" />;
  }
  return <AppointmentManager userId={user?.id} />;
```

Agregar logica para detectar cuando `application_status` cambia a `aprobada` y disparar confetti + toast celebratorio.

---

## 5. Interaccion Legal Team (Partner/Admin)

### Modificar: `src/components/partner/PartnerClientList.tsx`

Agregar un nuevo estado al dropdown de `case_status`: "aprobada" (con icono de check verde).

Cuando el Partner cambia el estado a "aprobada":
- Actualizar `partner_assignments.case_status` a `aprobada`
- Insertar/actualizar `user_appointments` del usuario con `application_status = 'aprobada'`

### Modificar: `src/components/admin/AdminUsersTab.tsx`

Agregar una accion similar para que el Admin pueda marcar una solicitud como "Aprobada" directamente.

---

## 6. Notificacion Celebratoria

### Modificar: `src/hooks/useNotifications.tsx`

Agregar deteccion de `application_status === 'aprobada'` en `user_appointments`:
- Mostrar banner verde: "Enhorabuena! Tu residencia ha sido concedida."
- Disparar confetti automaticamente al entrar al dashboard si el estado cambio recientemente

---

## Archivos a Crear

| Archivo | Proposito |
|---------|-----------|
| `src/components/dashboard/AppointmentManager.tsx` | Modulo completo de gestion cita + TIE |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/DashboardSidebar.tsx` | Agregar nav item "Gestion de Cita" |
| `src/pages/Dashboard.tsx` | Agregar case "appointment", premium gate, confetti trigger |
| `src/components/partner/PartnerClientList.tsx` | Agregar estado "aprobada" al dropdown |
| `src/components/admin/AdminUsersTab.tsx` | Agregar accion "Marcar como Aprobada" |
| `src/hooks/useNotifications.tsx` | Detectar aprobacion y notificar |

## Migracion SQL

| Migracion | Proposito |
|-----------|-----------|
| `user_appointments` table + RLS | Almacenar datos de cita y estado TIE |

---

## Detalles Tecnicos

### Paleta de colores (Success theme)

Las clases de color para este modulo usan tonos verdes/dorados dentro de Tailwind:
- Banners de exito: `bg-emerald-50 border-emerald-200 text-emerald-800`
- Progress steps completados: `bg-emerald-500`
- Iconos de celebracion: `text-amber-500` (gold)
- Fondo general del modulo: mantiene `bg-background` con acentos verdes

### Appointment Countdown

```typescript
const daysUntilAppointment = Math.ceil(
  (appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
);
// "Faltan 12 dias para tu cita de huellas"
```

### TIE Progress Steps

```typescript
const TIE_STEPS = [
  { id: "aprobada", label: "Solicitud Aprobada", icon: CheckCircle },
  { id: "appointment_scheduled", label: "Cita Programada", icon: Calendar },
  { id: "fingerprints_done", label: "Huellas Tomadas", icon: Fingerprint },
  { id: "card_ready", label: "Tarjeta Lista", icon: CreditCard },
  { id: "collected", label: "Recogida", icon: PartyPopper },
];
```

### Enlace externo TIE

URL oficial para consulta de estado: `https://sede.administracionespublicas.gob.es/`

### Confetti en aprobacion

Reutilizar el componente `SuccessConfetti` existente pero con colores verdes/dorados en lugar de B&W:

```typescript
const celebrationColors = ["#10b981", "#059669", "#f59e0b", "#d97706", "#ffffff"];
```

---

## Orden de Implementacion

1. Migracion SQL: tabla `user_appointments` + RLS
2. `AppointmentManager.tsx` - Componente completo
3. `DashboardSidebar.tsx` - Nav item
4. `Dashboard.tsx` - Routing, premium gate, confetti trigger
5. `PartnerClientList.tsx` + `AdminUsersTab.tsx` - Accion "Aprobada"
6. `useNotifications.tsx` - Deteccion de aprobacion

