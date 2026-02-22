

# Foto de perfil: subir avatar y mostrar en dashboard

## Resumen

Agregar la funcionalidad para que el usuario pueda subir una foto de perfil desde la seccion "Editar Perfil". La foto se mostrara tanto en la seccion de perfil como en el sidebar del dashboard (reemplazando el icono generico de usuario).

## Cambios necesarios

### 1. Base de datos: nueva columna `avatar_url`

Agregar columna `avatar_url` (tipo text, nullable) a la tabla `onboarding_submissions` para almacenar la URL publica de la foto.

```sql
ALTER TABLE onboarding_submissions ADD COLUMN avatar_url text;
```

### 2. Storage: nuevo bucket `avatars`

Crear un bucket publico `avatars` con politicas RLS que permitan:
- INSERT: usuarios autenticados pueden subir su propia foto (path = `user_id/filename`)
- UPDATE: usuarios autenticados pueden reemplazar su foto
- SELECT: cualquiera puede ver las fotos (bucket publico)
- DELETE: usuarios autenticados pueden borrar su propia foto

### 3. ProfileSection.tsx - UI de subida

Cuando el usuario esta en modo edicion:
- Mostrar un avatar circular con un boton de camara/upload encima
- Al hacer clic, abrir un file input que acepte imagenes (jpg, png, webp)
- Subir la imagen al bucket `avatars` con path `{user_id}/avatar.{ext}`
- Guardar la URL publica en `avatar_url` de `onboarding_submissions`
- Mostrar preview inmediato de la foto seleccionada

Cuando no esta editando:
- Mostrar la foto si existe, o el icono generico de User si no

### 4. DashboardSidebar.tsx - Mostrar avatar

- Recibir nueva prop `avatarUrl?: string`
- Si tiene valor, mostrar la imagen en el circulo del sidebar en lugar del icono `<User />`
- Usar el componente `Avatar` / `AvatarImage` / `AvatarFallback` de shadcn

### 5. Dashboard.tsx - Pasar avatar al sidebar

- Leer `avatar_url` del perfil del usuario (ya se hace query a `onboarding_submissions`)
- Pasar el valor como prop `avatarUrl` al `DashboardSidebar`
- Actualizar el estado cuando el usuario cambia su foto desde ProfileSection

---

## Detalle tecnico

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | Agregar columna `avatar_url` + crear bucket `avatars` + politicas RLS |
| `src/components/dashboard/ProfileSection.tsx` | Agregar input de imagen, preview, subida a Storage, guardar URL |
| `src/components/dashboard/DashboardSidebar.tsx` | Recibir `avatarUrl` prop, mostrar Avatar con imagen o fallback |
| `src/pages/Dashboard.tsx` | Leer `avatar_url` de la query, pasarlo al sidebar, actualizar al cambiar |

### Flujo de subida

1. Usuario hace clic en "Editar Perfil"
2. Aparece avatar con overlay de camara
3. Selecciona imagen desde su dispositivo
4. Se sube al bucket `avatars/{user_id}/avatar.webp`
5. Se obtiene URL publica
6. Al guardar, se incluye `avatar_url` en el payload del UPDATE
7. Sidebar y perfil muestran la nueva foto inmediatamente

