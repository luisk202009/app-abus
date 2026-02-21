

# G08: Sincronizacion de Identidad y Refinamiento del Perfil

## Resumen

Cuatro mejoras: (1) selector de nacionalidad con buscador en el perfil, (2) sincronizacion automatica onboarding -> perfil al primer login, (3) nombre actualizado en sidebar/header, (4) badges de plan y boton mejorado en AdminUsersTab.

---

## 1. Selector de Nacionalidad en el Perfil

**Archivo:** `src/components/dashboard/ProfileSection.tsx`

- Importar `CountrySelect` de `@/components/onboarding/CountrySelect`
- En modo edicion, reemplazar el `<Input>` de nacionalidad (lineas 187-193) por `<CountrySelect>` con estilos adaptados para el perfil (mas compacto que la version onboarding)
- El componente `CountrySelect` ya tiene buscador integrado, lista de paises y banderas
- El valor se guarda en `onboarding_submissions.nationality` (logica existente en `handleSave`)

**Ajuste menor en CountrySelect:** Aceptar una prop opcional `compact` para renderizar con padding reducido (`py-2` en vez de `py-4`) cuando se usa dentro del perfil.

---

## 2. Sincronizacion Onboarding -> Perfil (Primer Login)

**Archivo:** `src/hooks/useAuth.tsx`

- Despues de `setUser(session.user)` en `onAuthStateChange`, agregar logica para verificar si el usuario tiene una `onboarding_submission` vinculada
- Si `full_name` o `nationality` estan vacios en la sesion pero existen en `onboarding_submissions`, copiar esos valores
- Esto se ejecuta una sola vez al detectar un evento `SIGNED_IN`

Flujo:
```text
onAuthStateChange(SIGNED_IN) ->
  fetch onboarding_submissions WHERE user_id = user.id ->
  if submission.full_name exists -> user metadata queda disponible
```

En la practica, el Dashboard ya hace un fetch de `onboarding_submissions` y usa `full_name` de ahi (linea 139-140). Lo que falta es que el sidebar reciba ese nombre actualizado.

**Archivo:** `src/pages/Dashboard.tsx`

- El `userData.name` ya se carga desde `onboarding_submissions.full_name` (linea 139-140)
- Asegurar que se pasa como `userName` al `DashboardSidebar` (verificar que esto ya funciona)
- Si el usuario edita su nombre en ProfileSection, actualizar `userData.name` en Dashboard para que el sidebar refleje el cambio sin recargar

---

## 3. Nombre Actualizado en el Sidebar

**Archivo:** `src/pages/Dashboard.tsx`

- Verificar que `userData.name` se pasa al sidebar como `userName`
- Agregar un listener o callback desde `ProfileSection` al guardar para actualizar el nombre en el estado del Dashboard
- Si no hay nombre, el fallback `user.email?.split("@")[0]` ya existe (linea 140)

**Cambio concreto:** Hacer que `ProfileSection` reciba un callback `onProfileUpdate` que actualice `userData` en el Dashboard al guardar.

---

## 4. Mejoras en AdminUsersTab

**Archivo:** `src/components/admin/AdminUsersTab.tsx`

**A. Columna "Estatus de Plan" con badges de colores:**
- La columna "Plan" ya existe (lineas 401-410) pero usa estilos poco diferenciados
- Cambiar los badges:
  - `pro` y `premium`: Badge verde (`bg-green-100 text-green-800`)
  - `free`: Badge gris (`bg-gray-100 text-gray-600`)
  - `Lead` (sin user_id): Badge outline como esta

**B. Boton "Gestionar Plan" mejorado:**
- Cambiar el icono de `Settings` a `CreditCard` (tarjeta de credito)
- Cambiar texto de "Plan" a "Gestionar Plan"
- Hacerlo visible siempre que `user.user_id` exista (ya funciona asi)

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/onboarding/CountrySelect.tsx` | Agregar prop `compact` para estilo reducido |
| `src/components/dashboard/ProfileSection.tsx` | Usar `CountrySelect` en lugar de Input para nacionalidad; agregar callback `onProfileUpdate` |
| `src/pages/Dashboard.tsx` | Pasar callback `onProfileUpdate` a ProfileSection; actualizar `userData` al guardar perfil |
| `src/components/admin/AdminUsersTab.tsx` | Badges verdes/grises para plan; icono CreditCard en boton |

No se requieren migraciones de base de datos. Todos los textos seran en espanol.

