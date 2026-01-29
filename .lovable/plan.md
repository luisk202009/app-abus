

# Plan: Flujo de Selección de Rutas, Sistema Anti-Abuso y Eliminación

## Resumen

Implementar un flujo completo post-análisis con recomendación de ruta, un sistema de slots anti-abuso que limita la creación de rutas de por vida para usuarios Free, y funcionalidad de eliminación de rutas con advertencias claras.

---

## Estado Actual del Sistema

| Componente | Estado | Detalles |
|------------|--------|----------|
| **AnalysisModal** | ✅ Funcional | Muestra recomendación y botón "Ver mi hoja de ruta" |
| **useRoutes** | ✅ Funcional | Usa `activeRoutes.length < maxRoutes` para límite |
| **RouteLimitModal** | ✅ Básico | Solo muestra "Mejorar a Pro" genérico |
| **Eliminación de rutas** | ❌ No existe | Falta delete en `user_active_routes` |
| **Contador total_routes_created** | ❌ No existe | Falta columna en DB |

### Problema Actual

El sistema actual permite:
- Usuario Free crea 1 ruta
- Usuario Free **elimina** la ruta  
- Usuario Free puede crear **otra** ruta

Esto permite abusar del sistema creando rutas infinitas.

---

## Arquitectura de la Solución

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SISTEMA ANTI-ABUSO                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Usuario Free:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  total_routes_created = 0 → Puede crear 1 ruta                         │ │
│  │  total_routes_created = 1 → BLOQUEADO (aunque elimine rutas)           │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  Usuario Pro:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Límite: 3 rutas ACTIVAS simultáneamente                               │ │
│  │  Puede eliminar y crear nuevas rutas libremente                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cambios de Base de Datos

### 1. Nueva columna `total_routes_created`

Agregar a la tabla `onboarding_submissions`:

```sql
ALTER TABLE onboarding_submissions 
ADD COLUMN total_routes_created INTEGER NOT NULL DEFAULT 0;
```

### 2. Trigger para incrementar contador

Crear un trigger que incrementa el contador al insertar en `user_active_routes`:

```sql
CREATE OR REPLACE FUNCTION increment_total_routes_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE onboarding_submissions
  SET total_routes_created = total_routes_created + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_route_created
AFTER INSERT ON user_active_routes
FOR EACH ROW
EXECUTE FUNCTION increment_total_routes_created();
```

### 3. Habilitar DELETE en `user_route_progress`

Agregar política RLS para DELETE:

```sql
CREATE POLICY "Users can delete their route progress"
ON user_route_progress FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_active_routes
    WHERE user_active_routes.id = user_route_progress.user_route_id
    AND user_active_routes.user_id = auth.uid()
  )
);
```

---

## Flujos de Usuario

### Flujo 1: Post-Análisis con Recomendación

```text
Usuario completa onboarding
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                    PANTALLA RECOMENDACIÓN                  │
│                                                            │
│  "Nuestra recomendación para ti:"                         │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  🎯 Visado de Nómada Digital                       │   │
│  │                                                    │   │
│  │  Con tus ingresos de trabajo remoto, calificas     │   │
│  │  perfectamente para este visado...                 │   │
│  │                                                    │   │
│  │  95% match                                         │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Iniciar esta ruta ahora  →                 │   │  (Primary)
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Ver otros destinos disponibles             │   │  (Secondary)
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
         │
         ├──[Iniciar esta ruta]───► Registrarse → Dashboard con confetti
         │
         └──[Ver otros destinos]───► /explorar
```

### Flujo 2: Bloqueo Anti-Abuso (Usuario Free)

```text
Usuario Free intenta crear 2da ruta
(total_routes_created >= 1)
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                    MODAL SLOT AGOTADO                      │
│                                                            │
│                        🔒                                  │
│                                                            │
│  "Has agotado tu ruta gratuita"                           │
│                                                            │
│  Tu plan Free te permite iniciar 1 ruta de por vida.      │
│  Pásate al Plan Pro por solo €6,99/mes para explorar      │
│  nuevos destinos y gestionar hasta 3 procesos             │
│  migratorios simultáneamente.                             │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Mejorar a Pro - €6,99/mes  →             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│                     [Entendido]                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Flujo 3: Eliminación de Ruta

```text
Usuario clic en "⚙️ Gestionar" en ActiveRouteCard
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                   MENÚ DESPLEGABLE                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │  📋 Ver detalles                                   │   │
│  │  🗑️ Eliminar ruta                                  │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
         │
         ▼ (Clic en "Eliminar ruta")
┌────────────────────────────────────────────────────────────┐
│                   MODAL CONFIRMACIÓN                       │
│                                                            │
│                        ⚠️                                  │
│                                                            │
│  "¿Eliminar esta ruta?"                                   │
│                                                            │
│  Esta acción es irreversible. Se eliminará todo el        │
│  progreso guardado en esta ruta.                          │
│                                                            │
│  ⚠️ Si estás en el Plan Gratis, no podrás iniciar         │
│  otra ruta sin suscribirte a Pro.                         │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │            Cancelar          │   Eliminar          │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/dashboard/SlotExhaustedModal.tsx` | Modal específico cuando Free agota su slot |
| `src/components/dashboard/DeleteRouteModal.tsx` | Modal de confirmación para eliminar ruta |
| `src/components/dashboard/RouteActionsMenu.tsx` | Menú desplegable para gestionar rutas |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/AnalysisModal.tsx` | Nueva pantalla de recomendación con 2 CTAs |
| `src/hooks/useRoutes.tsx` | Agregar `deleteRoute()`, obtener `total_routes_created`, lógica `canAddRoute` |
| `src/hooks/useSubscription.tsx` | Exportar `totalRoutesCreated` para el frontend |
| `src/components/dashboard/ActiveRouteCard.tsx` | Agregar botón "Gestionar" con menú |
| `src/pages/Dashboard.tsx` | Integrar modales de eliminación y slot agotado |
| `src/pages/Explorar.tsx` | Usar nuevo SlotExhaustedModal en lugar de RouteLimitModal |

---

## Lógica de Negocio Detallada

### Nueva función `canUserAddRoute`

```typescript
// En useRoutes.tsx
const canAddRoute = useMemo(() => {
  if (!user) return false;
  
  const isPro = subscriptionStatus === "pro";
  
  if (isPro) {
    // Pro: límite de rutas ACTIVAS
    return activeRoutes.length < 3;
  } else {
    // Free: límite de rutas CREADAS DE POR VIDA
    return totalRoutesCreated < 1;
  }
}, [user, subscriptionStatus, activeRoutes.length, totalRoutesCreated]);

// Determinar qué modal mostrar
const slotExhausted = !isPro && totalRoutesCreated >= 1;
```

### Nueva función `deleteRoute`

```typescript
const deleteRoute = useCallback(async (routeId: string): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // 1. Eliminar progreso de pasos
    await supabase
      .from("user_route_progress")
      .delete()
      .eq("user_route_id", routeId);
    
    // 2. Eliminar ruta activa
    const { error } = await supabase
      .from("user_active_routes")
      .delete()
      .eq("id", routeId)
      .eq("user_id", user.id);
    
    if (error) throw error;
    
    // 3. Actualizar estado local
    setActiveRoutes((prev) => prev.filter((r) => r.id !== routeId));
    
    toast({
      title: "Ruta eliminada",
      description: "La ruta ha sido eliminada correctamente.",
    });
    
    return true;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No se pudo eliminar la ruta.",
    });
    return false;
  }
}, [user, toast]);
```

---

## Componentes de UI

### SlotExhaustedModal

```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                     🔒 (Icono Lock)                        │
│                                                            │
│         "Has agotado tu ruta gratuita"                     │
│                                                            │
│  Tu plan Free te permite iniciar 1 ruta de por vida.      │
│                                                            │
│  Pásate al Plan Pro por solo €6,99/mes para:              │
│  • Explorar nuevos destinos                               │
│  • Gestionar hasta 3 procesos simultáneamente             │
│  • Acceder a recursos premium                             │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │      👑  Mejorar a Pro - €6,99/mes                 │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│                     [Entendido]                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### DeleteRouteModal

```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                     ⚠️ (Icono Warning)                     │
│                                                            │
│            "¿Eliminar [Nombre Ruta]?"                      │
│                                                            │
│  Esta acción es irreversible. Se eliminará todo tu        │
│  progreso guardado en esta ruta.                          │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ⚠️ Si estás en el Plan Gratis, no podrás         │   │
│  │  iniciar otra ruta sin suscribirte a Pro.          │   │
│  └────────────────────────────────────────────────────┘   │
│  (Solo visible si isPro === false)                        │
│                                                            │
│  ┌─────────────────┐  ┌─────────────────────────────┐     │
│  │    Cancelar     │  │   🗑️ Eliminar ruta          │     │
│  └─────────────────┘  └─────────────────────────────┘     │
│                        (variant="destructive")             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### RouteActionsMenu (Dropdown)

```text
ActiveRouteCard existente
┌─────────────────────────────────────────────────────────────┐
│  Nómada Digital                              ⚙️ (Settings) │ ← Nuevo botón
│  🇪🇸 España                                                  │
│                                                             │
│  Progreso: 2/5 pasos                                       │
│  [═══════════░░░░░░░░░░░]                                  │
└─────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
                                    ┌────────────────────────┐
                                    │  📋 Ver detalles       │
                                    │  🗑️ Eliminar ruta      │
                                    └────────────────────────┘
```

---

## Pantalla de Recomendación Post-Análisis

Modificar `AnalysisModal.tsx` para mostrar 2 CTAs:

```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                     ✓ (CheckCircle)                        │
│                                                            │
│              "Análisis Completado"                         │
│                                                            │
│  Hemos analizado tu perfil y encontramos la mejor         │
│  opción para ti.                                          │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  🎯 Tu mejor opción                                │   │
│  │                                                    │   │
│  │  Visado de Nómada Digital                          │   │
│  │                                                    │   │
│  │  Con tus ingresos de trabajo remoto, calificas...  │   │
│  │                                                    │   │
│  │  [═══════════════════════] 95% match              │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Iniciar esta ruta ahora  →                 │   │  ← Primary (hero)
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Ver otros destinos disponibles             │   │  ← Secondary (outline)
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Sección Técnica

### Migración SQL

```sql
-- 1. Agregar columna total_routes_created
ALTER TABLE onboarding_submissions 
ADD COLUMN IF NOT EXISTS total_routes_created INTEGER NOT NULL DEFAULT 0;

-- 2. Inicializar contador para usuarios existentes
UPDATE onboarding_submissions os
SET total_routes_created = (
  SELECT COUNT(*) 
  FROM user_active_routes uar 
  WHERE uar.user_id = os.user_id
);

-- 3. Crear trigger para incrementar contador
CREATE OR REPLACE FUNCTION increment_total_routes_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE onboarding_submissions
  SET total_routes_created = total_routes_created + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_route_created
AFTER INSERT ON user_active_routes
FOR EACH ROW
EXECUTE FUNCTION increment_total_routes_created();

-- 4. Política DELETE para user_route_progress
CREATE POLICY "Users can delete their route progress"
ON user_route_progress FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_active_routes
    WHERE user_active_routes.id = user_route_progress.user_route_id
    AND user_active_routes.user_id = auth.uid()
  )
);
```

### useRoutes.tsx actualizado

```typescript
interface UseRoutesReturn {
  // ... existing
  deleteRoute: (routeId: string) => Promise<boolean>;
  totalRoutesCreated: number;
  slotExhausted: boolean;
}

export const useRoutes = (): UseRoutesReturn => {
  const [totalRoutesCreated, setTotalRoutesCreated] = useState(0);
  
  // Fetch totalRoutesCreated from onboarding_submissions
  useEffect(() => {
    if (user) {
      supabase
        .from("onboarding_submissions")
        .select("total_routes_created")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setTotalRoutesCreated(data?.total_routes_created || 0);
        });
    }
  }, [user]);
  
  // Updated canAddRoute logic
  const slotExhausted = subscriptionStatus !== "pro" && totalRoutesCreated >= 1;
  const canAddRoute = subscriptionStatus === "pro" 
    ? activeRoutes.length < maxRoutes 
    : totalRoutesCreated < 1;
  
  // Delete route function
  const deleteRoute = useCallback(async (routeId: string) => {
    // ... implementation
  }, [user]);
  
  return {
    // ... existing
    deleteRoute,
    totalRoutesCreated,
    slotExhausted,
  };
};
```

### Actualización de Precios

El precio mencionado es €6,99/mes, pero el precio actual en Stripe es €9,99/mes. Esto requerirá:

1. **Crear nuevo precio en Stripe** a €6,99/mes
2. **Actualizar** `create-checkout/index.ts` con el nuevo `priceId`
3. **Actualizar** mensajes en modales con el precio correcto

---

## Verificación

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Usuario Free crea 1ra ruta | ✅ Éxito, `total_routes_created` = 1 |
| Usuario Free intenta 2da ruta | ❌ SlotExhaustedModal aparece |
| Usuario Free elimina ruta | ✅ Ruta eliminada, `total_routes_created` permanece 1 |
| Usuario Free intenta nueva ruta | ❌ SlotExhaustedModal aparece |
| Usuario Pro crea 3 rutas | ✅ Éxito |
| Usuario Pro elimina 1, crea nueva | ✅ Éxito (límite de activas, no históricas) |
| Post-análisis muestra 2 CTAs | ✅ "Iniciar ruta" y "Ver otros destinos" |
| Delete modal muestra advertencia Free | ✅ Solo si `isPro === false` |

---

## Orden de Implementación

1. **Migración SQL** - Agregar columna y trigger
2. **SlotExhaustedModal.tsx** - Nuevo componente
3. **DeleteRouteModal.tsx** - Nuevo componente  
4. **RouteActionsMenu.tsx** - Dropdown para ActiveRouteCard
5. **useRoutes.tsx** - Agregar `deleteRoute`, `totalRoutesCreated`, `slotExhausted`
6. **ActiveRouteCard.tsx** - Integrar menú de acciones
7. **AnalysisModal.tsx** - Agregar segundo CTA para explorar
8. **Dashboard.tsx y Explorar.tsx** - Integrar nuevos modales
9. **Actualizar precio** - Cambiar a €6,99 si es necesario

