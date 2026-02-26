

# Corregir flujo completo: Elegibilidad -> Pago -> Registro -> Dashboard con ruta activa

## Problemas identificados (6 issues)

1. **ChecklistModal CTA "Activar Plan Pro ahora" lleva a /explorar** en vez de iniciar checkout de suscripcion
2. **En /explorar, al iniciar ruta sin auth, muestra AuthModal de registro** -- pero tras registrarse muestra "creada con exito" y vuelve a pedir registro, generando error de duplicado
3. **Regularizacion/Arraigo son rutas premium** que no deberian ser accesibles en plan gratis; el CTA debe llevar a pagar, no a /explorar
4. **Tras registro (signup), la cuenta no tiene user_id vinculado en onboarding_submissions**, por lo que el Dashboard no puede auto-iniciar la ruta
5. **Email de confirmacion de cuenta redirige a `window.location.origin`** (raiz `/`) en vez de `/dashboard` con la ruta apropiada
6. **RegistrationModal (pago one-time) requiere auth** pero no crea cuenta Supabase, solo guarda en localStorage y redirige a Stripe

## Solucion propuesta

### Flujo objetivo (Regularizacion/Arraigo):

```text
Landing -> Elegibilidad Modal -> QualificationSuccess (pricing)
  -> RegistrationModal: nombre + email -> Stripe Checkout (suscripcion)
  -> /success -> auto-login o magic-link -> /dashboard -> ruta auto-activada
```

### Flujo objetivo (ChecklistModal CTA):

```text
Checklist CTA "Activar Plan Pro" -> Checkout de suscripcion (no /explorar)
```

---

## Archivos a modificar

### 1. `src/components/eligibility/ChecklistModal.tsx`
**Problema**: El boton "Activar Plan Pro ahora" navega a `/explorar`.
**Cambio**: 
- Si el usuario esta autenticado, llamar a `handleCheckout()` de `useSubscription` directamente
- Si NO esta autenticado, abrir el AuthModal con `onSuccess` que redirige a `/dashboard` con `source` en localStorage
- Importar `useAuth`, `useSubscription`, y `AuthModal`

### 2. `src/components/eligibility/QualificationSuccess.tsx`
**Problema**: Muestra pricing con RegistrationModal que hace pago one-time sin crear cuenta auth.
**Cambio**:
- Reemplazar la logica de `RegistrationModal` por un flujo que:
  1. Primero abra `AuthModal` para crear cuenta (signup) si no esta autenticado
  2. Tras auth exitosa, inicie checkout de suscripcion via `create-checkout`
  3. Guarde `onboarding_source` en localStorage para auto-activar la ruta tras pago
- Agregar estado para manejar si el usuario ya esta autenticado (skip auth, ir directo a checkout)

### 3. `src/components/eligibility/RegistrationModal.tsx`
**Problema**: Invoca `create-one-time-payment` sin crear cuenta auth de Supabase. El usuario paga pero no tiene cuenta.
**Cambio**: 
- Transformar para que primero verifique si hay session auth activa
- Si no hay session: abrir AuthModal antes de proceder al checkout
- Tras auth, usar `create-checkout` (suscripcion) en vez de `create-one-time-payment`
- O alternativamente: eliminar `RegistrationModal` y consolidar la logica en `QualificationSuccess`

### 4. `src/hooks/useAuth.tsx`
**Problema**: `signUp` usa `emailRedirectTo: window.location.origin` que lleva a `/` en vez de `/dashboard`.
**Cambio**:
- Cambiar `emailRedirectTo` a `window.location.origin + "/dashboard"`
- Esto asegura que cuando el usuario confirma su email, llega al dashboard

### 5. `src/pages/Explorar.tsx`
**Problema**: `handleStartRoute` muestra AuthModal generico. Tras registrarse con exito, no navega correctamente y genera loop de re-registro.
**Cambio**:
- Agregar `onSuccess` al AuthModal que, tras login/signup exitoso, reintente `handleStartRoute` con el template seleccionado
- Guardar el `templateId` pendiente en estado para reintentarlo tras auth

### 6. `src/components/AnalysisModal.tsx`
**Problema**: Tras el AuthModal de signup, navega a `/dashboard` con state. Pero si el email no esta confirmado, el usuario queda en limbo. Si el usuario ya existe, genera error de duplicado en onboarding_submissions.
**Cambio**:
- Verificar si ya existe registro en `onboarding_submissions` antes de INSERT (usar upsert o SELECT previo)
- En `handleAuthSuccess`, guardar `onboarding_source` en localStorage para que el Dashboard auto-active la ruta

### 7. `src/pages/Dashboard.tsx` (lineas 170-201)
**Problema**: Auto-start logic depende de `canAddRoute` que es `false` para free users que ya usaron su slot. Regularizacion/Arraigo requieren plan Pro.
**Cambio**:
- En el auto-start logic, si `source` es "reg2026" o "arraigos" y el usuario es free, mostrar el SlotExhaustedModal o redirigir a checkout en vez de intentar crear la ruta
- Leer `payment_success` de localStorage para detectar post-pago exitoso y activar la ruta

### 8. `src/pages/Success.tsx`
**Problema**: Tras el pago (one-time o suscripcion), actualiza `onboarding_submissions` sin tener `user_id`. El usuario no tiene sesion auth activa.
**Cambio**:
- Si el usuario llega de un flujo de suscripcion (`create-checkout`), ya tiene auth session activa
- Verificar session auth, si existe: vincular user_id al onboarding_submission
- Guardar `onboarding_source` basado en `routeTemplateSlug` del pago para que Dashboard auto-active la ruta
- Redirigir automaticamente a `/dashboard` tras procesar

---

## Detalle tecnico

### Flujo simplificado post-implementacion:

```text
1. Usuario pasa elegibilidad en landing de Regularizacion/Arraigo
2. Ve QualificationSuccess con planes Pro/Premium
3. Elige plan -> Se abre AuthModal (signup/login)
4. Tras auth exitosa:
   a. Se guarda onboarding_source en localStorage
   b. Se inicia checkout de suscripcion (create-checkout)
   c. Stripe redirige a /success
5. /success detecta session auth, actualiza subscription_status
6. /success guarda onboarding_source y redirige a /dashboard
7. Dashboard detecta source, auto-activa la ruta correspondiente
```

### Cambio en emailRedirectTo (useAuth.tsx):

```typescript
// Antes:
emailRedirectTo: window.location.origin
// Despues:
emailRedirectTo: window.location.origin + "/dashboard"
```

### ChecklistModal CTA (ChecklistModal.tsx):

```typescript
// Antes: navigate("/explorar")
// Despues:
if (user) {
  onClose();
  handleCheckout(); // Stripe subscription checkout
} else {
  setShowAuth(true); // AuthModal -> onSuccess -> handleCheckout
}
```

### QualificationSuccess flujo revisado:

En vez de abrir RegistrationModal (nombre+email+stripe one-time), el nuevo flujo:
1. Al seleccionar plan, guardar plan seleccionado en estado
2. Si NO hay user auth -> abrir AuthModal
3. Tras auth exitosa -> guardar `onboarding_source` + llamar `create-checkout` con el priceId del plan seleccionado
4. Si YA hay user auth -> ir directo a checkout

### Dashboard auto-start con gating:

```typescript
// Verificar si el usuario tiene el plan necesario para la ruta
if (source === "reg2026" || source === "arraigos") {
  if (!isPremium) {
    // No tiene plan Pro/Premium, mostrar modal de upgrade
    setShowSlotExhaustedModal(true);
    localStorage.removeItem("onboarding_source");
    return;
  }
  // Tiene plan, proceder a crear la ruta
  templateToStart = source === "reg2026" 
    ? TEMPLATE_IDS.regularizacion2026 
    : TEMPLATE_IDS.arraigoSocial;
}
```

### AnalysisModal - Evitar duplicados:

```typescript
// Usar upsert por email en vez de insert
const { data: existing } = await supabase
  .from("onboarding_submissions")
  .select("id")
  .eq("email", submissionData.email)
  .maybeSingle();

if (existing) {
  setLeadId(existing.id);
  // Update en vez de insert
  await supabase.from("onboarding_submissions")
    .update(submissionData)
    .eq("id", existing.id);
} else {
  const { data } = await supabase.from("onboarding_submissions")
    .insert([submissionData]).select("id").single();
  setLeadId(data?.id);
}
```

---

## Archivos que NO se modifican

- `supabase/functions/create-checkout/index.ts` -- ya funciona correctamente para suscripciones
- `supabase/functions/stripe-webhook/index.ts` -- ya actualiza subscription_status correctamente
- `src/hooks/useSubscription.tsx` -- ya lee correctamente el status
- `src/hooks/useRoutes.tsx` -- la logica de canAddRoute ya es correcta
- `src/components/auth/AuthModal.tsx` -- ya tiene login/signup/magic-link/forgot, no requiere cambios

## Resumen de impacto

| Archivo | Tipo de cambio |
|---------|---------------|
| `ChecklistModal.tsx` | CTA: `/explorar` -> checkout suscripcion |
| `QualificationSuccess.tsx` | Integrar auth + checkout directo |
| `RegistrationModal.tsx` | Refactorizar o eliminar (consolidar en QualificationSuccess) |
| `useAuth.tsx` | emailRedirectTo -> `/dashboard` |
| `Explorar.tsx` | Fix auth loop en startRoute |
| `AnalysisModal.tsx` | Upsert en vez de insert |
| `Dashboard.tsx` | Gating premium en auto-start |
| `Success.tsx` | Vincular user_id + guardar source + redirect a dashboard |

