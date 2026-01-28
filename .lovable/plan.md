

# Plan: Modo Admin/Usuario para Pruebas

## Resumen

Implementar un sistema de cambio de modo (Admin/Usuario) para el usuario `l@albus.com.co` que permita:
- **Modo Admin**: Sin límites de rutas, acceso completo a todas las funcionalidades premium
- **Modo Usuario**: Experimenta la plataforma como un usuario normal con límites de plan (Free o Pro simulado)

---

## Arquitectura de la Solución

### Enfoque: Context + LocalStorage (Para Testing)

Se utilizará un contexto React que almacena el modo actual del admin. Este enfoque es ideal para pruebas ya que:

1. No requiere cambios en la base de datos
2. Persiste entre sesiones (localStorage)
3. Solo afecta al usuario admin
4. Fácil de activar/desactivar

```text
┌─────────────────────────────────────────────────────────────┐
│                    AdminModeContext                         │
├─────────────────────────────────────────────────────────────┤
│  isAdmin: boolean        (true si email = admin)           │
│  testMode: 'admin' | 'free' | 'pro'                        │
│  setTestMode: (mode) => void                               │
│  effectiveIsPremium: boolean                               │
│  effectiveMaxRoutes: number                                │
│  isTestingAsUser: boolean                                  │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Sidebar / Admin Header                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  [Toggle: 👑 Admin | 👤 Free | ⭐ Pro]                  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Componentes Nuevos

### 1. `AdminModeContext.tsx`

Contexto que gestiona el modo de prueba del admin:

| Estado | Descripción |
|--------|-------------|
| `testMode: 'admin'` | Modo normal del admin - sin límites |
| `testMode: 'free'` | Simula usuario Free - 1 ruta máx |
| `testMode: 'pro'` | Simula usuario Pro - 3 rutas máx |

### 2. `AdminModeSwitcher.tsx`

Componente visual para cambiar entre modos:

```text
┌────────────────────────────────────────────────────────────┐
│  Modo de Prueba                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👑 Admin (sin límites)  │ ✓ Activo                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 👤 Usuario Free         │ 1 ruta máx                 │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ ⭐ Usuario Pro          │ 3 rutas máx                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| **Nuevos** | | |
| `src/contexts/AdminModeContext.tsx` | Crear | Contexto para gestionar modo admin/usuario |
| `src/components/admin/AdminModeSwitcher.tsx` | Crear | UI para cambiar de modo |
| **Modificar** | | |
| `src/App.tsx` | Modificar | Envolver con AdminModeProvider |
| `src/hooks/useSubscription.tsx` | Modificar | Respetar modo de prueba del admin |
| `src/hooks/useRoutes.tsx` | Modificar | Usar límites del modo de prueba |
| `src/components/dashboard/DashboardSidebar.tsx` | Modificar | Mostrar switcher para admin |
| `src/pages/Dashboard.tsx` | Modificar | Integrar contexto |

---

## Lógica de Negocio

### useSubscription Modificado

```typescript
// Pseudo-código
const { testMode, isAdmin } = useAdminMode();

// Si es admin en modo prueba, usar valores simulados
if (isAdmin && testMode !== 'admin') {
  return {
    isPremium: testMode === 'pro',
    maxRoutes: testMode === 'pro' ? 3 : 1,
    // ... resto de valores simulados
  };
}

// Si no es admin o está en modo admin, usar valores reales
return {
  isPremium: subscriptionStatus === 'pro',
  maxRoutes: isPremium ? 3 : 1,
  // ...
};
```

### useRoutes Modificado

```typescript
// Pseudo-código
const { effectiveIsPremium, effectiveMaxRoutes } = useAdminMode();

// Usar límites efectivos en lugar de los reales
const canAddRoute = activeRoutes.length < effectiveMaxRoutes;
```

---

## Flujo de Usuario (Admin)

```text
Admin accede a Dashboard
         │
         ▼
┌────────────────────────┐
│ Ve su sidebar con el   │
│ switcher de modo       │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Selecciona "Free"      │
│ → localStorage.set()   │
│ → Context actualiza    │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Dashboard muestra:     │
│ • Límite de 1 ruta     │
│ • Modal de límite      │
│ • Sin badge Pro        │
│ • Recursos bloqueados  │
└────────────────────────┘
         │
         ▼ (Admin prueba el flujo completo)
┌────────────────────────┐
│ Cambia a modo "Pro"    │
│ → 3 rutas permitidas   │
│ → Badge Pro visible    │
│ → Recursos desbloq.    │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Vuelve a "Admin"       │
│ → Sin límites          │
│ → Acceso total         │
└────────────────────────┘
```

---

## Interfaz del Switcher en Sidebar

Para el admin, aparecerá un nuevo componente encima del botón "Panel Admin":

```text
┌─────────────────────────────────────────────────────────────┐
│  ...navegación existente...                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🔧 Modo de Prueba                                      ││
│  │  ┌────────────────────────────────────────────────────┐ ││
│  │  │ 👑 Admin  ○  👤 Free  ○  ⭐ Pro                    │ ││
│  │  └────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
│  [Panel Admin]                                              │
├─────────────────────────────────────────────────────────────┤
│  © 2024 Albus                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Consideraciones de Seguridad

| Aspecto | Implementación |
|---------|----------------|
| Solo para admin | El contexto verifica `user.email === ADMIN_EMAIL` antes de activar |
| Client-side only | Esto es SOLO para testing - no afecta datos reales |
| No modifica BD | Los límites son simulados en el frontend |
| Visible solo admin | El switcher solo aparece si `isAdmin === true` |

**Nota importante**: Este sistema es exclusivamente para pruebas de UX por parte del admin. Las restricciones reales de plan siguen siendo aplicadas por RLS en la base de datos para todos los usuarios normales.

---

## Sección Técnica

### AdminModeContext Interface

```typescript
interface AdminModeContextType {
  // ¿Es el usuario admin?
  isAdmin: boolean;
  
  // Modo actual: 'admin' | 'free' | 'pro'
  testMode: TestMode;
  setTestMode: (mode: TestMode) => void;
  
  // Valores efectivos para usar en hooks
  effectiveIsPremium: boolean;
  effectiveMaxRoutes: number;
  
  // ¿Está simulando ser usuario?
  isTestingAsUser: boolean;
}
```

### Persistencia en LocalStorage

```typescript
const ADMIN_MODE_KEY = 'albus_admin_test_mode';

// Al cambiar modo
localStorage.setItem(ADMIN_MODE_KEY, mode);

// Al iniciar
const savedMode = localStorage.getItem(ADMIN_MODE_KEY) || 'admin';
```

### Integración con Hooks Existentes

Los hooks `useSubscription` y `useRoutes` serán modificados para:

1. Importar `useAdminMode`
2. Verificar si el usuario es admin en modo prueba
3. Retornar valores simulados cuando corresponda
4. Mantener comportamiento normal para usuarios regulares

---

## Testing de la Implementación

Tras implementar, el admin podrá probar:

| Escenario | Modo | Resultado Esperado |
|-----------|------|-------------------|
| Añadir 2da ruta | Free | Modal de límite |
| Añadir 2da ruta | Pro | Éxito + confetti |
| Añadir 4ta ruta | Pro | Modal de límite |
| Añadir rutas ilimitadas | Admin | Siempre éxito |
| Ver recursos Pro | Free | Bloqueados con paywall |
| Ver recursos Pro | Pro/Admin | Desbloqueados |

