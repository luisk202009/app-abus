# Fix: Error "duplicate key" al guardar perfil tras crear cuenta

## Diagnóstico

El error `duplicate key value violates unique constraint "onboarding_submissions_email_key"` ocurre en `ProfileSection.handleSave()` en este escenario:

1. El usuario llena el calculador de elegibilidad → se crea fila en `onboarding_submissions` con su email pero `user_id = NULL` (lead).
2. Crea cuenta vía `AuthModal`. El código intenta reclamar la fila usando `leadId` desde localStorage, pero **si `leadId` no está presente** (caso típico cuando el usuario regresa más tarde, limpia storage, o entra desde otro flujo), la fila queda con `user_id = NULL`.
3. En el Dashboard → Perfil → Guardar:
   - `UPDATE ... WHERE user_id = X` → 0 filas (no hay fila con su user_id)
   - Reclamo `UPDATE ... WHERE email = X AND user_id IS NULL` → debería funcionar **PERO** el problema es que el bloque solo hace claim si la condición `IS NULL` se cumple, y si no encuentra, intenta `INSERT` con el mismo email → choca con constraint UNIQUE sobre email.

Verificado en BD: existe `email='ventas@albus.com.co'` con `user_id=NULL` desde el 29-abr. La RLS probablemente impide que el usuario actualice esa fila huérfana porque las políticas filtran por `user_id = auth.uid()`, no por email.

## Solución

### 1. Backend: Edge function `claim-onboarding-row`

Crear una pequeña edge function que use `SERVICE_ROLE` para reclamar la fila huérfana de `onboarding_submissions` por email del usuario autenticado. Esto bypassa RLS de forma segura porque:
- Verifica `supabase.auth.getUser(token)` para confirmar identidad.
- Solo asigna `user_id` a filas con `user_id IS NULL` cuyo email coincida con el del JWT.
- No expone datos: solo devuelve `{ claimed: true/false, id }`.

### 2. Frontend: `ProfileSection.handleSave()`

Reemplazar el bloque de reclamo manual por una llamada a la edge function antes del UPDATE/INSERT:

```text
1. Invocar claim-onboarding-row → asigna user_id si hay fila huérfana con mismo email
2. UPDATE ... WHERE user_id = auth.uid()  (ahora encuentra la fila)
3. Si aún 0 filas → INSERT (caso: usuario nuevo sin lead previo)
```

Esto elimina la rama defectuosa que intentaba INSERT con email duplicado.

### 3. AuthModal: usar la misma edge function

Tras un signup exitoso, llamar también a `claim-onboarding-row` (además del claim por `leadId` que ya existe), como red de seguridad cuando `leadId` no está disponible. Así el perfil queda consistente desde el primer login y no requiere visitar la sección Perfil para arreglarse.

### 4. Dashboard / hooks que dependen del perfil

No requieren cambios: `useSubscription`, `useRoutes`, `Dashboard` ya leen por `user_id` y obtendrán datos correctamente una vez la fila quede reclamada.

## Archivos a modificar

- **Crear**: `supabase/functions/claim-onboarding-row/index.ts` — edge function con SERVICE_ROLE.
- **Editar**: `supabase/config.toml` — registrar función con `verify_jwt = true`.
- **Editar**: `src/components/dashboard/ProfileSection.tsx` — invocar claim antes de UPDATE/INSERT, eliminar la rama de claim manual.
- **Editar**: `src/components/auth/AuthModal.tsx` — invocar claim tras signup como fallback cuando no hay `leadId`.
- **Crear**: `supabase/functions/claim-onboarding-row/index.test.ts` — verificar claim correcto y rechazo cuando email no coincide.

## Resultado esperado

- Usuario `ventas@albus.com.co` (y cualquier caso similar) podrá guardar su perfil sin errores.
- La fila huérfana existente queda reclamada automáticamente al entrar al Dashboard o al guardar perfil.
- No se rompe el flujo Reg2026 ni el conteo de slots Free.
