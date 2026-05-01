# Acceso y gestión completa de abogados

## Objetivo

Permitir que un admin (1) cree un abogado, (2) le envíe una invitación por email para que defina su contraseña, (3) su cuenta de auth quede automáticamente vinculada con la fila de `lawyers`, y (4) el admin pueda **editar** todos los datos del abogado, no solo verificar/activar.

---

## 1. Edge Function `invite-lawyer` (nueva)

Ruta: `supabase/functions/invite-lawyer/index.ts`. `verify_jwt = true` y validación con `is_admin()` antes de actuar.

Hace tres cosas con `SERVICE_ROLE`:

1. Verifica que el llamador sea admin (`has_role(auth.uid(), 'admin')`).
2. Llama a `supabase.auth.admin.inviteUserByEmail(email, { redirectTo: '<origin>/portal-abogado' })`. Esto crea el usuario en `auth.users` y envía un email con magic link para definir contraseña.
3. Hace `UPDATE lawyers SET user_id = <nuevo auth user id> WHERE id = <lawyer_id>` para dejar la fila enlazada de inmediato.

Si el email ya existe en auth, hace fallback: busca el `auth.users.id` por email y solo actualiza `lawyers.user_id`, devolviendo un mensaje "Usuario ya existía, vinculado correctamente".

## 2. Edge Function `update-lawyer` (nueva)

Ruta: `supabase/functions/update-lawyer/index.ts`. Verifica admin, valida payload con Zod (campos opcionales: `full_name`, `email`, `phone`, `bar_number`, `college`, `city`, `bio`, `specialties[]`, `languages[]`, `photo_url`) y hace `UPDATE lawyers` con SERVICE_ROLE. Esto evita depender del cliente y centraliza la auditoría.

> Alternativa más simple si prefieres: usar directamente `supabase.from('lawyers').update(...)` desde el frontend — la policy `Admin can manage lawyers` ya lo permite. **Recomiendo esta vía** y reservar la edge function solo para `invite-lawyer`. Decidiremos en build.

## 3. Frontend `AdminLawyersTab.tsx`

Cambios:

- **Botón "Editar"** en cada fila junto a los toggles de verificación/activación. Abre el mismo `Sheet` reutilizable, prellenado con los datos del abogado.
- **Estado**: `editingLawyer: Lawyer | null` para diferenciar entre crear vs editar.
- **handleSave** unificado: si `editingLawyer` existe, hace `UPDATE`; si no, hace `INSERT` (lógica actual).
- **Botón "Enviar invitación"** en cada fila (icono `Mail`):
  - Visible solo si `lawyer.user_id IS NULL` (no vinculado aún).
  - Si `user_id` ya existe, muestra un badge verde "Acceso activo".
  - Llama a `supabase.functions.invoke('invite-lawyer', { body: { lawyer_id, email } })`.
  - Toast de éxito: "Invitación enviada a {email}. Revisarán su correo para definir contraseña."
- **Columna "Acceso"** nueva en la tabla con estados: "Sin acceso" (gris) / "Invitado" (ámbar) / "Activo" (verde según `user_id` no nulo).

## 4. Indicador visual en el portal del abogado

En `LawyerPortal.tsx` actualmente, si el usuario auth no tiene fila en `lawyers`, lo redirige silenciosamente a `/`. Añadir un mensaje claro: "Tu cuenta no está registrada como abogado. Contacta al administrador." antes de redirigir.

## 5. Documentación al admin (UI)

En la parte superior de `AdminLawyersTab` añadir un pequeño bloque informativo (icono `Info` + texto):

> "Para dar acceso a un abogado: 1) Crea su perfil con email. 2) Pulsa 'Enviar invitación'. 3) El abogado recibirá un email para definir contraseña y entrará en /portal-abogado."

---

## Archivos afectados

- **Nuevos**:
  - `supabase/functions/invite-lawyer/index.ts`
  - `supabase/config.toml` (registro de la función con `verify_jwt = true`)
- **Modificados**:
  - `src/components/admin/AdminLawyersTab.tsx` — edición + invitación + columna acceso + bloque info
  - `src/pages/LawyerPortal.tsx` — mensaje claro cuando no hay perfil de abogado

## Verificación

1. Crear un abogado de prueba desde admin → fila aparece "Sin acceso".
2. Pulsar "Enviar invitación" → toast confirma envío, fila pasa a "Invitado".
3. Abrir email, definir contraseña → redirige a `/portal-abogado` y entra al panel.
4. Editar el abogado desde admin → cambios reflejados en `lawyers`.
5. Verificar que `lawyers.user_id` quedó poblado correctamente.

## Notas técnicas

- Las invitaciones de Supabase requieren tener el dominio de redirección `albus.com.co` permitido en **Authentication → URL Configuration** del dashboard. Si la invitación falla con "redirect_to not allowed", hay que añadir `https://albus.com.co/portal-abogado` y `https://app-abus.lovable.app/portal-abogado` a la lista.
- La política RLS `Lawyers can update own profile` ya permite que el abogado, una vez con `user_id` vinculado, edite su propio perfil desde el portal.
