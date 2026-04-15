

# Plan: Separar modelo de pagos — pago único para Regularización 2026

## Resumen
Modificar el flujo de pago para que la Regularización 2026 use pagos únicos (via `create-one-time-payment`), mientras las demás rutas mantienen suscripción mensual (via `create-checkout`).

## Archivos a modificar

### 1. `src/lib/documentConfig.ts` — Agregar precios de Regularización 2026
Añadir al objeto `STRIPE_PRICES` la nueva clave `regularizacion2026` con los Price IDs de pago único proporcionados.

### 2. `src/components/eligibility/QualificationSuccess.tsx` — Lógica condicional de checkout
- Cuando `routeType === "regularizacion2026"`, usar planes con `isSubscription: false`, los Price IDs de pago único, y llamar a `create-one-time-payment` en vez de `create-checkout`.
- Para los demás `routeType` (arraigos), mantener el flujo actual de suscripción con `create-checkout`.
- Crear dos arrays de planes: `PLANS_SUBSCRIPTION` (actual) y `PLANS_REG2026` (pago único con los nuevos Price IDs).
- En `initiateCheckout`, condicionar la URL del endpoint según el tipo de ruta.

### 3. `src/components/eligibility/PricingCard.tsx` — Línea de contexto
- Añadir prop opcional `contextLine` al componente.
- Cuando `isSubscription === false`, mostrar debajo del precio: "Acceso hasta julio 2026 · Sin renovación automática".

### 4. `src/pages/Success.tsx` — Mensaje específico para Regularización
- En `pendingData`, detectar si `routeTemplateSlug` corresponde a `"regularizacion-2026"`.
- Si es pago único de regularización, mostrar título: "¡Acceso activado! Tu proceso de Regularización 2026 está listo." en lugar del genérico "¡Bienvenido a Albus Pro/Premium!".

## Lo que NO cambia
- `create-checkout` edge function (suscripciones mensuales para arraigos/dashboard).
- `useSubscription.tsx` y `ChecklistModal.tsx` (flujo de suscripción del dashboard).
- `create-one-time-payment` edge function (ya existe y funciona).

