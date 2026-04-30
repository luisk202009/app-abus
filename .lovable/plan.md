
## Diagnóstico

Tras validar el perfil en la Calculadora de Regularización, el flujo actual hace:

1. Usuario elige Plan (Pro/Premium) → abre `AuthModal` con `allowUnconfirmed`.
2. `signUp` ejecuta `supabase.auth.signUp(...)`. Supabase **no devuelve sesión activa** hasta confirmar el email.
3. `QualificationSuccess` espera con `pendingCheckoutAfterAuth` a que `useAuth.user` exista para llamar a `create-one-time-payment`. Como no hay sesión, nunca se dispara el checkout y el usuario queda atrapado en "Tu cuenta está creada, revisa tu email".
4. Si el usuario confirma el email y entra al Dashboard, `Dashboard.tsx` autoejecuta `handleStartRoute` para Reg2026 y, al ser Free, dispara `SlotExhaustedModal` (que ofrece sólo "Mejorar a Pro €9,99/mes" como suscripción mensual genérica, no los planes one-time de Reg2026).
5. El bloqueo de 1 ruta gratis se aplica a **todas** las rutas, incluyendo Reg2026, cuando debería excluirse (Reg2026 es un producto de pago aparte; las demás rutas sí cuentan en el límite Free).

## Cambios

### 1. Sesión inmediata tras signup en flujo Reg2026

Habilitar **autoconfirm de sesión** sin esperar verificación de email para el flujo de pago:

- En `useAuth.signUp`: tras llamar a `supabase.auth.signUp`, si no hay `session` devuelta, hacer `supabase.auth.signInWithPassword(email, password)` automáticamente. Esto crea sesión local aunque el email no esté confirmado (Supabase lo permite por defecto salvo que "Confirm email" esté forzado; si bloquea, capturar `email_not_confirmed` y devolver el `error` original sin afectar otros flujos).
- Alternativa robusta: añadir parámetro `signUp(email, password, { autoLogin?: boolean })`. Cuando `autoLogin = true` (lo usaremos sólo desde `QualificationSuccess`), forzamos el `signInWithPassword` posterior.
- En `AuthModal`, propagar `allowUnconfirmed` al llamar `signUp(email, password, { autoLogin: allowUnconfirmed })`.

Resultado: tras pulsar "Crear cuenta" desde QualificationSuccess, `useAuth.user` y `session` quedan poblados de inmediato, `pendingCheckoutAfterAuth` dispara `initiateCheckout`, y el usuario va directo a Stripe sin pasar por el correo.

### 2. QualificationSuccess: navegar al Dashboard antes de Stripe

Hoy `initiateCheckout` abre Stripe en `_blank` y deja la página de la calculadora abierta. Cambiar a:

- Tras recibir `data.url`, primero `navigate('/dashboard?pending_payment=...')` y luego `window.open(data.url, '_blank')`. Si el popup se bloquea, el banner de pago pendiente del Dashboard ya permite reintentar.
- Esto cumple "después del pago lleva al dashboard, si el pago no se procesa correctamente igual lleva al dashboard pero genera un alert con el pendiente de pago" (ya implementado vía `PendingPaymentAlert`).

### 3. Excluir Reg2026 del límite de 1 ruta Free

En `src/hooks/useRoutes.tsx`:

- Identificar Reg2026 por el `template_id` constante `57b27d4a-190b-4ece-a1c3-de1859d58217` (ya usado en `Dashboard.tsx`). Extraerlo a `src/lib/documentConfig.ts` como `REG2026_TEMPLATE_ID`.
- Modificar el cálculo de `canAddRoute` para Free: contar sólo rutas activas cuyo `template_id !== REG2026_TEMPLATE_ID`. Reg2026 nunca consume el slot gratuito.
- Modificar `slotExhausted`: misma exclusión.
- En `startRoute`: si `templateId === REG2026_TEMPLATE_ID` y el usuario es Free, permitir crearla sin chequeos de slot. El backend trigger `increment_total_routes_created` se sigue ejecutando — para que no consuma el contador, añadir migración que excluya Reg2026 del increment (ver §5).

En `Dashboard.tsx` (auto-start por `source=reg2026`):

- Cuando `source === "reg2026"`, **no** mostrar `SlotExhaustedModal` aunque sea Free; permitir iniciar la ruta directamente. La monetización ya ocurrió (o quedó pendiente) en QualificationSuccess.
- Mantener el bloqueo Free para `arraigos` y demás (sí consume el slot único).

### 4. Reemplazar SlotExhaustedModal por selector Pro/Premium

El modal actual sólo ofrece "Mejorar a Pro €9,99/mes". Cumplir requisito "debe mostrar los dos planes disponibles, pro y premium":

- Refactorizar `src/components/dashboard/SlotExhaustedModal.tsx` a layout de 2 tarjetas (Plan Pro €9,99/mes y Plan Premium €19,99/mes), reutilizando `PricingCard` o un layout simple in-place.
- Cada tarjeta llama a `handleCheckout(planId)` (suscripción). Hay que extender `useSubscription.handleCheckout` para aceptar `planType: 'pro' | 'premium'` y enviarlo al backend `create-checkout` (ya recibe `planType`/`priceId` o usar un `priceId` por plan).
- Mantener botón "Entendido" para cerrar el modal sin pagar (permitiendo seguir como Free, con el slot ya consumido por la otra ruta).

### 5. Migración: trigger no incrementa para Reg2026

Crear migración SQL para modificar `increment_total_routes_created()`:

```sql
CREATE OR REPLACE FUNCTION public.increment_total_routes_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot increment routes for other users';
  END IF;

  -- Reg2026 es un producto de pago independiente: no consume el slot Free
  IF NEW.template_id = '57b27d4a-190b-4ece-a1c3-de1859d58217'::uuid THEN
    RETURN NEW;
  END IF;

  UPDATE onboarding_submissions
  SET total_routes_created = total_routes_created + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;
```

### 6. Tests

Actualizar tests existentes:

- `AuthModal.test.tsx`: cubrir nuevo `autoLogin` tras signup.
- `QualificationSuccess.test.tsx`: validar que tras signup exitoso se invoca `create-one-time-payment` sin esperar confirmación de email.
- Añadir test al `SlotExhaustedModal` para verificar que muestra ambos planes y que Reg2026 no abre el modal.

## Diagrama del nuevo flujo Reg2026

```text
Calculadora → "Perfil Validado"
   │
   ▼
Elige Plan (Pro/Premium)
   │
   ▼
AuthModal (signup, allowUnconfirmed)
   │  signUp() + autoLogin → sesión inmediata
   ▼
initiateCheckout() → create-one-time-payment
   │
   ├── url OK → navigate(/dashboard?pending_payment=...) + window.open(stripe)
   │       └── webhook completa → PendingPaymentAlert desaparece
   │
   └── error → navigate(/dashboard?pending_payment=...&payment_error=1)
           └── PendingPaymentAlert ofrece "Reintentar pago"
```

## Archivos a modificar

- `src/hooks/useAuth.tsx` — añadir `autoLogin` a `signUp`.
- `src/components/auth/AuthModal.tsx` — propagar `autoLogin = allowUnconfirmed`.
- `src/components/eligibility/QualificationSuccess.tsx` — navegar al Dashboard antes de abrir Stripe.
- `src/hooks/useRoutes.tsx` — excluir Reg2026 de `canAddRoute`/`slotExhausted`.
- `src/pages/Dashboard.tsx` — auto-start Reg2026 sin bloquear con SlotExhaustedModal.
- `src/lib/documentConfig.ts` — exportar `REG2026_TEMPLATE_ID`.
- `src/components/dashboard/SlotExhaustedModal.tsx` — layout de dos planes (Pro y Premium).
- `src/hooks/useSubscription.tsx` — `handleCheckout(planType)` con elección Pro/Premium.
- Migración nueva: `increment_total_routes_created` excluye Reg2026.
- Tests: `AuthModal.test.tsx`, `QualificationSuccess.test.tsx`, nuevo test para `SlotExhaustedModal`.
