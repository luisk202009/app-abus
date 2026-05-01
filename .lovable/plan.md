# Corrección: CTA "Mejorar mi plan" en Directorio de Abogados

## Problema
En `Dashboard.tsx` (sección `lawyers`), el botón **"Mejorar mi plan"** del bloqueo "Directorio Premium" llama a `handleCheckout()` sin argumentos, que por defecto inicia checkout del **Plan Pro mensual (€9,99/mes)**.

El acceso al Directorio se concede a:
- Usuarios con suscripción `premium`, **o**
- Usuarios con la ruta **Regularización 2026** activa.

Por tanto, el CTA debe llevar al **pago único de Regularización Premium** (`STRIPE_PRICES.regularizacion2026.premium`, `price_1TMU19GVNlA5jALguBJfwIwb`, €19,99 one-time), que es el producto coherente con el copy "usuarios Premium y usuarios de Regularización 2026".

## Cambios

### 1. `src/pages/Dashboard.tsx` — case `"lawyers"`
Reemplazar el `onUpgrade` para que invoque la edge function `create-one-time-payment` con el `priceId` de Regularización Premium, replicando el patrón usado en `QualificationSuccess.tsx` y `PendingPaymentAlert.tsx`:

- Obtener sesión de Supabase y email del usuario.
- Llamar `create-one-time-payment` con `{ priceId: STRIPE_PRICES.regularizacion2026.premium.priceId, email, routeType: "regularizacion2026" }`.
- Abrir la URL devuelta con `window.open(url, "_blank")` (cumple regla de checkouts en preview).
- Manejo de error con `toast` y estado `isCheckoutLoading` reutilizado para deshabilitar el botón mientras carga.
- Importar `STRIPE_PRICES` desde `@/lib/documentConfig`.

### 2. `src/components/dashboard/LawyersSection.tsx`
- Aceptar prop opcional `isLoading?: boolean` para deshabilitar el botón "Mejorar mi plan" durante la creación de la sesión Stripe.
- Sin cambios visuales adicionales.

### 3. Pruebas
Actualizar/crear test mínima en `src/components/dashboard/__tests__/` que verifique:
- Click en "Mejorar mi plan" desde `LawyersSection` invoca `create-one-time-payment` con el `priceId` correcto de Regularización Premium (no el de Plan Pro).

## Fuera de alcance
- No se modifica la lógica de `hasAccess` (sigue siendo `premium` o ruta Reg2026 activa).
- No se cambia el copy del modal de bloqueo.
- No se tocan otros CTAs de upgrade en el Dashboard (que sí deben seguir yendo al Plan Pro/Premium mensual).
