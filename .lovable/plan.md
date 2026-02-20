
# Plan: C04 - CRM, Notificaciones y Dashboard Admin

## Resumen

Implementar un sistema CRM interno con dashboard de metricas, notificaciones automatizadas para usuarios, etiquetado por ruta/plan, y seccion de comentarios del equipo legal.

---

## 1. Admin Dashboard Mejorado

### Archivo: `src/components/admin/AdminUsersTab.tsx`

**Metricas nuevas** (reemplazar las 3 cards actuales por 5):
- Total Revenue (calculado desde usuarios con suscripcion activa x precio)
- Usuarios en Regularizacion 2026 vs Arraigos (query a `user_active_routes` + `route_templates`)
- Pending Reviews (documentos con status "analyzing")
- Total Pro / Premium users

**Lista de usuarios Premium** con badges de estado:
- Consultar `user_documents` para cada usuario premium
- Badges: "Docs Completos" (todos valid), "En Revision" (alguno analyzing), "Pendiente" (alguno waiting), "Apto" (todos valid + submitted)

**Estilo**: Mantener B&W con acentos sutiles. Cards con borde `border-border`, fondo `bg-background`.

---

## 2. Sistema de Notificaciones

### Nuevo archivo: `src/components/dashboard/NotificationBanner.tsx`

Componente que muestra alertas contextuales en el dashboard del usuario.

**Logica de alertas:**

| Alerta | Condicion | Mensaje |
|--------|-----------|---------|
| Retencion | Usuario premium, sin `penales_origen` subido, cuenta creada hace >48h | "Asegura tu plaza: Completa tu documentacion para la Regularizacion 2026." |
| Aprobacion | Documento con status `valid` (detectado via polling o al cargar) | "Documento validado con exito!" |

### Modificar: `src/components/dashboard/UrgencyBanner.tsx`

Cambiar deadline de "1 de abril" a "30 de Junio" y mostrarlo para todos los usuarios con rutas activas (no solo premium). Texto: "Faltan [X] dias para el cierre del proceso (30 de Junio)."

### Nuevo hook: `src/hooks/useNotifications.tsx`

- Consulta `user_documents` al cargar dashboard
- Calcula tiempo desde creacion de cuenta (`onboarding_submissions.created_at`)
- Retorna lista de notificaciones activas

---

## 3. CRM - Etiquetado de Usuarios

### Migracion de base de datos

Agregar columna `crm_tag` a `onboarding_submissions`:

```sql
ALTER TABLE public.onboarding_submissions
ADD COLUMN crm_tag text;
```

**Logica de etiquetado** (calculada en frontend para el admin panel, no almacenada):
- Se genera combinando: ruta activa + plan de suscripcion
- Ejemplo: `regularizacion_2026_premium`, `arraigo_social_pro`, `arraigo_social_free`

Mostrar tags como badges en `AdminUsersTab`.

### Seccion de Comentarios del Equipo Legal

#### Migracion: nueva tabla `document_comments`

```sql
CREATE TABLE public.document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.user_documents(id) ON DELETE CASCADE,
  author_email text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

-- Admin puede CRUD
CREATE POLICY "Admin can manage comments"
  ON public.document_comments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Usuarios pueden ver comentarios de sus documentos
CREATE POLICY "Users can view comments on their docs"
  ON public.document_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_documents ud
      WHERE ud.id = document_comments.document_id
        AND ud.user_id = auth.uid()
    )
  );
```

#### Nuevo componente: `src/components/dashboard/DocumentComments.tsx`

- Muestra comentarios del equipo legal debajo de cada documento en el Document Vault
- Solo lectura para usuarios, editable para admin
- Estilo: burbuja de chat minimalista con timestamp

#### Admin: Seccion de gestion de documentos

Agregar nueva tab "Documentos" en Admin panel (`AdminDocumentsTab.tsx`):
- Lista documentos de todos los usuarios premium
- Permite cambiar status (waiting -> analyzing -> valid / error)
- Campo de texto para agregar comentarios

---

## 4. Consistencia de Precios

Verificar y asegurar que todos los componentes usan `STRIPE_PRICES` de `documentConfig.ts`:

| Archivo | Estado actual |
|---------|--------------|
| `PricingSection.tsx` | Hardcoded 9.99 - actualizar para mostrar ambos planes |
| `QualificationSuccess.tsx` | Usa STRIPE_PRICES correctamente |
| `PremiumFeatureModal.tsx` | Usa STRIPE_PRICES correctamente |
| `PremiumModal.tsx` | No muestra precio - OK |

**Accion**: Actualizar `PricingSection.tsx` para incluir Plan Premium (19.99) ademas de Pro.

---

## Archivos a Crear

| Archivo | Proposito |
|---------|-----------|
| `src/hooks/useNotifications.tsx` | Hook para calcular notificaciones |
| `src/components/dashboard/NotificationBanner.tsx` | Banners de alerta en dashboard |
| `src/components/dashboard/DocumentComments.tsx` | Comentarios del equipo legal |
| `src/components/admin/AdminDocumentsTab.tsx` | Tab admin para gestionar documentos |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/AdminUsersTab.tsx` | Metricas + badges de estado + CRM tags |
| `src/components/dashboard/UrgencyBanner.tsx` | Deadline 30 Junio, visible para todos con rutas |
| `src/components/dashboard/DocumentVault.tsx` | Integrar DocumentComments |
| `src/pages/Admin.tsx` | Agregar tab "Documentos" |
| `src/pages/Dashboard.tsx` | Integrar NotificationBanner |
| `src/components/PricingSection.tsx` | Agregar Plan Premium 19.99 |

## Migraciones SQL

1. Agregar `crm_tag` a `onboarding_submissions`
2. Crear tabla `document_comments` con RLS

---

## Orden de Implementacion

1. Migraciones de base de datos (crm_tag + document_comments)
2. Hook de notificaciones + NotificationBanner
3. Actualizar UrgencyBanner
4. AdminUsersTab mejorado con metricas y tags
5. AdminDocumentsTab (gestion de documentos + comentarios)
6. DocumentComments en DocumentVault (vista usuario)
7. Consistencia de precios en PricingSection
