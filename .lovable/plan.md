
# Plan: Implementación del Route Explorer como Página Independiente

## Resumen

Transformar la experiencia de exploración de rutas migratorias de una sección dentro del Dashboard a una página independiente `/explorar` con vista detallada de cada ruta antes de activarla.

---

## Cambios Principales

### 1. Nueva Página: `/explorar`

Crear una página independiente accesible desde el sidebar que muestre todas las rutas disponibles en un formato de tarjetas premium.

**Diseño de Tarjeta:**
```text
┌────────────────────────────────────────────────────────────┐
│  Nómada Digital                           🇪🇸 España       │
│                                                            │
│  "Visado para trabajadores remotos con ingresos           │
│   estables desde cualquier parte del mundo"               │
│                                                            │
│  ─────────────────────────────────────────────────────    │
│                                                            │
│  💰 Costo: €800-€1,200     💵 Solvencia: €10,000+         │
│  📊 Dificultad: Media      📋 5 pasos                     │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Ver detalles y requisitos  →               │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 2. Vista de Detalle de Ruta

Cuando el usuario hace clic en "Ver detalles", mostrar un modal o panel lateral con:

```text
┌────────────────────────────────────────────────────────────┐
│  ← Volver                                                  │
│                                                            │
│  Nómada Digital                                            │
│  ━━━━━━━━━━━━━━━                                          │
│                                                            │
│  Visado para trabajadores remotos con ingresos            │
│  estables desde cualquier parte del mundo.                │
│                                                            │
│  REQUISITOS Y PASOS                                        │
│  ──────────────────                                        │
│  1. Preparar documentación base                            │
│     Pasaporte vigente, antecedentes, certificado médico   │
│                                                            │
│  2. Demostrar ingresos remotos                             │
│     Contratos de trabajo o facturas (mín. €2,520/mes)     │
│                                                            │
│  3. Seguro médico                                          │
│     Seguro privado con cobertura completa en España       │
│                                                            │
│  4. Solicitar cita consular                                │
│     Agendar cita en el consulado español                  │
│                                                            │
│  5. Entrevista consular                                    │
│     Asistir con toda la documentación                     │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Iniciar esta ruta  →                  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Tienes 1 de 3 rutas activas                              │
└────────────────────────────────────────────────────────────┘
```

### 3. Lógica de Activación (Ya Implementada)

La lógica de clonación de pasos ya existe en `useRoutes.tsx`:

1. Verificar límite del plan (1 para Free, 3 para Pro, 999 para Admin)
2. Si excede límite → Mostrar modal de upgrade
3. Si dentro del límite:
   - Insertar en `user_active_routes`
   - Clonar pasos de `route_template_steps` a `user_route_progress`
   - Redireccionar al Dashboard con confetti de celebración

---

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/pages/Explorar.tsx` | Nueva página con grid de rutas y layout con sidebar |
| `src/components/routes/RouteCard.tsx` | Tarjeta rediseñada con stats y botón de detalles |
| `src/components/routes/RouteDetailModal.tsx` | Modal con pasos y botón de activación |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar ruta `/explorar` |
| `src/components/dashboard/DashboardSidebar.tsx` | Navegar a `/explorar` en lugar de cambiar sección |
| `src/hooks/useRoutes.tsx` | Agregar función para obtener pasos de template |

---

## Flujo de Usuario

```text
Usuario en Dashboard
         │
         ▼
┌────────────────────────┐
│ Clic en "Explorar      │
│ Rutas" en sidebar      │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Navega a /explorar     │
│ Ve grid de 4+ tarjetas │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Clic en "Ver detalles  │
│ y requisitos"          │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Modal con pasos        │
│ detallados de la ruta  │
└────────────────────────┘
         │
         ▼ (Clic en "Iniciar esta ruta")
┌────────────────────────┐
│ Check límite de plan   │
│ ├─ Excede → Modal Pro  │
│ └─ OK → Clonar pasos   │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Redirección a          │
│ /dashboard + confetti  │
└────────────────────────┘
```

---

## Diseño Visual

### Paleta de Colores (Fintech Minimalista)
- **Fondo**: `bg-secondary` (gris suave #F8F9FA)
- **Tarjetas**: `bg-background` (blanco)
- **Bordes**: `border-border` (gris sutil)
- **Texto primario**: Negro
- **Acciones**: Negro (`bg-primary`)

### Estados de Carga
- Skeleton loaders para tarjetas mientras carga
- Spinner en botón "Iniciar esta ruta" mientras procesa

### Indicadores Visuales
- Badge "Activa" si la ruta ya está en el panel del usuario
- Conteo de rutas activas vs. límite del plan

---

## Base de Datos

No se requieren cambios. Las tablas existentes son suficientes:

| Tabla | Uso |
|-------|-----|
| `route_templates` | Templates de rutas disponibles |
| `route_template_steps` | Pasos de cada template (para vista detalle) |
| `user_active_routes` | Rutas activadas por el usuario |
| `user_route_progress` | Pasos clonados con progreso del usuario |

---

## Sección Técnica

### Nueva Página `Explorar.tsx`

```typescript
// Estructura básica
const Explorar = () => {
  const { templates, activeRoutes, startRoute, canAddRoute, maxRoutes, isLoading } = useRoutes();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-secondary flex">
      <DashboardSidebar ... />
      <main className="flex-1 p-8">
        <RouteGrid templates={templates} onSelectRoute={setSelectedTemplate} />
      </main>
      <RouteDetailModal 
        templateId={selectedTemplate} 
        onStart={handleStartRoute}
        onClose={() => setSelectedTemplate(null)}
      />
      <RouteLimitModal isOpen={showLimitModal} ... />
    </div>
  );
};
```

### Nuevo hook para obtener pasos del template

```typescript
// Agregar a useRoutes.tsx
const getTemplateSteps = useCallback(async (templateId: string) => {
  const { data } = await supabase
    .from("route_template_steps")
    .select("*")
    .eq("template_id", templateId)
    .order("step_order");
  return data || [];
}, []);
```

### Navegación desde Sidebar

```typescript
// En DashboardSidebar.tsx
const handleNavClick = (id: string) => {
  if (id === "explorer") {
    navigate("/explorar");
    return;
  }
  onItemClick(id);
};
```

### RouteCard con nuevo diseño

```typescript
// Campos adicionales a mostrar
<div className="grid grid-cols-2 gap-2 text-sm">
  <div>💰 Costo: {template.estimated_cost}</div>
  <div>💵 Solvencia: {template.required_savings}</div>
  <div>📊 Dificultad: {getDifficulty(template)}</div>
  <div>📋 {stepsCount} pasos</div>
</div>
```

---

## Consideraciones

1. **Rutas ya activas**: Mostrar badge "Activa" y deshabilitar botón "Iniciar"
2. **Límite de plan**: Mostrar contador "2 de 3 rutas activas" en la página
3. **Modo Admin**: Respetar `effectiveMaxRoutes` del contexto de admin
4. **Responsive**: Grid de 1 columna en móvil, 2-3 en desktop
5. **Loading states**: Skeletons mientras cargan templates y pasos
