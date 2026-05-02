
## Problema

Tras aceptar la invitación, el abogado:
1. No puede definir contraseña (el link de Supabase es tipo `invite`, y `ResetPassword.tsx` solo reconoce `recovery`).
2. Cae al `/dashboard` normal con vista de cliente, no al portal.
3. Si visita `/portal-abogado` directamente sin sesión, es redirigido a `/` antes de que la sesión se hidrate.

La causa raíz es que la invitación `inviteUserByEmail` de Supabase **no envía un magic link a `/portal-abogado` que pueda definir contraseña**. El flujo correcto en Supabase para invitaciones es:

- El correo lleva al usuario a una URL con `#access_token=...&type=invite`
- La app debe detectar `type=invite`, pedir contraseña con `auth.updateUser({ password })`, y luego redirigir al portal.

## Solución

### 1. Nueva página `/aceptar-invitacion`

Crear `src/pages/AcceptInvitation.tsx`:
- Detecta `type=invite` o `type=recovery` en `window.location.hash`.
- Espera a que `onAuthStateChange` emita `USER_UPDATED` / `SIGNED_IN` con la sesión hidratada.
- Muestra formulario para definir contraseña.
- Tras `auth.updateUser({ password })`:
  - Consulta `lawyers` por `user_id`. Si existe → redirige a `/portal-abogado`.
  - Si no es abogado → redirige a `/dashboard`.

Registrar la ruta en `App.tsx`.

### 2. Actualizar `invite-lawyer/index.ts`

Cambiar el `redirectTo` de la invitación a `https://albus.com.co/aceptar-invitacion` (en lugar de `/portal-abogado`). Esto se aplica tanto al `inviteUserByEmail` como al fallback `signInWithOtp`.

### 3. Robustecer `LawyerPortal.tsx`

- Esperar hasta que `authLoading === false` Y `isLoading === false` antes de evaluar redirección.
- No redirigir a `/` mientras la sesión esté hidratándose (evita el rebote actual).
- Si el usuario está autenticado pero `lawyer` es null tras la carga, seguir mostrando "Cuenta sin perfil de abogado" (ya implementado) — pero solo después de un retry breve por si el `user_id` se acaba de vincular.

### 4. Redirección desde Dashboard si el usuario es abogado

En `Dashboard.tsx`, tras cargar `user`, hacer una consulta ligera a `lawyers` por `user_id`. Si existe registro → `navigate("/portal-abogado", { replace: true })`. Esto cubre el caso en que el abogado abre el dashboard por accidente o por un link viejo.

### 5. Configuración Supabase requerida (manual por el usuario)

En el dashboard de Supabase Auth → URL Configuration:
- **Site URL**: `https://albus.com.co`
- **Redirect URLs** (añadir):
  - `https://albus.com.co/aceptar-invitacion`
  - `https://www.albus.com.co/aceptar-invitacion`
  - `https://albus.com.co/portal-abogado`
  - `https://www.albus.com.co/portal-abogado`
  - `https://albus.com.co/reset-password`

Sin esto, Supabase ignora el `redirectTo` y usa Site URL por defecto (lo que está pasando ahora → cae en `/dashboard`).

## Archivos a modificar/crear

- **Nuevo**: `src/pages/AcceptInvitation.tsx`
- **Editar**: `src/App.tsx` (registrar ruta)
- **Editar**: `supabase/functions/invite-lawyer/index.ts` (cambiar `redirectTo`)
- **Editar**: `src/pages/LawyerPortal.tsx` (anti-rebote en hidratación de sesión)
- **Editar**: `src/pages/Dashboard.tsx` (auto-redirect a portal si es abogado)

## Acción manual requerida

Añadir `https://albus.com.co/aceptar-invitacion` (y variante `www`) a la lista de Redirect URLs en Supabase Auth.
