

# Corregir flujo de elegibilidad, exit intent y autenticacion

## Problemas identificados

1. **Exit Intent Modal bloquea la pantalla**: El modal de inactividad (30s) aparece pero no se puede cerrar porque usa un overlay custom sin boton de cierre accesible, y el click en el backdrop puede no funcionar correctamente cuando hay otros modales abiertos (como el ChecklistModal).

2. **Error al registrar email duplicado en calculadora**: `EligibilityCalculator.tsx` linea 65 hace un INSERT directo en `onboarding_submissions` sin verificar si el email ya existe. Si el usuario repite el proceso, falla por duplicado. Debe detectar el duplicado y mostrar "Ya tienes una cuenta" + abrir AuthModal en modo login.

3. **Usuario registrado sin contrasena**: El flujo de lead capture (nombre + email) crea un registro en `onboarding_submissions` pero nunca crea una cuenta auth. Cuando el usuario intenta iniciar sesion, no tiene contrasena porque nunca paso por signup. Hay que ofrecer una opcion de "Recuperar contrasena" o "Magic Link" para estos casos.

4. **Login sin opcion de recuperar contrasena**: `AuthModal.tsx` no tiene enlace "Olvidé mi contraseña". Falta implementar el flujo de password reset.

## Cambios a realizar

### 1. ExitIntentModal.tsx — No mostrar si hay un dialog abierto

- Antes de mostrar el modal, verificar si hay algun `[role="dialog"]` abierto en el DOM
- Si hay un dialog abierto, posponer el timer en vez de mostrar el exit intent
- Esto evita que se superponga al ChecklistModal u otros modales

### 2. EligibilityCalculator.tsx — Manejar email duplicado

- En `handleLeadSubmit`, usar `upsert` o hacer un SELECT previo para verificar si el email ya existe
- Si existe: mostrar toast "Ya tienes una cuenta" y abrir el AuthModal en modo login con el email prellenado
- Agregar estado para controlar la apertura del AuthModal
- Importar y renderizar `AuthModal`

### 3. AuthModal.tsx — Agregar "Olvidé mi contraseña"

- Agregar un enlace "¿Olvidaste tu contraseña?" debajo del campo de contrasena cuando `mode === "login"`
- Al hacer clic, mostrar un formulario simplificado que solo pida el email
- Llamar a `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })`
- Mostrar confirmacion de que se envio el email

### 4. Crear pagina /reset-password

- Nueva pagina `src/pages/ResetPassword.tsx`
- Detectar `type=recovery` en el URL hash
- Mostrar formulario para nueva contrasena
- Llamar a `supabase.auth.updateUser({ password })`
- Redirigir al dashboard tras exito
- Agregar ruta en `App.tsx`

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ExitIntentModal.tsx` | No mostrar si hay un dialog abierto |
| `src/components/eligibility/EligibilityCalculator.tsx` | Detectar email duplicado, abrir AuthModal |
| `src/components/auth/AuthModal.tsx` | Agregar flujo "Olvidé mi contraseña" |
| `src/pages/ResetPassword.tsx` | **Nuevo** — pagina para resetear contrasena |
| `src/App.tsx` | Agregar ruta `/reset-password` |

## Detalle tecnico

### ExitIntentModal - Verificacion de dialogs abiertos

```typescript
const show = useCallback(() => {
  if (sessionStorage.getItem(SESSION_KEY)) return;
  // Don't show if another dialog is open
  if (document.querySelector('[role="dialog"]')) return;
  sessionStorage.setItem(SESSION_KEY, "1");
  setIsOpen(true);
}, []);
```

### EligibilityCalculator - Manejo de duplicados

En `handleLeadSubmit`, capturar el error de constraint unique y abrir AuthModal:

```typescript
if (error) {
  if (error.code === "23505") { // unique violation
    toast.info("Ya tienes una cuenta. Inicia sesión.");
    setShowAuthModal(true);
    return;
  }
  throw error;
}
```

### AuthModal - Flujo de recuperacion

Agregar un tercer modo `"forgot"` al estado del modal:
- Muestra solo campo de email + boton "Enviar enlace de recuperación"
- Llama a `resetPasswordForEmail` con `redirectTo` al `/reset-password`
- Muestra confirmacion y permite volver al login

### ResetPassword page

- Lee el hash fragment para detectar `type=recovery`
- Muestra formulario de nueva contrasena con confirmacion
- Usa `supabase.auth.updateUser({ password })` 
- Redirige a `/dashboard` tras exito

