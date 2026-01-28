

# Plan: Sistema Multi-Ruta con Límites de Plan

## Resumen

Implementar un sistema completo de múltiples rutas migratorias donde los usuarios pueden explorar, seleccionar y gestionar sus rutas activas, con límites basados en su plan de suscripción (1 ruta para Gratis, 3 para Pro).

---

## 1. Cambios en Base de Datos

### 1.1 Habilitar RLS en tablas de rutas

Las tablas de rutas actualmente no tienen RLS habilitado (error del linter). Se debe agregar:

```sql
-- Habilitar RLS
ALTER TABLE route_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_route_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para templates (públicos)
CREATE POLICY "Anyone can view route templates"
ON route_templates FOR SELECT USING (true);

CREATE POLICY "Anyone can view route template steps"
ON route_template_steps FOR SELECT USING (true);

-- Políticas para rutas activas del usuario
CREATE POLICY "Users can view their active routes"
ON user_active_routes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their active routes"
ON user_active_routes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their active routes"
ON user_active_routes FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para progreso
CREATE POLICY "Users can view their route progress"
ON user_route_progress FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_active_routes 
    WHERE id = user_route_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their route progress"
ON user_route_progress FOR INSERT/UPDATE 
USING/WITH CHECK (...);
```

### 1.2 Agregar columna `max_routes` a tabla `plans`

```sql
ALTER TABLE plans ADD COLUMN max_routes integer NOT NULL DEFAULT 1;
UPDATE plans SET max_routes = 1 WHERE slug = 'free';
UPDATE plans SET max_routes = 3 WHERE slug = 'pro';
```

### 1.3 Insertar datos iniciales en `route_templates`

```sql
INSERT INTO route_templates (name, description, country, required_savings, estimated_cost)
VALUES 
  ('Nómada Digital', 'Visado para trabajadores remotos con ingresos estables', 'España', '€10,000+', '€800-€1,200'),
  ('Estudiante', 'Visa de estudios para cursos de larga duración', 'España', '€6,000+', '€400-€600'),
  ('Emprendedor', 'Visa para iniciar tu propio negocio en España', 'España', '€25,000+', '€1,500-€2,500'),
  ('Arraigo Social', 'Residencia por vínculos familiares o sociales', 'España', '€3,000+', '€300-€500');
```

---

## 2. Nuevos Componentes Frontend

### 2.1 `RouteSelector.tsx`

Componente que muestra un grid de rutas disponibles cuando el usuario no tiene ruta activa:

| Elemento | Descripción |
|----------|-------------|
| Tarjetas | Grid de route_templates con efecto glassmorphism |
| Info | Nombre, descripción, costos, solvencia requerida |
| Botón | "Iniciar esta ruta" |

### 2.2 `RouteExplorer.tsx`

Vista de exploración de todas las rutas (sidebar: "Explorar Destinos"):

| Elemento | Descripción |
|----------|-------------|
| Grid Cards | Todas las rutas con overlay premium |
| Filtros | Por país (futuro), por costo |
| Estado | Indica si ya está activa |

### 2.3 `RouteLimitModal.tsx`

Modal que aparece cuando el usuario intenta agregar más rutas de las permitidas:

| Elemento | Contenido |
|----------|-----------|
| Título | "Límite de rutas alcanzado" |
| Mensaje | "Tu plan actual solo permite X ruta(s). Mejora a Pro para gestionar hasta 3 rutas simultáneas." |
| Botones | "Mejorar a Pro" (→ Stripe), "Entendido" (cerrar) |

### 2.4 `ActiveRouteCard.tsx`

Tarjeta que muestra una ruta activa con progreso:

| Elemento | Descripción |
|----------|-------------|
| Nombre | Título de la ruta |
| Progreso | Barra de progreso (pasos completados / total) |
| Estado | Badge "En progreso" o "Completada" |

### 2.5 Hook `useRoutes.tsx`

Hook para gestionar la lógica de rutas:

```typescript
const useRoutes = () => {
  // Obtener rutas activas del usuario
  // Obtener todas las plantillas
  // Iniciar nueva ruta (con validación de límites)
  // Actualizar progreso
  return {
    activeRoutes,
    templates,
    startRoute,
    updateProgress,
    canAddRoute,
    maxRoutes
  };
};
```

---

## 3. Flujo de Usuario

```text
┌─────────────────────────────────────────────────────────────┐
│  Usuario entra a Dashboard → "Mi Ruta"                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  ¿Tiene rutas activas?        │
              └───────────────────────────────┘
                    │               │
                   NO              SÍ
                    │               │
                    ▼               ▼
    ┌────────────────────┐   ┌────────────────────┐
    │  RouteSelector     │   │  Mostrar rutas     │
    │  (Grid de opciones)│   │  activas + progreso│
    └────────────────────┘   └────────────────────┘
            │                        │
            ▼                        ▼
    Usuario selecciona        "Explorar más rutas"
            │                        │
            ▼                        ▼
    ┌────────────────────┐   ┌────────────────────┐
    │  Clonar steps a    │   │  RouteExplorer     │
    │  user_route_progress│  │  (todas las rutas) │
    └────────────────────┘   └────────────────────┘
                                     │
                                     ▼
                         ┌────────────────────┐
                         │  "Iniciar ruta"    │
                         └────────────────────┘
                                     │
                              ┌──────┴──────┐
                              │             │
                    Plan permite     Plan NO permite
                              │             │
                              ▼             ▼
                    ┌───────────┐   ┌───────────────┐
                    │  Crear    │   │RouteLimitModal│
                    │  ruta     │   │ → Upgrade     │
                    └───────────┘   └───────────────┘
```

---

## 4. Modificaciones a Archivos Existentes

### 4.1 `Dashboard.tsx`

- Integrar el nuevo hook `useRoutes`
- Modificar `renderContent()` para mostrar:
  - `RouteSelector` si no hay rutas activas
  - Lista de rutas activas con `ActiveRouteCard`
  - Botón "Explorar más rutas" si plan lo permite

### 4.2 `DashboardSidebar.tsx`

- Agregar nuevo item: `{ id: "explorer", label: "Explorar Rutas", icon: <Compass /> }`

### 4.3 `RoadmapTimeline.tsx`

- Modificar para recibir datos dinámicos de `user_route_progress`
- Prop: `steps: RouteStep[]` en lugar de hardcoded

### 4.4 `useSubscription.tsx`

- Agregar `maxRoutes` al return basado en el plan

---

## 5. Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| **Nuevos** | |
| `src/hooks/useRoutes.tsx` | Hook para gestión de rutas |
| `src/components/dashboard/RouteSelector.tsx` | Selector inicial de rutas |
| `src/components/dashboard/RouteExplorer.tsx` | Vista explorador |
| `src/components/dashboard/RouteLimitModal.tsx` | Modal de límite |
| `src/components/dashboard/ActiveRouteCard.tsx` | Card de ruta activa |
| **Modificar** | |
| `src/pages/Dashboard.tsx` | Integrar sistema de rutas |
| `src/components/dashboard/DashboardSidebar.tsx` | Agregar nav item |
| `src/components/dashboard/RoadmapTimeline.tsx` | Datos dinámicos |
| `src/hooks/useSubscription.tsx` | Agregar maxRoutes |
| Nueva migración SQL | RLS + max_routes + datos iniciales |

---

## 6. Estilos Visuales

### Card con Glassmorphism (RouteExplorer)

```css
.route-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}
```

### Mantener identidad B&W Albus

- Fondo: `bg-secondary` (#F8F9FA)
- Cards: `bg-background` (blanco)
- Acentos: `bg-primary` (negro)
- Badges: Outline negro o filled negro

---

## 7. Sección Técnica

### Clonar pasos al iniciar ruta

```typescript
const startRoute = async (templateId: string) => {
  // 1. Verificar límite de rutas
  const activeCount = activeRoutes.length;
  if (activeCount >= maxRoutes) {
    setShowLimitModal(true);
    return;
  }

  // 2. Crear user_active_route
  const { data: newRoute } = await supabase
    .from('user_active_routes')
    .insert({ user_id: user.id, template_id: templateId })
    .select()
    .single();

  // 3. Obtener pasos del template
  const { data: templateSteps } = await supabase
    .from('route_template_steps')
    .select('*')
    .eq('template_id', templateId)
    .order('step_order');

  // 4. Clonar pasos a user_route_progress
  const progressSteps = templateSteps.map(step => ({
    user_route_id: newRoute.id,
    step_title: step.title,
    is_completed: false
  }));

  await supabase.from('user_route_progress').insert(progressSteps);
};
```

### Límites de Plan

| Plan | max_routes | Precio |
|------|------------|--------|
| Gratis | 1 | €0 |
| Pro | 3 | €9.99/mes |

