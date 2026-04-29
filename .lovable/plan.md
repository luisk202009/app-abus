## Plan: Robustecer flujo de pago en Regularización 2026

### Problema detectado
En la imagen aparece el error `email rate limit exceeded`, devuelto por Supabase Auth al intentar registrar `hola@albus.com.co`. El flujo actual en `QualificationSuccess.tsx` hace:

1. Usuario elige plan → se abre `AuthModal` para registrarse.
2. `signUp()` envía email de confirmación (consume cuota de envío).
3. `onSuccess` de `AuthModal` dispara `initiateCheckout()`, pero a veces aún no hay `session.access_token` (porque la cuenta requiere confirmación), o la edge function `create-one-time-payment` rechaza por falta de `Bearer`.
4. Si Stripe falla o el modal se cierra, el usuario queda sin cuenta, sin pago y sin pista de qué hacer.

Hay dos fuentes de fallo: (a) registro (rate-limit, email duplicado, confirmación pendiente), (b) checkout (token caducado, error Stripe, cierre de pestaña). El plan los separa y añade un mecanismo de "pago pendiente + reintento" en el Dashboard.

---

### Cambios

#### 1. Edge function `create-one-time-payment` — desactivar requisito de confirmación de email
- Hoy llama `supabaseAuth.auth.getUser(token)`. Si el token es válido pero el email no está confirmado, **igual debe permitir checkout** (los datos del cliente Stripe ya están). No bloquear por `email_confirmed_at`.
- Añadir registro de pago pendiente en una nueva tabla `pending_payments` (ver punto 4) **antes** de crear la sesión de Stripe, con `status: 'pending'` y `stripe_session_id` tras crearla. Si la creación de sesión de Stripe falla, marcar `status: 'failed'` con el mensaje de error.
- Devolver siempre `pending_payment_id` junto a `url` para que el frontend pueda referenciarlo.

#### 2. Tabla nueva `pending_payments` (migración SQL)
Campos:
```text
id                uuid PK
user_id           uuid FK auth.users (nullable para guests, no aplica aquí)
email             text
plan_type         text   ('pro' | 'premium')
route_template    text   ('regularizacion-2026')
price_id          text
amount_cents      integer
stripe_session_id text   nullable
status            text   ('pending' | 'completed' | 'failed' | 'cancelled')
error_message     text   nullable
created_at, updated_at
```
- RLS: usuarios sólo leen/actualizan sus propios registros (`user_id = auth.uid()`). Service role bypasea (edge functions).
- Función trigger para `updated_at`.
- El webhook de Stripe (`stripe-webhook`) marca `status='completed'` al recibir `checkout.session.completed`.

#### 3. `QualificationSuccess.tsx` — nuevo flujo "cuenta primero, pago después"
Reordenar `handleSelectPlan`:

```text
Si el usuario YA está autenticado:
  → llamar initiateCheckout(plan) directamente (igual que hoy)
Si NO está autenticado:
  → abrir AuthModal en modo 'signup'
  → al completar signUp con éxito (incluso sin confirmación de email):
      1. Esperar a que useAuth sincronice la sesión.
      2. Llamar initiateCheckout(plan).
      3. Si Stripe responde con url → window.open(url, "_blank") y además navegar a /dashboard?pending_payment={id} en la pestaña actual.
      4. Si Stripe falla → navegar a /dashboard?pending_payment={id}&payment_error=1 mostrando el toast de error pero CON la cuenta ya creada.
```

Reemplazar `onSuccess` del AuthModal: en vez de cerrar y depender de `getSession()` polling, usar el evento `onAuthStateChange` de `useAuth` para esperar `session !== null` con un timeout de 5s antes de invocar checkout.

#### 4. `AuthModal.tsx` — manejar errores específicos de signup sin bloquear el flujo
- Si `signUp()` devuelve `email rate limit exceeded` → mostrar toast claro "Has hecho demasiados intentos. Espera unos minutos o usa un email distinto" y mantener el modal abierto.
- Si devuelve `User already registered` (ya implementado): switch a login automático (mantener).
- Si el signup tiene éxito pero la confirmación está pendiente: NO mostrar el bloqueador `showEmailNotConfirmed` cuando el flujo viene del checkout (añadir prop `allowUnconfirmed?: boolean`). El registro es válido para crear el customer en Stripe; la confirmación de email puede completarse después desde el Dashboard.

#### 5. `Dashboard.tsx` — banner "Pago pendiente"
- Al cargar Dashboard, leer query params `pending_payment` y `payment_error`.
- Consultar `pending_payments` por id para confirmar que pertenece al usuario y obtener `plan_type`/`price_id`.
- Si `status='pending'` o `status='failed'`, renderizar un nuevo componente `PendingPaymentAlert` (arriba del contenido principal, sticky):
  - Icono de advertencia + texto: "Tu pago está pendiente. Completa el checkout para activar tu plan Regularización {plan}."
  - Botón **"Reintentar pago"** → llama a `create-one-time-payment` reusando el `pending_payment_id` (la edge function actualiza la fila existente con un nuevo `stripe_session_id` en vez de crear otra) y abre `url` en pestaña nueva.
  - Botón secundario **"Cancelar"** → marca `status='cancelled'` y oculta el banner.
- El banner persiste tras refrescar (la fuente de verdad es la fila `pending_payments` con status pendiente/failed para el usuario autenticado), no depende del query param.

#### 6. `stripe-webhook` (existente) — marcar `pending_payments` como completado
Al procesar `checkout.session.completed`, además de la lógica actual:
```text
UPDATE pending_payments
SET status='completed', updated_at=now()
WHERE stripe_session_id = session.id;
```

---

### Manejo de errores (resumen)

| Punto de fallo | Comportamiento nuevo |
|---|---|
| `signUp` devuelve rate-limit | Toast informativo, modal abierto, sin pérdida de datos |
| `signUp` devuelve email duplicado | Switch automático a login (ya existe) |
| `signUp` éxito pero email no confirmado | Continúa al checkout; confirmación se gestiona luego |
| `create-one-time-payment` falla | Fila `pending_payments` marcada `failed`, redirect a `/dashboard?pending_payment={id}&payment_error=1` con banner |
| Usuario cierra Stripe Checkout | Stripe redirige a `cancel_url=/explorar`; el banner sigue activo en Dashboard |
| Stripe completa | Webhook marca `completed`, banner desaparece automáticamente |

---

### Archivos a tocar

**Nuevos**
- `supabase/migrations/{timestamp}_pending_payments.sql`
- `src/components/dashboard/PendingPaymentAlert.tsx`

**Modificados**
- `src/components/eligibility/QualificationSuccess.tsx` (reordenar flujo, integrar `pending_payment_id`)
- `src/components/auth/AuthModal.tsx` (prop `allowUnconfirmed`, manejo de `rate limit`)
- `src/pages/Dashboard.tsx` (leer query, renderizar `PendingPaymentAlert`)
- `supabase/functions/create-one-time-payment/index.ts` (no exigir email confirmado, crear/actualizar `pending_payments`, aceptar `pending_payment_id` opcional para reintentos)
- `supabase/functions/stripe-webhook/index.ts` (marcar `pending_payments.completed`)

### Lo que NO cambia
- Diseño visual del modal de pricing y AuthModal.
- Precios, productos Stripe, ni edge function `create-checkout` (suscripciones del flujo no-Reg2026).
- Lógica de roles, RLS de otras tablas.
- Confirmación de email sigue funcionando normalmente; sólo deja de bloquear el checkout inicial.
