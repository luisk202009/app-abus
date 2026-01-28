

# Plan: Completar la Experiencia de Selección de Rutas

## Resumen

Finalizar el sistema de rutas con mejoras en UI/UX incluyendo: skeleton loaders, animación de confetti al iniciar ruta, descripciones expandibles en el checklist, y un dropdown para cambiar entre rutas activas (usuarios Pro).

---

## 1. Cambios Requeridos

### 1.1 Instalar canvas-confetti

Se necesita una librería ligera para la animación de celebración:

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

---

## 2. Nuevos Componentes

### 2.1 `RouteCardSkeleton.tsx`

Componente skeleton para mostrar mientras cargan las rutas:

| Elemento | Descripción |
|----------|-------------|
| Título | Skeleton de altura 6, ancho 40% |
| Badge país | Skeleton circular pequeño |
| Descripción | 2 líneas de skeleton |
| Stats | 2 filas con iconos skeleton |
| Botón | Skeleton de altura 10 |

### 2.2 `ActiveRouteSwitcher.tsx`

Dropdown para usuarios Pro con múltiples rutas:

| Elemento | Descripción |
|----------|-------------|
| Trigger | Botón con nombre de ruta actual + ChevronDown |
| Dropdown | Lista de rutas activas con progreso |
| Items | Nombre + barra de progreso miniatura |
| Posición | En el header del Dashboard |

### 2.3 `SuccessConfetti.tsx`

Componente que dispara confetti al iniciar una ruta:

| Elemento | Descripción |
|----------|-------------|
| Trigger | Se activa cuando `startRoute` retorna `true` |
| Duración | 2-3 segundos |
| Colores | Negro, gris, blanco (mantener B&W) |

---

## 3. Modificaciones a Componentes Existentes

### 3.1 `RouteChecklist.tsx` - Descripciones Expandibles

Modificar cada paso para incluir una sección colapsable con la descripción:

```text
┌─────────────────────────────────────────────────────────────┐
│ ○ Prueba de Medios Económicos              [Paso 1] ▼      │
├─────────────────────────────────────────────────────────────┤
│   Extractos de los últimos 3 meses y carta de la empresa.  │
│   [Sección expandible - se muestra al hacer clic en ▼]     │
└─────────────────────────────────────────────────────────────┘
```

Requiere modificar el hook `useRoutes.tsx` para incluir la descripción del paso.

### 3.2 `RouteSelector.tsx` y `RouteExplorer.tsx` - Skeletons

Agregar estados de carga con skeletons mientras se obtienen los templates.

### 3.3 `Dashboard.tsx` - Integrar Switcher y Confetti

| Cambio | Descripción |
|--------|-------------|
| Header | Agregar `ActiveRouteSwitcher` si Pro + múltiples rutas |
| Confetti | Disparar animación tras `startRoute` exitoso |
| Estado | Agregar `showConfetti` state |

### 3.4 `useRoutes.tsx` - Incluir Descripciones

Modificar la interfaz `RouteStep` y las queries para incluir `description` desde `route_template_steps`.

---

## 4. Flujo de Usuario Actualizado

```text
Usuario en Dashboard
        │
        ▼
┌────────────────────────┐
│ Sin rutas activas      │
│ → RouteSelector        │
│   (con skeletons)      │
└────────────────────────┘
        │
        ▼
┌────────────────────────┐
│ Click "Iniciar ruta"   │
│ → Loading skeleton     │
│ → Clonación de pasos   │
└────────────────────────┘
        │
        ▼
┌────────────────────────┐
│ ✓ Éxito                │
│ → Confetti B&W         │
│ → Vista Roadmap        │
└────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│ RouteChecklist con pasos expandibles   │
│                                        │
│ ○ Paso 1: Título                    ▼  │
│   └─ Descripción detallada...          │
│                                        │
│ ○ Paso 2: Título                    ▶  │
│                                        │
└────────────────────────────────────────┘
        │
        ▼ (Si Pro con múltiples rutas)
┌────────────────────────────────────────┐
│ Header: [Nómada Digital ▼]             │
│                                        │
│ Dropdown:                              │
│ ├─ Nómada Digital    ████░░ 60%        │
│ ├─ Estudiante        ██░░░░ 40%        │
│ └─ Emprendedor       ░░░░░░ 0%         │
└────────────────────────────────────────┘
```

---

## 5. Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| **Nuevos** | | |
| `src/components/dashboard/RouteCardSkeleton.tsx` | Crear | Skeleton para cards de rutas |
| `src/components/dashboard/ActiveRouteSwitcher.tsx` | Crear | Dropdown para cambiar rutas (Pro) |
| `src/components/dashboard/SuccessConfetti.tsx` | Crear | Componente de animación confetti |
| **Modificar** | | |
| `src/hooks/useRoutes.tsx` | Modificar | Incluir description en RouteStep |
| `src/components/dashboard/RouteChecklist.tsx` | Modificar | Agregar secciones expandibles |
| `src/components/dashboard/RouteSelector.tsx` | Modificar | Agregar skeleton loading |
| `src/components/dashboard/RouteExplorer.tsx` | Modificar | Agregar skeleton loading |
| `src/pages/Dashboard.tsx` | Modificar | Integrar switcher, confetti, y mejoras de UX |
| `package.json` | Modificar | Agregar canvas-confetti |

---

## 6. Estilos y Animaciones

### Confetti B&W

```typescript
confetti({
  particleCount: 100,
  spread: 70,
  colors: ['#000000', '#333333', '#666666', '#999999', '#ffffff'],
  origin: { y: 0.6 }
});
```

### Skeleton Premium

Utilizando el componente existente `Skeleton`:

```tsx
<Skeleton className="h-6 w-3/4" />  // Título
<Skeleton className="h-4 w-full" /> // Descripción línea 1
<Skeleton className="h-4 w-2/3" />  // Descripción línea 2
```

### Collapsible con Animación

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Con animación suave de acordeón (ya configurada en tailwind)
```

---

## 7. Sección Técnica

### Modificación de `useRoutes.tsx` para Descripciones

```typescript
// Interfaz actualizada
export interface RouteStep {
  id: string;
  title: string;
  description: string | null;  // Ya existe pero no se populaba
  step_order: number | null;
  is_completed: boolean;
}

// En el fetch de progress, necesitamos el template_id para obtener descripciones
// Opción 1: Almacenar description en user_route_progress (migración)
// Opción 2: Hacer JOIN con route_template_steps (más complejo)
// Recomendado: Opción 1 - agregar columna step_description a user_route_progress
```

### Migración Requerida

Para almacenar las descripciones junto con el progreso del usuario:

```sql
-- Agregar columna para descripción
ALTER TABLE user_route_progress 
ADD COLUMN step_description text;

-- Actualizar datos existentes (si hay)
UPDATE user_route_progress urp
SET step_description = rts.description
FROM user_active_routes uar, route_template_steps rts
WHERE urp.user_route_id = uar.id
AND rts.template_id = uar.template_id
AND rts.title = urp.step_title;
```

### Estructura del ActiveRouteSwitcher

```typescript
interface ActiveRouteSwitcherProps {
  routes: ActiveRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  getProgress: (routeId: string) => { completed: number; total: number };
}
```

---

## 8. Consideraciones de Performance

| Aspecto | Implementación |
|---------|----------------|
| Optimistic UI | El confetti se dispara inmediatamente tras el éxito |
| Skeleton timing | Mínimo 300ms para evitar flash |
| Lazy loading | Confetti se importa dinámicamente |
| Memoización | Switcher usa useMemo para calcular progreso |

---

## 9. Dependencias

La única dependencia nueva es `canvas-confetti`:
- Tamaño: ~3KB gzipped
- Sin dependencias adicionales
- Ampliamente usada (>5M descargas semanales)

