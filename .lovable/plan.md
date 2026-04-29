# Plan: Pruebas E2E del flujo de Regularización

## Objetivo

Crear una suite de pruebas automatizadas que valide de extremo a extremo el flujo de pago de la página de Regularización: registro de cuenta → creación de sesión Stripe → webhook → banner de pago pendiente en el Dashboard, incluyendo los caminos de error (rate limit de email y reintento de pago).

## Enfoque

El proyecto ya tiene Vitest (`src/test/setup.ts`, `vitest.config.ts`). Stripe Checkout y Supabase Auth no se pueden ejecutar de verdad en CI sin credenciales y sin un navegador, por lo que la suite combinará dos niveles:

1. **Tests de integración frontend (Vitest + Testing Library)** con `@supabase/supabase-js` y `stripe` mockeados. Validan toda la lógica de UI/transición de estado.
2. **Tests Deno de las edge functions** (`create-one-time-payment` y `stripe-webhook`) usando `Deno.test` con Stripe y Supabase mockeados, ejecutables vía `supabase--test_edge_functions`.

No se introduce Playwright/Cypress (no está configurado en el proyecto y añadiría dependencias pesadas). Si más adelante se desea un E2E real con navegador, se puede añadir como segunda fase.

## Archivos a crear

### Tests de frontend (Vitest)

- `src/test/utils/mockSupabase.ts` — helper que construye un mock del cliente Supabase con `auth.signUp`, `auth.signInWithPassword`, `auth.getUser`, `functions.invoke`, `from().select/insert/update`, y un canal Realtime simulado. Permite forzar respuestas (rate limit 429, éxito, error de red).
- `src/test/utils/renderWithProviders.tsx` — envuelve componentes con `QueryClientProvider`, `BrowserRouter` y `Toaster`.
- `src/components/auth/__tests__/AuthModal.test.tsx`:
  - Caso A: signup exitoso con `allowUnconfirmed=true` → resuelve y entrega user.
  - Caso B: Supabase devuelve `email rate limit exceeded` (429) → muestra toast específico y NO bloquea el flujo si `allowUnconfirmed=true`.
  - Caso C: email duplicado → cambia automáticamente a modo login.
- `src/components/eligibility/__tests__/QualificationSuccess.test.tsx`:
  - Flujo feliz: usuario completa AuthModal → se invoca `create-one-time-payment` → recibe URL → se abre Stripe (verificar `window.open`).
  - Flujo con fallo de checkout: la función devuelve error → redirige a `/dashboard?pending_payment=...`.
  - Flujo cancelado: simula vuelta desde Stripe con `?canceled=true` → redirige a Dashboard con parámetro de pendiente.
- `src/components/dashboard/__tests__/PendingPaymentAlert.test.tsx`:
  - Renderiza banner cuando existe registro `pending` para el usuario.
  - Botón "Reintentar pago" invoca `create-one-time-payment` con el `pending_payment_id` correcto y abre nueva sesión Stripe.
  - Botón "Cancelar" actualiza el registro a `cancelled` y oculta el banner.
  - Suscripción Realtime: al recibir UPDATE con `status=completed` el banner desaparece.

### Tests de edge functions (Deno)

- `supabase/functions/create-one-time-payment/index.test.ts`:
  - Crea sesión Stripe correctamente para usuario autenticado (mock de `stripe.checkout.sessions.create`).
  - Inserta registro en `pending_payments` con status `pending` y guarda `stripe_session_id`.
  - Si recibe `pending_payment_id`, actualiza ese registro en lugar de crear uno nuevo (reintento).
  - Permite checkout aunque el email no esté confirmado (no exige `email_confirmed_at`).
  - Devuelve 401 si falta el header Authorization.
- `supabase/functions/stripe-webhook/index.test.ts`:
  - Evento `checkout.session.completed` con `stripe_session_id` conocido → marca `pending_payments.status='completed'`.
  - Evento con firma inválida → 400 sin tocar BD.
  - Evento `checkout.session.expired` → marca `status='failed'` con `error_message`.

Todos los tests Deno usan `import "https://deno.land/std@0.224.0/dotenv/load.ts"` y consumen los response bodies (regla del proyecto). Stripe se mockea sustituyendo el constructor por uno que devuelve objetos predefinidos; Supabase se mockea con un cliente factory que registra llamadas.

## Casos clave cubiertos

```text
Escenario                          Frontend  EdgeFn
---------------------------------  --------  ------
Signup OK + checkout OK + webhook    ✓        ✓
Rate limit (429) en signup           ✓        —
Email duplicado → login              ✓        —
Checkout falla → redirige a Dash     ✓        ✓
Banner aparece tras redirección      ✓        —
Reintento desde banner               ✓        ✓
Cancelar pago desde banner           ✓        —
Realtime: webhook → banner oculto    ✓        ✓
Webhook firma inválida               —        ✓
```

## Detalles técnicos

- **Mock de `window.open`**: en `setup.ts` extender con `vi.spyOn(window, 'open')` reseteado en cada test.
- **Mock de Realtime**: `mockSupabase.channel()` devuelve un objeto con `on().subscribe()` que expone `triggerEvent(payload)` para simular UPDATE.
- **Aislamiento**: cada test crea un `QueryClient` nuevo y limpia mocks con `afterEach(vi.clearAllMocks)`.
- **Variables de entorno para Deno**: aprovechar `.env` ya poblado con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. Las claves Stripe y service role se mockean (no se invoca Stripe real).
- **Ejecución**: `bunx vitest run` para frontend; `supabase--test_edge_functions` para Deno.

## Fuera de alcance

- No se prueba la UI real de Stripe Checkout (es un dominio externo).
- No se ejecuta navegador real; si se requiere, segunda fase con Playwright.
- No se modifica código de producción salvo, si fuera necesario, exportar tipos auxiliares para los tests.

## Entregables

1. 3 archivos de test de frontend + 2 helpers.
2. 2 archivos de test Deno para edge functions.
3. Comprobación de que `bunx vitest run` y `supabase--test_edge_functions` pasan en verde.
4. Resumen final con cobertura por escenario.
