

# Plan: Completar Sistema Multi-Ruta - Corrección de Datos

## Estado Actual de la Implementación

El sistema multi-ruta está **implementado al 95%**. Tras revisar el código y la base de datos, confirmo que:

### ✅ Ya Implementado

| Componente | Estado | Descripción |
|------------|--------|-------------|
| `useRoutes.tsx` | ✅ Completo | Hook con `startRoute()`, clonación de steps, optimistic updates |
| `RouteSelector.tsx` | ✅ Completo | Grid de rutas disponibles cuando no hay rutas activas |
| `RouteExplorer.tsx` | ✅ Completo | Vista "Explorar Destinos" con glassmorphism |
| `RouteChecklist.tsx` | ✅ Completo | Checklist dinámico desde `user_route_progress` |
| `ActiveRouteCard.tsx` | ✅ Completo | Tarjeta con progreso y selección |
| `RouteLimitModal.tsx` | ✅ Completo | Modal Netflix-style con upgrade a Stripe |
| `Dashboard.tsx` | ✅ Completo | Integración completa con switching de rutas |
| RLS Policies | ✅ Completo | Políticas para todas las tablas de rutas |
| Datos Seed | ✅ Completo | 4 rutas con 5-6 pasos cada una |

### ⚠️ Problema Encontrado

La columna `max_routes` en la tabla `plans` tiene valor `1` para **ambos planes** (Free y Pro). El Pro debería tener `3`.

```text
┌─────────────────────────────────────────────────────────────┐
│  Tabla plans - Estado Actual                                │
├─────────────┬────────────────┬───────────────────────────────┤
│  Plan       │  max_routes    │  Esperado                     │
├─────────────┼────────────────┼───────────────────────────────┤
│  free       │  1             │  ✅ Correcto                   │
│  pro        │  1             │  ❌ Debería ser 3              │
└─────────────┴────────────────┴───────────────────────────────┘
```

**Nota importante**: El frontend funciona correctamente porque `useSubscription.tsx` tiene el valor hardcodeado:
```typescript
maxRoutes: isPremium ? 3 : 1
```

Pero para mantener consistencia y permitir futura flexibilidad desde el admin, el dato en BD debe ser correcto.

---

## Solución Propuesta

### 1. Actualizar Dato en BD (Requerido)

Ejecutar un UPDATE en la tabla `plans` para corregir el valor:

```sql
UPDATE plans 
SET max_routes = 3 
WHERE slug = 'pro';
```

### 2. (Opcional) Leer max_routes desde BD

Para mayor flexibilidad, modificar `useSubscription.tsx` para leer `max_routes` directamente de la tabla `plans` en lugar de tenerlo hardcodeado. Esto permitiría al admin cambiar los límites sin modificar código.

---

## Archivos a Modificar

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| Nueva migración SQL | UPDATE plans SET max_routes = 3 WHERE slug = 'pro' | Alta |
| `src/hooks/useSubscription.tsx` | (Opcional) Leer max_routes de plans | Baja |

---

## Sección Técnica

### Flujo de Validación de Límites (Ya Implementado)

```text
Usuario intenta añadir ruta
         │
         ▼
┌────────────────────────────┐
│ Dashboard.handleStartRoute │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ if (!canAddRoute)          │
│   → showLimitModal(true)   │
│   → return                 │
└────────────────────────────┘
         │ (si puede añadir)
         ▼
┌────────────────────────────┐
│ useRoutes.startRoute()     │
│ 1. Validar límite          │
│ 2. INSERT user_active_route│
│ 3. SELECT template_steps   │
│ 4. INSERT user_progress    │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Optimistic UI Update       │
│ setActiveRoutes([new,...]) │
└────────────────────────────┘
```

### RLS Policies Configuradas

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| route_templates | ✅ Public | ❌ | ❌ | ❌ |
| route_template_steps | ✅ Public | ❌ | ❌ | ❌ |
| user_active_routes | ✅ user_id | ✅ user_id | ✅ user_id | ✅ user_id |
| user_route_progress | ✅ via route | ✅ via route | ✅ via route | ❌ |

---

## Resumen

La implementación del sistema multi-ruta está **funcionalmente completa**. Solo se requiere:

1. **Corrección de dato**: Actualizar `max_routes = 3` para el plan Pro
2. **(Opcional)**: Refactorizar para leer límites desde BD

Una vez aplicada la corrección, el sistema estará 100% operativo con:
- Selector de rutas para usuarios nuevos
- Explorador de destinos con glassmorphism
- Checklist dinámico por ruta
- Límites Netflix (1 Free / 3 Pro)
- Modal de upgrade conectado a Stripe

