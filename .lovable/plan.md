

# Plan: E05 - Portal de Partners Legales y Sistema de Asignacion

## Resumen

Crear un portal para abogados partners con dashboard propio, sistema de asignacion de clientes desde el admin, y flujo de colaboracion con comentarios y notificaciones. Todo protegido con RLS a nivel de base de datos.

---

## 1. Migracion de Base de Datos

### Nuevas tablas y funciones:

**Tabla `partner_assignments`** - Vincula partners con usuarios asignados:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid PK | ID unico |
| partner_id | uuid NOT NULL | Referencia a auth.users (el partner) |
| user_id | uuid NOT NULL | Referencia a auth.users (el usuario asignado) |
| case_status | text | 'en_revision', 'listo_presentar', 'requiere_accion' (default: 'en_revision') |
| assigned_at | timestamptz | Fecha de asignacion |
| notes | text | Notas del partner sobre el caso |

Constraint UNIQUE en (partner_id, user_id).

**Tabla `partners`** - Registro de partners con nombre de equipo:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid PK | ID unico |
| user_id | uuid NOT NULL UNIQUE | Referencia a auth.users |
| team_name | text NOT NULL | Nombre del equipo legal (ej: "LegalTeam A") |
| created_at | timestamptz | Fecha de creacion |

**Funcion `is_partner()`** - SECURITY DEFINER para verificar si el usuario es partner:

```sql
CREATE OR REPLACE FUNCTION public.is_partner(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partners WHERE user_id = _user_id
  )
$$;
```

**Funcion `is_assigned_to_partner()`** - Verifica si un user_id esta asignado al partner actual:

```sql
CREATE OR REPLACE FUNCTION public.is_assigned_to_partner(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_assignments
    WHERE partner_id = auth.uid() AND user_id = _user_id
  )
$$;
```

### Politicas RLS:

**`partners`:**
- SELECT: `is_admin()` OR `user_id = auth.uid()`
- INSERT/UPDATE/DELETE: `is_admin()`

**`partner_assignments`:**
- SELECT: `is_admin()` OR `partner_id = auth.uid()`
- INSERT/DELETE: `is_admin()`
- UPDATE: `partner_id = auth.uid()` (para cambiar case_status y notes)

**Politicas adicionales en tablas existentes:**

- `user_documents` - Nuevo SELECT policy: "Partners can view assigned user docs" con `is_assigned_to_partner(user_id)`
- `user_documents` - Nuevo UPDATE policy: "Partners can update assigned user doc status" con `is_assigned_to_partner(user_id)`
- `document_comments` - Nuevo INSERT policy: "Partners can comment on assigned user docs" con check de que el doc pertenece a un usuario asignado
- `document_comments` - Nuevo SELECT policy: "Partners can view comments on assigned user docs"
- `onboarding_submissions` - Nuevo SELECT policy: "Partners can view assigned user submissions" con `is_assigned_to_partner(user_id)`
- `user_active_routes` - Nuevo SELECT policy: "Partners can view assigned user routes" con `is_assigned_to_partner(user_id)`

---

## 2. Nuevos Archivos

### `src/pages/PartnerDashboard.tsx`

Pagina principal del portal de partners. Estructura:

- Header con logo Albus y nombre del equipo legal
- Stats cards: Total asignados, Revisiones completadas, Pendientes
- Tabla de clientes activos con columnas: Nombre, Email, Ruta, Estado del caso, Deadline, Acciones
- Panel de documentos del cliente seleccionado (read-only files, write status/comments)
- Status Switcher: dropdown para cambiar entre "En Revision", "Listo para Presentar", "Requiere Accion"

### `src/components/partner/PartnerClientList.tsx`

Tabla de clientes asignados con:
- Nombre, email, ruta activa, estado del caso
- Badge de color segun estado (azul/verde/rojo)
- Click para expandir panel de documentos

### `src/components/partner/PartnerDocumentReview.tsx`

Panel de revision de documentos de un cliente:
- Lista de documentos con status badges (read-only files)
- Dropdown para cambiar status del documento
- Formulario para agregar comentarios
- Historial de comentarios existentes

### `src/components/partner/PartnerSummaryStats.tsx`

Cards de resumen: Total asignados, Revisiones completadas ("Listo para Presentar"), Pendientes ("En Revision" + "Requiere Accion").

### `src/hooks/usePartnerData.tsx`

Hook para cargar datos del partner: assignments, documentos de clientes asignados, rutas activas.

---

## 3. Archivos a Modificar

### `src/App.tsx`

Agregar ruta `/partner/dashboard` con componente `PartnerDashboard`.

### `src/components/admin/AdminUsersTab.tsx`

Agregar columna "Partner" a la tabla de usuarios:
- Dropdown "Asignar Partner" con lista de partners disponibles (consultados de tabla `partners`)
- Al seleccionar, insertar en `partner_assignments`
- Mostrar partner asignado actual como Badge

### `src/hooks/useNotifications.tsx`

Agregar check para nuevos comentarios de partners en documentos del usuario:
- Consultar `document_comments` donde `document_id` pertenece a documentos del usuario
- Si hay comentarios recientes (ultimas 48h), agregar notificacion tipo "partner_comment"

### `src/hooks/useAuth.tsx`

Agregar campo `isPartner` al contexto, consultando la tabla `partners` al cargar sesion.

---

## 4. Flujo de Colaboracion

```text
Admin asigna usuario a Partner
       |
       v
Partner ve usuario en su dashboard
       |
       v
Partner revisa documentos (read-only archivos)
       |
       v
Partner cambia status de docs y deja comentarios
       |
       v
Usuario ve notificacion en su dashboard
       |
       v
Partner marca caso como "Listo para Presentar"
```

---

## 5. Seguridad

- Partners SOLO ven usuarios explicitamente asignados via `partner_assignments`
- Funciones SECURITY DEFINER evitan recursion RLS
- Partners NO pueden eliminar documentos ni modificar archivos, solo status y comentarios
- Admin es el unico que puede crear partners y asignar usuarios
- Mock inicial: Se insertaran 2 partners de prueba ("LegalTeam A", "LegalTeam B") directamente en la tabla

---

## Detalles Tecnicos

### PartnerDashboard - Proteccion de ruta

```typescript
// Verifica que el usuario sea partner
const { user } = useAuth();
const [isPartner, setIsPartner] = useState(false);

useEffect(() => {
  if (!user) { navigate("/"); return; }
  supabase.from("partners").select("id")
    .eq("user_id", user.id).maybeSingle()
    .then(({ data }) => {
      if (!data) navigate("/");
      else setIsPartner(true);
    });
}, [user]);
```

### AdminUsersTab - Dropdown de asignacion

```typescript
// Fetch partners list
const { data: partners } = await supabase
  .from("partners").select("id, user_id, team_name");

// Fetch existing assignments
const { data: assignments } = await supabase
  .from("partner_assignments").select("partner_id, user_id");
```

### Case Status Badge colors

| Status | Color | Emoji |
|--------|-------|-------|
| en_revision | Azul (blue-100/blue-800) | -- |
| listo_presentar | Verde (green-100/green-800) | -- |
| requiere_accion | Rojo (red-100/red-800) | -- |

---

## Orden de Implementacion

1. Migracion SQL (tablas, funciones, RLS policies)
2. `usePartnerData.tsx` hook
3. `PartnerSummaryStats.tsx`, `PartnerClientList.tsx`, `PartnerDocumentReview.tsx` components
4. `PartnerDashboard.tsx` page
5. Modificar `App.tsx` con nueva ruta
6. Modificar `AdminUsersTab.tsx` con dropdown de asignacion
7. Modificar `useNotifications.tsx` para comentarios de partners
8. Insertar mock partners en la tabla

