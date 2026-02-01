
# Plan: Premium Onboarding and Payment Gateway (Task C01)

## Resumen

Implementar un flujo de conversión premium que intercepta a usuarios aptos tras el chequeo de elegibilidad, presentándoles una pantalla de éxito con tabla de precios y pagos únicos vía Stripe. Tras el pago, se crea la cuenta y se asigna la ruta automáticamente.

---

## Arquitectura del Nuevo Flujo

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO ACTUAL (a modificar)                                 │
└───────────────────────────────────────────────────────────────────────────────┘

Landing (/españa/regularizacion)
         │
         │ Click "Analizar elegibilidad"
         ▼
┌─────────────────────────────────┐
│  EligibilityModalReg2026        │
│  Pregunta 1 → Pregunta 2        │
│  → EligibilityResult (Apto/No)  │
└─────────────────────────────────┘
         │
         │ Si APTO → Continuar
         ▼
┌─────────────────────────────────┐
│  AnalysisModal (Onboarding)     │  ← ACTUALMENTE VA AQUÍ
│  5 pasos → Dashboard            │
└─────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────────────┐
│                    NUEVO FLUJO PROPUESTO                                      │
└───────────────────────────────────────────────────────────────────────────────┘

Landing (/españa/regularizacion)
         │
         │ Click "Analizar elegibilidad"
         ▼
┌─────────────────────────────────┐
│  EligibilityModalReg2026        │
│  Pregunta 1 → Pregunta 2        │
└─────────────────────────────────┘
         │
         │ Si APTO
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NUEVA PANTALLA: QualificationSuccess                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ✓ ¡Perfil Validado!                                                   ││
│  │  "Tienes el 95% de éxito para tu residencia"                           ││
│  │                                                                         ││
│  │  ┌─────────────────────┐  ┌─────────────────────────────────────────┐  ││
│  │  │ PLAN DIGITAL  49€   │  │ PLAN PREMIUM  149€                      │  ││
│  │  │ ─────────────       │  │ ─────────────                           │  ││
│  │  │ ✓ Guía paso a paso  │  │ ✓ Todo del Digital                      │  ││
│  │  │ ✓ Generador 790-052 │  │ ✓ Revisión humana de documentos         │  ││
│  │  │ ✓ Checklist docs    │  │ ✓ Carga en plataforma Mercurio         │  ││
│  │  │                     │  │ [RECOMENDADO] Badge dorado              │  ││
│  │  │ [Pagar 49€]         │  │ [Pagar 149€]                            │  ││
│  │  └─────────────────────┘  └─────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ Click "Pagar ahora"
         ▼
┌─────────────────────────────────┐
│  RegistrationModal (NUEVO)      │
│  - Solo nombre + email          │
│  - Crea cuenta Supabase Auth    │
│  - Redirige a Stripe Checkout   │
└─────────────────────────────────┘
         │
         │ Pago exitoso en Stripe
         ▼
┌─────────────────────────────────┐
│  /success (MODIFICADO)          │
│  - Verifica pago                 │
│  - Actualiza subscription_status │
│  - Auto-asigna ruta Reg2026     │
│  - Redirige a Dashboard Pro     │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DASHBOARD PRO (MEJORADO)                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Banner flotante: "Quedan XX días para apertura (1 abril)"             ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │  Barra de progreso visual                                              ││
│  │  ════════════════════░░░░░░░░░░ 40% completado                        ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │  Pasos con File Upload:                                                ││
│  │  ┌─────────────────────────────────────────────────────────────────┐  ││
│  │  │ 1. Verificación de Permanencia                                  │  ││
│  │  │    [📎 Subir empadronamiento]  [✓ Archivo subido]               │  ││
│  │  ├─────────────────────────────────────────────────────────────────┤  ││
│  │  │ 2. Antecedentes Penales                                         │  ││
│  │  │    [📎 Subir certificado]  [📎 Subir apostilla]                 │  ││
│  │  └─────────────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Productos y Precios en Stripe

### Crear Nuevos Productos (One-Time Payments)

| Producto | Precio | Tipo | Stripe Price ID (a crear) |
|----------|--------|------|---------------------------|
| Albus Digital Regularización | 49€ | payment (one-time) | A generar |
| Albus Premium Regularización | 149€ | payment (one-time) | A generar |

---

## 2. Componentes a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/eligibility/QualificationSuccess.tsx` | Pantalla de éxito con tabla de precios |
| `src/components/eligibility/PricingCard.tsx` | Tarjeta individual de plan |
| `src/components/eligibility/RegistrationModal.tsx` | Modal de registro rápido (nombre + email) |
| `src/components/dashboard/UrgencyBanner.tsx` | Banner flotante con countdown |
| `src/components/dashboard/ProgressBar.tsx` | Barra de progreso visual |
| `src/components/route-detail/StepFileUpload.tsx` | Componente de subida de archivos por paso |

---

## 3. Edge Functions

### create-one-time-payment (NUEVO)

Función para crear sesiones de pago único (no suscripción):

```typescript
// supabase/functions/create-one-time-payment/index.ts
// Diferencias con create-checkout:
// - mode: "payment" en lugar de "subscription"
// - Recibe priceId específico del plan seleccionado
// - Permite checkout sin autenticación previa (guest)
// - Guarda metadata: plan_type, route_template_id
```

### verify-payment (NUEVO)

Función para verificar el pago tras redirect de Stripe:

```typescript
// supabase/functions/verify-payment/index.ts
// - Recibe session_id de Stripe
// - Verifica estado de pago
// - Actualiza subscription_status del usuario
// - Retorna información del plan comprado
```

---

## 4. Diseño Visual: QualificationSuccess

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   [Fondo oscuro/negro con acentos dorados para "Premium"]                  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                                                                     │  │
│   │     ✓ (check dorado)                                                │  │
│   │                                                                     │  │
│   │     ¡Perfil Validado!                                               │  │
│   │     ─────────────────                                               │  │
│   │                                                                     │  │
│   │     Tienes el 95% de éxito para obtener                            │  │
│   │     tu residencia en España.                                        │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌───────────────────────────┐   ┌───────────────────────────────────┐   │
│   │                           │   │  [RECOMENDADO] badge dorado        │   │
│   │     PLAN DIGITAL          │   │                                   │   │
│   │     ─────────────         │   │     PLAN PREMIUM                  │   │
│   │                           │   │     ─────────────                 │   │
│   │     49€                   │   │                                   │   │
│   │     pago único            │   │     149€                          │   │
│   │                           │   │     pago único                    │   │
│   │     ────────────────────  │   │                                   │   │
│   │                           │   │     ────────────────────          │   │
│   │     ✓ Guía paso a paso    │   │                                   │   │
│   │     ✓ Generador Tasa 790  │   │     ✓ Todo del Plan Digital       │   │
│   │     ✓ Checklist docs      │   │     ✓ Revisión humana de docs     │   │
│   │     ✓ Soporte por email   │   │     ✓ Carga en Mercurio           │   │
│   │                           │   │     ✓ Soporte prioritario         │   │
│   │                           │   │                                   │   │
│   │     [  Elegir Digital  ]  │   │     [  Elegir Premium  ] (dorado) │   │
│   │     (botón outline)       │   │     (botón solido)                │   │
│   │                           │   │                                   │   │
│   └───────────────────────────┘   └───────────────────────────────────┘   │
│                                                                             │
│                                                                             │
│            Garantía de devolución de 7 días · Pago seguro                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Diseño Visual: UrgencyBanner

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ⏰  Quedan 58 días para la apertura de solicitudes (1 de abril)          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Estilo:
- Fondo negro/oscuro
- Texto blanco
- Icono de reloj o calendario
- Fijo en parte superior del Dashboard (solo para usuarios Pro)
- Se calcula dinámicamente basado en fecha actual vs 1 abril 2026
```

---

## 6. Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/eligibility/EligibilityModalReg2026.tsx` | Mostrar QualificationSuccess en lugar de EligibilityResult cuando apto |
| `src/components/eligibility/EligibilityModalArraigos.tsx` | Mismo cambio para arraigos |
| `src/pages/espana/Regularizacion2026.tsx` | Integrar nuevo flujo con registration modal |
| `src/pages/espana/Arraigos.tsx` | Integrar nuevo flujo |
| `src/pages/Success.tsx` | Verificar pago y auto-asignar ruta |
| `src/pages/Dashboard.tsx` | Agregar UrgencyBanner y mejorar progress |
| `src/pages/RouteDetail.tsx` | Integrar file upload mejorado |
| `src/components/route-detail/StepCard.tsx` | Agregar sección de file upload integrada |

---

## Sección Técnica

### Estructura de QualificationSuccess.tsx

```typescript
interface QualificationSuccessProps {
  routeType: "regularizacion2026" | "arraigo_social" | "arraigo_laboral" | "arraigo_formativo";
  onSelectPlan: (plan: "digital" | "premium") => void;
  onClose: () => void;
}

const plans = [
  {
    id: "digital",
    name: "Plan Digital",
    price: 49,
    priceId: "price_XXXXX", // A crear
    features: [
      "Guía paso a paso completa",
      "Generador de Tasa 790-052",
      "Checklist de documentos",
      "Soporte por email",
    ],
    highlighted: false,
  },
  {
    id: "premium",
    name: "Plan Premium",
    price: 149,
    priceId: "price_YYYYY", // A crear
    features: [
      "Todo del Plan Digital",
      "Revisión humana de documentos",
      "Carga en plataforma Mercurio",
      "Soporte prioritario",
    ],
    highlighted: true,
    badge: "Recomendado",
  },
];
```

### Edge Function: create-one-time-payment

```typescript
// supabase/functions/create-one-time-payment/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, email, name, routeTemplateId, planType } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check/create customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { route_template_id: routeTemplateId },
      });
      customerId = customer.id;
    }

    // Create one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment", // One-time, NOT subscription
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/españa/regularizacion`,
      metadata: {
        plan_type: planType,
        route_template_id: routeTemplateId,
        user_email: email,
        user_name: name,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

### Storage Bucket para Documentos de Usuario

```sql
-- Crear bucket para documentos de usuario
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false);

-- RLS: Users can only access their own documents
CREATE POLICY "Users can upload their documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Countdown Logic para UrgencyBanner

```typescript
// src/components/dashboard/UrgencyBanner.tsx
const calculateDaysUntilDeadline = () => {
  const deadline = new Date("2026-04-01");
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
```

---

## Orden de Implementación

1. **Crear productos Stripe** - Digital (49€) y Premium (149€) con precios one-time
2. **create-one-time-payment** - Edge function para pagos únicos
3. **QualificationSuccess.tsx** - Pantalla de éxito con pricing table
4. **PricingCard.tsx** - Componente de tarjeta de precio
5. **RegistrationModal.tsx** - Modal de registro rápido
6. **Modificar EligibilityModalReg2026** - Integrar nuevo flujo
7. **Modificar EligibilityModalArraigos** - Integrar nuevo flujo
8. **UrgencyBanner.tsx** - Banner de countdown
9. **ProgressBar.tsx** - Barra de progreso visual
10. **StepFileUpload.tsx** - Upload de archivos por paso
11. **Storage bucket** - Configurar user-documents
12. **Modificar Success.tsx** - Verificar pago y crear cuenta
13. **Modificar Dashboard.tsx** - Integrar urgency banner
14. **Modificar StepCard.tsx** - Integrar file upload

---

## Verificación

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Usuario apto en Reg2026 | Ve QualificationSuccess con 2 planes |
| Click "Elegir Digital" | Modal de registro → Stripe checkout 49€ |
| Click "Elegir Premium" | Modal de registro → Stripe checkout 149€ |
| Pago exitoso | Crea cuenta → Asigna ruta → Dashboard Pro |
| Dashboard Pro user | Ve UrgencyBanner con días restantes |
| Dashboard Pro user | Ve barra de progreso general |
| Route Detail Pro | Puede subir archivos por paso |
| Usuario cancela pago | Vuelve a landing, puede reintentar |
| Usuario Free en Dashboard | No ve UrgencyBanner |
