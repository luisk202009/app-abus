

# Plan: Corrección de Bugs de Autenticación y Modo Admin

## Problemas Identificados

### Problema 1: Banner "Regístrate" aparece para usuarios logueados

**Causa**: En la imagen, el banner aparece porque el usuario realmente NO está logueado. Los intentos de login fallan con error "Email not confirmed".

**Usuarios afectados**:
- `laugrisales919@gmail.com` - email_confirmed_at: NULL
- `luisk20@gmail.com` - email_confirmed_at: NULL
- `l@albus.com.co` - confirmado correctamente

### Problema 2: Error "Email not confirmed" al iniciar sesión

**Causa**: Supabase tiene habilitada la verificación de email por defecto. Los usuarios se registraron pero nunca hicieron clic en el enlace de confirmación.

**Logs de Auth** (del contexto):
```
"error": "400: Email not confirmed"
"mail_type": "confirmation" → enviado a laugrisales919@gmail.com
"mail_type": "confirmation" → enviado a luisk20@gmail.com
```

### Problema 3: Modo Admin no aplica límites correctamente

**Causa**: `useRoutes.tsx` línea 56-57 recalcula `maxRoutes` localmente:
```typescript
const maxRoutes = isPremium ? 3 : 1;  // Ignora effectiveMaxRoutes
```

---

## Soluciones

### Solución 1: Mejorar el manejo del error "Email not confirmed"

Modificar `AuthModal.tsx` para detectar este error específico y mostrar un mensaje claro al usuario con opción de reenviar el email de confirmación.

**Cambios en `AuthModal.tsx`**:

| Cambio | Descripción |
|--------|-------------|
| Detectar error específico | Verificar si el error contiene "email not confirmed" |
| Mostrar mensaje claro | Indicar al usuario que debe confirmar su email |
| Botón reenviar | Agregar opción para reenviar el email de confirmación |

### Solución 2: Corregir el modo Admin

Modificar `useRoutes.tsx` para usar `maxRoutes` directamente de `useSubscription` en lugar de recalcularlo.

**Cambios en `useRoutes.tsx`**:

```text
Antes (línea 47-57):
  const { isPremium } = useSubscription();
  ...
  const maxRoutes = isPremium ? 3 : 1;

Después:
  const { maxRoutes } = useSubscription();
  // Eliminar la recalculación local
```

### Solución 3: Corregir el cálculo en useSubscription para modo Admin

Modificar `useSubscription.tsx` para que cuando el usuario sea admin (sin importar el modo de prueba), use los valores efectivos del contexto.

**Cambios en `useSubscription.tsx`**:

```text
Antes (líneas 110-112):
  const isPremium = isTestingAsUser ? effectiveIsPremium : realIsPremium;
  const maxRoutes = isTestingAsUser ? effectiveMaxRoutes : (realIsPremium ? 3 : 1);

Después:
  const isPremium = isAdmin ? effectiveIsPremium : realIsPremium;
  const maxRoutes = isAdmin ? effectiveMaxRoutes : (realIsPremium ? 3 : 1);
```

---

## Archivos a Modificar

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `src/components/auth/AuthModal.tsx` | Manejar error "email not confirmed" y agregar botón reenviar | Alta |
| `src/hooks/useSubscription.tsx` | Usar `isAdmin` en lugar de `isTestingAsUser` | Alta |
| `src/hooks/useRoutes.tsx` | Usar `maxRoutes` de useSubscription | Alta |

---

## Flujo Corregido para Email No Confirmado

```text
Usuario intenta iniciar sesión
         │
         ▼
┌────────────────────────┐
│ signIn() retorna error │
│ "Email not confirmed"  │
└────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Modal muestra mensaje claro:               │
│                                            │
│ "Tu email no está confirmado"              │
│ "Revisa tu bandeja de entrada y haz clic   │
│  en el enlace de confirmación."            │
│                                            │
│ [Reenviar email de confirmación]           │
└────────────────────────────────────────────┘
         │
         ▼ (Si hace clic en reenviar)
┌────────────────────────┐
│ supabase.auth.resend() │
│ Envía nuevo email      │
└────────────────────────┘
```

---

## Flujo Corregido para Modo Admin

```text
Admin con testMode = "admin"
         │
         ▼
┌────────────────────────┐
│ AdminModeContext       │
│ isAdmin: true          │
│ effectiveMaxRoutes: 999│
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ useSubscription        │
│ isAdmin → true         │
│ maxRoutes = 999        │
│ (usa effectiveMaxRoutes│
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ useRoutes              │
│ maxRoutes = 999        │
│ (viene de useSubscription)│
│ canAddRoute = true     │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Dashboard              │
│ No muestra modal de    │
│ límite para admin      │
└────────────────────────┘
```

---

## Sección Técnica

### AuthModal.tsx - Nuevo código para manejar email no confirmado

```typescript
// En el catch del handleSubmit:
const errorMessage = error.message?.toLowerCase() || "";

if (errorMessage.includes("email not confirmed")) {
  setShowEmailNotConfirmed(true);
  // No lanzar el error genérico
  return;
}

// Nuevo estado
const [showEmailNotConfirmed, setShowEmailNotConfirmed] = useState(false);

// Función para reenviar
const handleResendConfirmation = async () => {
  await supabase.auth.resend({
    type: 'signup',
    email: email,
  });
  toast({
    title: "Email enviado",
    description: "Revisa tu bandeja de entrada.",
  });
};
```

### useSubscription.tsx - Líneas 110-112

```typescript
// Cambiar isTestingAsUser a isAdmin
const isPremium = isAdmin ? effectiveIsPremium : realIsPremium;
const maxRoutes = isAdmin ? effectiveMaxRoutes : (realIsPremium ? 3 : 1);
```

### useRoutes.tsx - Líneas 47 y 56

```typescript
// Cambiar de:
const { isPremium } = useSubscription();
const maxRoutes = isPremium ? 3 : 1;

// A:
const { isPremium, maxRoutes } = useSubscription();
// Eliminar la línea: const maxRoutes = isPremium ? 3 : 1;
```

---

## Verificación de la Solución

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Admin en modo "Admin" | Sin límites de rutas (999) |
| Admin en modo "Free" | Límite de 1 ruta |
| Admin en modo "Pro" | Límite de 3 rutas |
| Usuario con email no confirmado | Ve mensaje claro + botón reenviar |
| Usuario con email confirmado | Login exitoso + dashboard sin banner |

