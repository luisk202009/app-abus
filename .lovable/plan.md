

# Cambiar flujo: Registro obligatorio antes del Dashboard

## Resumen

Actualmente un usuario puede llegar al Dashboard sin registrarse (el AnalysisModal navega directamente a `/dashboard` despues del analisis). El cambio hace que el registro sea **obligatorio** antes de acceder al Dashboard. Los datos del onboarding se vinculan al usuario al momento del registro, eliminando el problema de perfil que no se guarda.

---

## Flujo actual vs nuevo

```text
ACTUAL:
AnalysisModal (5 pasos) --> Guarda en DB (anonimo) --> Navega a /dashboard --> AuthBanner opcional

NUEVO:
AnalysisModal (5 pasos) --> Guarda en DB (anonimo) --> Muestra recomendacion --> 
  "Iniciar ruta" abre AuthModal (registro obligatorio) --> 
  Al registrarse, vincula lead con user_id --> Navega a /dashboard
```

---

## Cambios detallados

### 1. AnalysisModal.tsx - Registro obligatorio antes de navegar

En la pantalla de exito (recommendation screen), el boton "Iniciar esta ruta ahora" ya no navega directamente a `/dashboard`. En su lugar:

- Abre el `AuthModal` integrado dentro del AnalysisModal
- Pasa el `leadId` y `email` al AuthModal para vincular el lead
- Solo despues de un registro/login exitoso, navega a `/dashboard`
- El boton "Ver otros destinos" tambien requiere auth primero

Esto implica agregar estado `showAuthInModal` y renderizar `AuthModal` dentro del componente.

### 2. AuthModal.tsx - Vincular datos del onboarding al registrarse

El AuthModal ya tiene logica para vincular el `leadId` al usuario despues del signup (lineas 96-104). Este flujo se mantiene intacto. Solo se asegura que despues del signup exitoso, el `onSuccess` callback dispare la navegacion.

### 3. Dashboard.tsx - Proteger ruta (requiere auth)

- Agregar un guard al inicio: si `!user && !authLoading`, redirigir a `/` (homepage)
- Eliminar el `AuthBanner` ya que todos los usuarios del Dashboard estaran autenticados
- Eliminar la logica de estado para usuarios anonimos
- Simplificar `loadData` ya que siempre habra un `user`

### 4. App.tsx - Ruta protegida (opcional)

Se puede crear un componente `ProtectedRoute` que envuelva `/dashboard` y `/dashboard/route/:routeId` para redirigir automaticamente si no hay sesion. Alternativamente, el guard dentro de Dashboard es suficiente.

### 5. RLS Policy - INSERT para usuarios autenticados

Agregar la politica que permite a usuarios autenticados insertar su propia fila en `onboarding_submissions`:

```sql
CREATE POLICY "Users can insert their own submissions"
ON onboarding_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

Esto permite que el `upsert` del ProfileSection funcione correctamente para usuarios que se registraron sin pasar por el onboarding.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/AnalysisModal.tsx` | Boton "Iniciar ruta" abre AuthModal en vez de navegar directo. Navegar solo despues de auth exitoso |
| `src/pages/Dashboard.tsx` | Guard de auth (redirect a `/` si no logueado). Eliminar AuthBanner y logica anonima |
| `src/components/dashboard/AuthBanner.tsx` | Se puede eliminar (ya no se usa) |
| Migracion SQL | Agregar politica RLS INSERT para authenticated users |

---

## Que NO cambia

- Diseno, UX y CSS del AnalysisModal (los 5 pasos se mantienen identicos)
- Pantalla de recomendacion (se mantiene intacta visualmente)
- AuthModal (se reutiliza tal cual, solo se integra en el flujo del AnalysisModal)
- Flujo de upgrade de plan dentro del Dashboard
- EligibilityModals (Reg2026, Arraigos) no se modifican
- RegistrationModal del pricing se mantiene

