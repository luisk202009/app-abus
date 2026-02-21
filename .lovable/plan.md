

# Fix de Pagos, UI "Visible pero Bloqueada" y Limpieza

## Resumen

Tres areas de trabajo: (1) diagnostico y fix del error de API Key de Stripe, (2) estrategia de UI "visible pero bloqueada" para DocumentVault y FiscalSimulator, (3) limpieza de webhook y toasts.

---

## 1. Stripe API Key (CRITICO)

**Diagnostico:** Los logs muestran `Invalid API Key provided: rk_live_...tivo`. El prefijo `rk_live_` indica una **Restricted Key**, no una Secret Key (`sk_live_`). El codigo ya lee correctamente `Deno.env.get("STRIPE_SECRET_KEY")`, pero el **valor almacenado como secreto** es incorrecto.

**Accion requerida del usuario:**
- Ir a [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
- Copiar la **Secret Key** (empieza con `sk_live_` o `sk_test_`)
- Actualizar el secreto `STRIPE_SECRET_KEY` en [Supabase Secrets](https://supabase.com/dashboard/project/uidwcgxbybjpbteowrnh/settings/functions)

**Accion en codigo:**
- Agregar logging defensivo en `create-checkout` para detectar prefijos invalidos antes de llamar a Stripe
- Retornar un error claro si la key no empieza con `sk_`

**Archivo:** `supabase/functions/create-checkout/index.ts`

---

## 2. getClaims - Ya corregido

Las edge functions `create-checkout` y `create-one-time-payment` ya usan `supabase.auth.getUser(token)`. No quedan instancias de `getClaims` en el codigo.

---

## 3. Webhook - Actualizar versiones

**Archivo:** `supabase/functions/stripe-webhook/index.ts`

- El webhook ya usa `req.text()` para el body crudo y valida la firma
- Actualizar las versiones de dependencias de `stripe@14.21.0` a `stripe@18.5.0` y `@supabase/supabase-js@2.45.0` a `@2.57.2` para consistencia con las otras funciones
- Actualizar `apiVersion` a `"2025-08-27.basil"`

---

## 4. UI "Visible pero Bloqueada"

### 4a. DocumentVault para usuarios Free

**Archivo:** `src/pages/Dashboard.tsx` (lineas 438-471)

**Cambio:** Eliminar el bloque de upsell que oculta toda la seccion de documentos. En su lugar, siempre renderizar `DocumentVault` pasando `isPremium={false}` para usuarios free.

El componente `DocumentStatusCard` ya tiene la logica correcta: si `!isPremium`, el boton Upload llama a `onPremiumRequired()` que abre el modal de upgrade. Las categorias y documentos requeridos ya se muestran.

**Lo que cambia:**
```text
ANTES: Free user -> ve pantalla vacia con boton "Mejorar mi plan"
DESPUES: Free user -> ve todas las categorias y documentos, pero Upload esta bloqueado con modal de upgrade
```

### 4b. FiscalSimulator para usuarios Free

**Archivo:** `src/pages/Dashboard.tsx` (lineas 403-424)

**Cambio:** Eliminar el bloque de upsell que oculta el simulador. Siempre renderizar `<FiscalSimulator>` pero pasar `subscriptionStatus="free"`.

**Archivo:** `src/components/dashboard/FiscalSimulator.tsx`

**Cambio:** Agregar logica de bloqueo:
- Mostrar los campos del formulario (Salario, Situacion Familiar, Comunidad) siempre
- Ocultar los resultados y mostrar un overlay con icono de candado + boton "Desbloquear" para usuarios free
- El boton "Desbloquear" llama a `onUpgrade()`

### 4c. Otras secciones (Appointments, Business, Life in Spain)

Mantener el patron actual para estas secciones ya que tienen interacciones mas complejas. Solo DocumentVault y FiscalSimulator cambian.

---

## 5. AdminSystemStatus - Ya corregido

El componente ya usa el bucket publico `resources` con `res.status < 500` como criterio. No requiere cambios adicionales.

---

## 6. Toasts y Mensajes de Error

**Archivo:** `src/hooks/useSubscription.tsx`

- El toast de error ya muestra un mensaje amigable en espanol
- Agregar `console.error` con detalles tecnicos antes del toast para debugging
- Asegurar que ningun error tecnico se filtre al usuario

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/create-checkout/index.ts` | Validacion defensiva de API key prefix |
| `supabase/functions/stripe-webhook/index.ts` | Actualizar versiones Stripe y supabase-js |
| `src/pages/Dashboard.tsx` | Remover bloques de upsell para documentos y simulador |
| `src/components/dashboard/FiscalSimulator.tsx` | Agregar overlay de bloqueo para free users |
| `src/hooks/useSubscription.tsx` | Reforzar logging tecnico vs mensaje de usuario |

**Accion manual requerida:** Actualizar el secreto `STRIPE_SECRET_KEY` en Supabase con una Secret Key valida (`sk_live_...` o `sk_test_...`).

