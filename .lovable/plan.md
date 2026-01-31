
# Plan: Rediseno de Vista de Rutas con Pagina de Detalle Estilo Asana

## Resumen

Transformar la experiencia de gestion de rutas de una vista unica con checklist cambiante a una arquitectura de pagina dedicada por ruta. Cada ruta tendra su propia pagina interna con tareas expandibles estilo Asana, documentos adjuntos y sistema de notas/comentarios.

---

## Estado Actual vs. Nuevo Diseno

```text
ACTUAL                                       NUEVO
┌────────────────────────────────┐           ┌────────────────────────────────┐
│  Dashboard                     │           │  Dashboard (/dashboard)        │
│                                │           │                                │
│  ┌─────────────────────────┐   │           │  ┌─────────────────────────┐   │
│  │ Ruta 1 (seleccionada)   │   │           │  │ Ruta 1              →   │   │  Click navega
│  └─────────────────────────┘   │           │  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │           │  ┌─────────────────────────┐   │
│  │ Ruta 2                  │   │           │  │ Ruta 2              →   │   │
│  └─────────────────────────┘   │           │  └─────────────────────────────┘
│                                │           │                                │
│  ═══════════════════════════   │           └────────────────────────────────┘
│                                │                        │
│  ┌─────────────────────────┐   │                        ▼ Click
│  │ Checklist de Ruta 1     │   │           ┌────────────────────────────────┐
│  │ □ Paso 1                │   │           │  Route Detail                  │
│  │ □ Paso 2                │   │           │  (/dashboard/route/:id)        │
│  │ □ Paso 3                │   │           │                                │
│  └─────────────────────────┘   │           │  ┌─────────────────────────┐   │
│                                │           │  │ Paso 1 (expandible)     │   │
└────────────────────────────────┘           │  │   ├─ Descripcion        │   │
                                             │  │   ├─ Documentos 📎      │   │
                                             │  │   └─ Notas 💬           │   │
                                             │  └─────────────────────────┘   │
                                             │  ┌─────────────────────────┐   │
                                             │  │ Paso 2 (expandible)     │   │
                                             │  └─────────────────────────┘   │
                                             └────────────────────────────────┘
```

---

## Nueva Arquitectura de Navegacion

```text
/dashboard
    │
    ├── Vista: Lista de rutas activas (cards)
    │
    └── Click en ruta
           │
           ▼
/dashboard/route/:routeId
    │
    ├── Encabezado: Nombre ruta + progreso + pais
    │
    ├── Tabs o Secciones:
    │   ├── Tareas (checklist expandible)
    │   ├── Documentos (vincular de boveda)
    │   └── Actividad (timeline de notas)
    │
    └── Panel lateral o modal de tarea seleccionada
```

---

## Cambios de Base de Datos

### Nueva tabla: `step_notes`

Para almacenar notas/comentarios en cada paso de la ruta (estilo Asana):

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | uuid | PK |
| `step_id` | uuid | FK a user_route_progress |
| `user_id` | uuid | Autor de la nota |
| `content` | text | Contenido de la nota |
| `created_at` | timestamptz | Fecha de creacion |

### Nueva tabla: `step_attachments`

Para vincular documentos de la boveda a pasos especificos:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | uuid | PK |
| `step_id` | uuid | FK a user_route_progress |
| `document_type` | text | Tipo de documento (passport, etc.) |
| `file_url` | text | URL del archivo en storage (opcional) |
| `created_at` | timestamptz | Fecha |

---

## Componentes a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/pages/RouteDetail.tsx` | Nueva pagina dedicada para cada ruta |
| `src/components/route-detail/StepCard.tsx` | Tarjeta de paso expandible estilo Asana |
| `src/components/route-detail/StepNotes.tsx` | Seccion de notas/comentarios |
| `src/components/route-detail/StepAttachments.tsx` | Selector de documentos de boveda |
| `src/components/route-detail/RouteHeader.tsx` | Header con nombre, progreso y acciones |
| `src/components/route-detail/AttachDocumentModal.tsx` | Modal para vincular documentos |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar ruta `/dashboard/route/:routeId` |
| `src/pages/Dashboard.tsx` | Simplificar a lista de rutas + navegacion |
| `src/components/dashboard/ActiveRouteCard.tsx` | Modificar onClick para navegar |
| `src/hooks/useRoutes.tsx` | Agregar funciones para notas y adjuntos |

---

## Diseno de la Pagina de Detalle de Ruta

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Volver a mis rutas                                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Visado Nomada Digital                                    🇪🇸 Espana   ││
│  │                                                                         ││
│  │  [═══════════════════════░░░░░░░░░] 60% • 3/5 pasos completados        ││
│  │                                                            ⚙️ Gestionar ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  TAREAS                                                                     │
│  ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ ✓ Paso 1: Apostillar Antecedentes                                      ││
│  │   │                                                           ▼ expand ││
│  │   ├─────────────────────────────────────────────────────────────────────││
│  │   │ Descripcion:                                                       ││
│  │   │ El certificado debe estar apostillado por la Haya...               ││
│  │   │                                                                    ││
│  │   │ 📎 Documentos adjuntos:                                            ││
│  │   │ ┌────────────┐  ┌────────────┐                                     ││
│  │   │ │ Pasaporte  │  │ + Adjuntar │                                     ││
│  │   │ └────────────┘  └────────────┘                                     ││
│  │   │                                                                    ││
│  │   │ 💬 Notas (2):                                                      ││
│  │   │ ┌───────────────────────────────────────────────────────────────┐  ││
│  │   │ │ Ya envie el documento al consulado - hace 2 dias             │  ││
│  │   │ └───────────────────────────────────────────────────────────────┘  ││
│  │   │ ┌───────────────────────────────────────────────────────────────┐  ││
│  │   │ │ Escribe una nota...                              [Agregar]   │  ││
│  │   │ └───────────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ □ Paso 2: Contratar Seguro Medico                             ▶       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ □ Paso 3: Obtener Certificado Bancario                        ▶       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Adjuntar Documento

```text
Usuario expande paso
         │
         ▼
┌────────────────────────────────┐
│ Clic en "+ Adjuntar documento" │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│               MODAL: Adjuntar Documento                    │
│                                                            │
│  Selecciona un documento de tu boveda:                     │
│                                                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │  📄 Pasaporte           Subido ✓           [Adjuntar] ││
│  │  📄 Antecedentes        Pendiente          [Adjuntar] ││
│  │  📄 Seguro Medico       Subido ✓           [Adjuntar] ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│                                           [Cancelar]       │
└────────────────────────────────────────────────────────────┘
```

---

## Flujo de Notas Estilo Asana

```text
Usuario en paso expandido
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  💬 Notas                                                  │
│                                                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │ 👤 Tu (hace 2 dias)                                    ││
│  │ Ya envie los documentos apostillados al consulado      ││
│  │ de Barcelona.                                          ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Agregar nota...                                        ││
│  │                                                        ││
│  │ ┌────────────────────────────────────────────────────┐ ││
│  │ │ Escribe aqui tu nota o recordatorio...            │ ││
│  │ └────────────────────────────────────────────────────┘ ││
│  │                                         [Agregar]      ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

---

## Seccion Tecnica

### Migracion SQL

```sql
-- Tabla para notas en pasos
CREATE TABLE step_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES user_route_progress(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE POLICY "Users can manage their step attachments"
ON step_attachments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_route_progress urp
    JOIN user_active_routes uar ON urp.user_route_id = uar.id
    WHERE urp.id = step_attachments.step_id
    AND uar.user_id = auth.uid()
  )
);
```

### Nueva Ruta en App.tsx

```typescript
import RouteDetail from "./pages/RouteDetail";

// En Routes:
<Route path="/dashboard/route/:routeId" element={<RouteDetail />} />
```

### Hook useRouteDetail

```typescript
// src/hooks/useRouteDetail.tsx
interface UseRouteDetailReturn {
  route: ActiveRoute | null;
  notes: StepNote[];
  attachments: StepAttachment[];
  isLoading: boolean;
  addNote: (stepId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  attachDocument: (stepId: string, documentType: string) => Promise<void>;
  removeAttachment: (attachmentId: string) => Promise<void>;
}
```

### StepCard Component

```typescript
interface StepCardProps {
  step: RouteStep;
  notes: StepNote[];
  attachments: StepAttachment[];
  isExpanded: boolean;
  onToggle: () => void;
  onToggleComplete: (isCompleted: boolean) => void;
  onAddNote: (content: string) => void;
  onAttachDocument: () => void;
}
```

---

## Orden de Implementacion

1. **Migracion SQL** - Crear tablas `step_notes` y `step_attachments`
2. **Hook useRouteDetail** - Logica para cargar ruta individual con notas y adjuntos
3. **RouteHeader.tsx** - Encabezado con info de ruta y navegacion
4. **StepNotes.tsx** - Componente de notas/comentarios
5. **StepAttachments.tsx** - Componente de documentos adjuntos
6. **StepCard.tsx** - Tarjeta expandible con todo integrado
7. **AttachDocumentModal.tsx** - Modal selector de documentos
8. **RouteDetail.tsx** - Pagina principal que une todo
9. **App.tsx** - Agregar ruta
10. **Dashboard.tsx** - Simplificar a lista de rutas
11. **ActiveRouteCard.tsx** - Cambiar onClick a navigate

---

## Verificacion

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Click en ruta desde Dashboard | Navega a `/dashboard/route/:id` |
| Expandir paso | Muestra descripcion, docs adjuntos, notas |
| Agregar nota | Aparece en lista con timestamp |
| Adjuntar documento | Modal muestra docs de boveda, se vincula |
| Toggle checkbox | Actualiza progreso optimisticamente |
| Volver a Dashboard | Breadcrumb o boton navega correctamente |
| Usuario sin rutas | Redirige o muestra mensaje apropiado |
