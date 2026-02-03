
# Plan: Task C02 - Secure Document Management System and AI-assisted Validation

## Resumen

Implementar un sistema completo de gestión de documentos ("La Bóveda") con validación mock de IA, control de acceso para usuarios pagados, y actualización del pricing a los nuevos valores (Plan Pro €9.99, Plan Premium €19.99).

---

## Arquitectura del Sistema de Documentos

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          DOCUMENT VAULT ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │           DocumentVault.tsx             │
                    │  Organizado por categorías según ruta   │
                    └───────────────────┬─────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│    IDENTIDAD        │   │    RESIDENCIA       │   │   ANTECEDENTES      │
│  ────────────────   │   │  ────────────────   │   │  ────────────────   │
│  - Pasaporte        │   │  - Padrón Histórico │   │  - Penales país     │
│                     │   │  - Recibos          │   │    origen           │
│                     │   │  - Remesas          │   │  - Apostilla        │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │         DocumentStatusCard.tsx          │
                    │  Estados visuales con badge de color    │
                    └───────────────────┬─────────────────────┘
                                        │
           ┌────────────────────────────┼─────────────────────────────┐
           │                            │                             │
           ▼                            ▼                             ▼
    ┌─────────────┐           ┌─────────────┐              ┌─────────────┐
    │  🟠 WAITING │           │ 🔵 ANALYZING│              │ 🟢 VALID    │
    │  Default    │     →     │  Procesando │      →      │  Aprobado   │
    └─────────────┘           └─────────────┘              └─────────────┘
                                                                  │
                                                                  ▼
                                                          ┌─────────────┐
                                                          │ 🔴 ERROR    │
                                                          │  Rechazado  │
                                                          └─────────────┘
```

---

## 1. Nueva Tabla de Base de Datos

### user_documents

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| category | text | "identidad", "residencia", "antecedentes" |
| document_type | text | "pasaporte", "padron_historico", "penales", etc. |
| file_url | text | URL del archivo en storage |
| file_name | text | Nombre original del archivo |
| status | text | "waiting", "analyzing", "valid", "error" |
| validation_message | text | Mensaje de validación (si error) |
| route_type | text | "regularizacion2026" o "arraigos" |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Última actualización |

---

## 2. Componentes a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/dashboard/DocumentVault.tsx` | Contenedor principal de La Bóveda |
| `src/components/dashboard/DocumentCategory.tsx` | Sección por categoría (Identidad, Residencia, Antecedentes) |
| `src/components/dashboard/DocumentStatusCard.tsx` | Tarjeta individual de documento con estado |
| `src/components/dashboard/DocumentUploadButton.tsx` | Botón de upload con soporte PDF/JPG |
| `src/components/dashboard/SubmitForReviewButton.tsx` | Botón "Enviar a Revisión" |
| `src/components/dashboard/PremiumFeatureModal.tsx` | Modal de "Esta ruta requiere Plan Pro" |
| `src/hooks/useDocumentVault.tsx` | Hook para gestión de documentos |

---

## 3. Diseño Visual: Document Vault

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   📁 Tu Bóveda de Documentos                                                   │
│   ─────────────────────────                                                    │
│   Organiza y valida tus documentos para la solicitud                           │
│                                                                                 │
│   ┌──────────────────── IDENTIDAD ────────────────────┐                        │
│   │                                                    │                        │
│   │   ┌────────────────────────────────────────────┐  │                        │
│   │   │  📄 Pasaporte Completo                     │  │                        │
│   │   │  Todas las páginas con sellos de entrada   │  │                        │
│   │   │                                            │  │                        │
│   │   │  🟠 Esperando archivo     [📎 Subir]      │  │                        │
│   │   └────────────────────────────────────────────┘  │                        │
│   │                                                    │                        │
│   └────────────────────────────────────────────────────┘                        │
│                                                                                 │
│   ┌──────────────────── RESIDENCIA ───────────────────┐                        │
│   │                                                    │                        │
│   │   ┌────────────────────────────────────────────┐  │                        │
│   │   │  📄 Padrón Histórico                       │  │                        │
│   │   │  Certificado con fecha anterior a          │  │                        │
│   │   │  31/12/2025                                │  │                        │
│   │   │                                            │  │                        │
│   │   │  🔵 Analizando documento...               │  │                        │
│   │   │  ├─ padron_historico.pdf                  │  │                        │
│   │   └────────────────────────────────────────────┘  │                        │
│   │                                                    │                        │
│   │   ┌────────────────────────────────────────────┐  │                        │
│   │   │  📄 Recibos / Remesas                      │  │                        │
│   │   │  Comprobantes de alquiler o envíos         │  │                        │
│   │   │                                            │  │                        │
│   │   │  🟢 Válido para presentación              │  │                        │
│   │   │  ├─ recibo_enero.pdf                      │  │                        │
│   │   │  ├─ remesa_febrero.pdf                    │  │                        │
│   │   └────────────────────────────────────────────┘  │                        │
│   │                                                    │                        │
│   └────────────────────────────────────────────────────┘                        │
│                                                                                 │
│   ┌──────────────────── ANTECEDENTES ─────────────────┐                        │
│   │                                                    │                        │
│   │   ┌────────────────────────────────────────────┐  │                        │
│   │   │  📄 Antecedentes Penales                   │  │                        │
│   │   │  Del país de origen, apostillados          │  │                        │
│   │   │                                            │  │                        │
│   │   │  🔴 Error en documento                     │  │                        │
│   │   │  ⚠️ La apostilla no es legible            │  │                        │
│   │   └────────────────────────────────────────────┘  │                        │
│   │                                                    │                        │
│   └────────────────────────────────────────────────────┘                        │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐  │
│   │                                                                          │  │
│   │   [  Enviar a Revisión  ]  (Deshabilitado si hay docs pendientes)       │  │
│   │                                                                          │  │
│   └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Status Badges Design

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          STATUS BADGE SYSTEM                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────┐
    │  🟠 Esperando archivo                                       │
    │  ────────────────────                                       │
    │  Background: orange-100 / Text: orange-700                  │
    │  Estado por defecto, sin archivo subido                     │
    └─────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────┐
    │  🔵 Analizando documento...                                 │
    │  ────────────────────────                                   │
    │  Background: blue-100 / Text: blue-700                      │
    │  Animación de spinner, post-upload                          │
    └─────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────┐
    │  🟢 Válido para presentación                                │
    │  ───────────────────────────                                │
    │  Background: green-100 / Text: green-700                    │
    │  Check icon, validación exitosa                             │
    └─────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────┐
    │  🔴 Error en documento                                      │
    │  ────────────────────                                       │
    │  Background: red-100 / Text: red-700                        │
    │  X icon + mensaje de error específico                       │
    └─────────────────────────────────────────────────────────────┘
```

---

## 5. Mock AI/OCR Validation Logic

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       AI VALIDATION FLOW (MOCK)                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

User uploads "Padrón Histórico"
              │
              ▼
    ┌─────────────────────┐
    │  Status → ANALYZING │
    │  (2-3 sec delay)    │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────────────────────────────────┐
    │  MOCK VALIDATION CHECK:                         │
    │                                                 │
    │  IF user.routeType === "regularizacion2026"    │
    │    AND document_type === "padron_historico"    │
    │                                                 │
    │  THEN simulate date check:                     │
    │    - 70% chance → VALID (date < 31/12/2025)   │
    │    - 30% chance → ERROR (date validation)     │
    │                                                 │
    │  Error message:                                │
    │  "Atención: Tu padrón no acredita entrada     │
    │   antes de la fecha de corte (31/12/2025)."   │
    └─────────────────────────────────────────────────┘
              │
              ▼
    ┌────────────┐     OR     ┌─────────────┐
    │  🟢 VALID  │            │  🔴 ERROR   │
    └────────────┘            └─────────────┘
```

---

## 6. Updated Pricing Structure

### Cambios en Planes

| Plan | Precio Anterior | Precio Nuevo | Cambios |
|------|-----------------|--------------|---------|
| Digital | 49€ (one-time) | **Pro €9.99** (monthly) | Renombrado + nuevo precio |
| Premium | 149€ (one-time) | **Premium €19.99** (monthly) | Nuevo precio |

### Features por Plan

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PLAN PRO (€9.99/mes)                               │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  ✓ Acceso a rutas Regularización 2026 y Arraigos                               │
│  ✓ Document Vault (La Bóveda)                                                  │
│  ✓ Soporte Prioritario                                                         │
│  ✓ Base de datos de abogados especializados (Coming Soon)                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PLAN PREMIUM (€19.99/mes)                             │
│                                [RECOMENDADO] 🏆                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  ✓ Todo del Plan Pro                                                            │
│  ✓ Revisión humana de documentos                                                │
│  ✓ Pre-check antes de presentar solicitud                                       │
│  ✓ Asistente IA personalizado                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Access Control Flow

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ACCESS CONTROL FOR RESTRICTED ROUTES                     │
└─────────────────────────────────────────────────────────────────────────────────┘

User (Free) selects "Regularización 2026" or "Arraigos"
                              │
                              ▼
              ┌───────────────────────────────┐
              │  CHECK: isPremium === true?   │
              └───────────────────────────────┘
                      │              │
                     NO             YES
                      │              │
                      ▼              ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │  PremiumFeatureModal  │   │  Continue to route    │
    │  ──────────────────   │   │  with full access     │
    │                       │   │                       │
    │  "Esta ruta requiere  │   └───────────────────────┘
    │   el Plan Pro para    │
    │   garantizar tu       │
    │   éxito legal."       │
    │                       │
    │  [Upgrade] [Cancelar] │
    └───────────────────────┘
                │
                │ Click Upgrade
                ▼
    ┌───────────────────────┐
    │  Stripe Checkout      │
    │  Pro €9.99/mes        │
    └───────────────────────┘
```

---

## 8. Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/components/dashboard/DocumentVault.tsx` | Contenedor principal con categorías |
| `src/components/dashboard/DocumentCategory.tsx` | Sección por categoría con header |
| `src/components/dashboard/DocumentStatusCard.tsx` | Tarjeta de documento con badges |
| `src/components/dashboard/StatusBadge.tsx` | Componente de badge de estado |
| `src/components/dashboard/PremiumFeatureModal.tsx` | Modal para rutas restringidas |
| `src/hooks/useDocumentVault.tsx` | Hook para CRUD de documentos |
| `src/lib/mockDocumentValidation.ts` | Lógica mock de validación AI |

---

## 9. Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/eligibility/QualificationSuccess.tsx` | Actualizar precios Pro €9.99 / Premium €19.99 |
| `src/components/eligibility/PricingCard.tsx` | Cambiar "pago único" → "mes", renombrar Digital→Pro |
| `src/components/dashboard/DocumentsSection.tsx` | Reemplazar con nuevo DocumentVault |
| `src/pages/Dashboard.tsx` | Integrar DocumentVault en lugar de DocumentsSection |
| `src/hooks/useSubscription.tsx` | Agregar lógica de access control |
| `src/pages/espana/Regularizacion2026.tsx` | Agregar modal de feature restringida |
| `src/pages/espana/Arraigos.tsx` | Agregar modal de feature restringida |
| `supabase/functions/create-one-time-payment/index.ts` | Convertir a subscription mode |

---

## 10. Nuevos Stripe Products

| Producto | Precio | Tipo | Price ID |
|----------|--------|------|----------|
| Albus Pro | €9.99 | subscription/month | A crear |
| Albus Premium | €19.99 | subscription/month | A crear |

---

## Sección Técnica

### Database Migration

```sql
-- Create user_documents table
CREATE TABLE user_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('identidad', 'residencia', 'antecedentes')),
  document_type TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'analyzing', 'valid', 'error')),
  validation_message TEXT,
  route_type TEXT CHECK (route_type IN ('regularizacion2026', 'arraigos')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own documents"
ON user_documents FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own documents"
ON user_documents FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own documents"
ON user_documents FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
ON user_documents FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Index for faster queries
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_user_documents_route_type ON user_documents(route_type);
```

### Document Types Configuration

```typescript
// src/lib/documentConfig.ts
export const DOCUMENT_CATEGORIES = {
  regularizacion2026: {
    identidad: [
      {
        type: "pasaporte",
        name: "Pasaporte Completo",
        description: "Todas las páginas con sellos de entrada",
        required: true,
      },
    ],
    residencia: [
      {
        type: "padron_historico",
        name: "Padrón Histórico",
        description: "Certificado con fecha anterior a 31/12/2025",
        required: true,
        hasAiValidation: true,
      },
      {
        type: "recibos_remesas",
        name: "Recibos / Remesas",
        description: "Comprobantes de alquiler o envíos de dinero",
        required: false,
      },
    ],
    antecedentes: [
      {
        type: "penales_origen",
        name: "Antecedentes Penales",
        description: "Del país de origen, apostillados",
        required: true,
      },
    ],
  },
  arraigos: {
    // Similar structure for Arraigos
  },
};
```

### Mock Validation Logic

```typescript
// src/lib/mockDocumentValidation.ts
export const validateDocument = async (
  documentType: string,
  routeType: string
): Promise<{ status: 'valid' | 'error'; message?: string }> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

  // Special validation for Padrón Histórico in Reg2026
  if (routeType === 'regularizacion2026' && documentType === 'padron_historico') {
    // 70% success rate for mock
    const isValid = Math.random() > 0.3;
    
    if (isValid) {
      return { status: 'valid' };
    } else {
      return {
        status: 'error',
        message: 'Atención: Tu padrón no acredita entrada antes de la fecha de corte (31/12/2025).',
      };
    }
  }

  // Default: 90% success rate
  const isValid = Math.random() > 0.1;
  return isValid
    ? { status: 'valid' }
    : { status: 'error', message: 'El documento no cumple con los requisitos mínimos.' };
};
```

---

## Orden de Implementación

1. **Database migration** - Crear tabla user_documents con RLS
2. **Crear nuevos productos Stripe** - Pro (€9.99) y Premium (€19.99) mensuales
3. **documentConfig.ts** - Configuración de documentos por ruta
4. **mockDocumentValidation.ts** - Lógica de validación mock
5. **StatusBadge.tsx** - Componente de badge de estado
6. **DocumentStatusCard.tsx** - Tarjeta de documento
7. **DocumentCategory.tsx** - Sección por categoría
8. **DocumentVault.tsx** - Contenedor principal
9. **useDocumentVault.tsx** - Hook de gestión
10. **PremiumFeatureModal.tsx** - Modal de acceso restringido
11. **Actualizar QualificationSuccess.tsx** - Nuevos precios
12. **Actualizar PricingCard.tsx** - Naming y formato
13. **Actualizar Dashboard.tsx** - Integrar DocumentVault
14. **Actualizar Regularizacion2026.tsx** - Access control
15. **Actualizar Arraigos.tsx** - Access control
16. **Actualizar create-checkout** - Para subscriptions

---

## Verificación

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Usuario Free ve DocumentVault | Ve placeholders con botón de upgrade |
| Usuario Free selecciona Reg2026/Arraigos | Ve PremiumFeatureModal |
| Usuario Pro sube Padrón | Badge cambia: waiting → analyzing → valid/error |
| Padrón con fecha inválida | Muestra error con mensaje específico |
| Todos docs en verde | Botón "Enviar a Revisión" se activa |
| Docs pendientes/error | Botón "Enviar" deshabilitado |
| Landing Reg2026 pricing | Muestra Pro €9.99 y Premium €19.99 |
| Click upgrade | Redirige a Stripe Checkout (subscription) |
| Usuario Pro ve "Abogados" | Ve sección "Coming Soon" |
