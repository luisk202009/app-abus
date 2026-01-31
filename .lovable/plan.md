
# Plan: Editor de Plantillas Maestras para Panel Admin

## Resumen

Implementar un sistema completo de gestion de plantillas de rutas en el Panel de Administracion. El editor permitira crear, editar y eliminar rutas y sus pasos asociados, con una interfaz intuitiva que sigue los patrones existentes de AdminPlansTab y AdminResourcesTab.

---

## Estado Actual

| Componente | Estado | Detalles |
|------------|--------|----------|
| `route_templates` | Solo lectura | 5 rutas existentes (Nomada Digital, Estudiante, etc.) |
| `route_template_steps` | Solo lectura | 20+ pasos distribuidos entre rutas |
| RLS Policies | Solo SELECT | Falta INSERT, UPDATE, DELETE para admin |
| Admin Panel | 3 tabs | Usuarios, Planes, Recursos |
| `is_admin()` | Existe | Funcion SECURITY DEFINER disponible |

---

## Cambios de Base de Datos

### 1. Nueva columna `difficulty` en route_templates

```sql
ALTER TABLE route_templates
ADD COLUMN difficulty TEXT DEFAULT 'media';
```

### 2. Politicas RLS para route_templates

```sql
-- Admin puede insertar rutas
CREATE POLICY "Admin can insert route templates"
ON route_templates FOR INSERT
WITH CHECK (is_admin());

-- Admin puede actualizar rutas
CREATE POLICY "Admin can update route templates"
ON route_templates FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Admin puede eliminar rutas
CREATE POLICY "Admin can delete route templates"
ON route_templates FOR DELETE
USING (is_admin());
```

### 3. Politicas RLS para route_template_steps

```sql
-- Admin puede insertar pasos
CREATE POLICY "Admin can insert route template steps"
ON route_template_steps FOR INSERT
WITH CHECK (is_admin());

-- Admin puede actualizar pasos
CREATE POLICY "Admin can update route template steps"
ON route_template_steps FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Admin puede eliminar pasos
CREATE POLICY "Admin can delete route template steps"
ON route_template_steps FOR DELETE
USING (is_admin());
```

---

## Arquitectura del Editor

```text
Admin Panel (/admin)
│
├── Tab: Usuarios (existente)
├── Tab: Planes (existente)
├── Tab: Recursos (existente)
│
└── Tab: Rutas (NUEVO)
    │
    ├── Seccion A: Catalogo de Rutas
    │   ├── Tabla con todas las rutas
    │   ├── Boton "+ Nueva ruta"
    │   └── Acciones: Editar, Ver pasos, Eliminar
    │
    └── Seccion B: Editor de Pasos (condicional)
        ├── Aparece al seleccionar una ruta
        ├── Lista ordenada de pasos
        ├── Boton "+ Nuevo paso"
        └── Drag & drop o flechas para reordenar
```

---

## Diseno de Interfaz

### Vista Principal del Tab "Rutas"

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Catalogo de Rutas                                          [+ Nueva ruta] │
│  Gestiona las plantillas de rutas disponibles para usuarios                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Nombre          │ Pais    │ Dificultad │ Pasos │ Acciones              ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ Nomada Digital  │ Espana  │ Media      │ 5     │ [Edit][Steps][Delete] ││
│  │ Estudiante      │ Espana  │ Facil      │ 5     │ [Edit][Steps][Delete] ││
│  │ Emprendedor     │ Espana  │ Alta       │ 5     │ [Edit][Steps][Delete] ││
│  │ Arraigo Social  │ Espana  │ Media      │ 6     │ [Edit][Steps][Delete] ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  Pasos de: Nomada Digital                                   [+ Nuevo paso] │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ #  │ Titulo                        │ Descripcion          │ Acciones   ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ 1  │ Preparar documentacion base   │ Pasaporte vigente... │ [↑][↓][✏][🗑]││
│  │ 2  │ Demostrar ingresos remotos    │ Contratos de trab... │ [↑][↓][✏][🗑]││
│  │ 3  │ Seguro medico                 │ Contratar seguro...  │ [↑][↓][✏][🗑]││
│  │ 4  │ Solicitar cita consular       │ Agendar cita en...   │ [↑][↓][✏][🗑]││
│  │ 5  │ Entrevista consular           │ Asistir a la ent...  │ [↑][↓][✏][🗑]││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Modal: Crear/Editar Ruta

```text
┌────────────────────────────────────────────────────────────┐
│  Nueva ruta                                           [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Nombre de la Ruta                                         │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Visado de Nomada Digital                               ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Pais                        Nivel de Dificultad           │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │ Espana          ▼    │    │ Media           ▼    │      │
│  └──────────────────────┘    └──────────────────────┘      │
│                                                            │
│  Descripcion breve                                         │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Visado para trabajadores remotos con ingresos estables ││
│  │ desde cualquier parte del mundo.                       ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Coste Estimado              Ahorros Requeridos            │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │ 800 - 1,200 EUR      │    │ 10,000+ EUR          │      │
│  └──────────────────────┘    └──────────────────────┘      │
│                                                            │
│                              [Cancelar]  [Guardar ruta]    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Modal: Crear/Editar Paso

```text
┌────────────────────────────────────────────────────────────┐
│  Nuevo paso                                           [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Titulo del Paso                                           │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Demostrar ingresos remotos                             ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Orden                                                     │
│  ┌────────────────────────────────────────────────────────┐│
│  │ 2                                                      ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Descripcion                                               │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Contratos de trabajo remoto o facturas de clientes     ││
│  │ (minimo 2,520 EUR/mes). Incluir extractos bancarios    ││
│  │ de los ultimos 3-6 meses.                              ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│                              [Cancelar]  [Guardar paso]    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/components/admin/AdminRoutesTab.tsx` | Tab principal con catalogo y editor de pasos |
| `src/components/admin/RouteTemplateForm.tsx` | Modal/formulario para crear/editar rutas |
| `src/components/admin/StepTemplateForm.tsx` | Modal/formulario para crear/editar pasos |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Admin.tsx` | Agregar nuevo tab "Rutas" con icono Map o Route |

---

## Seccion Tecnica

### Migracion SQL Completa

```sql
-- 1. Agregar columna difficulty
ALTER TABLE route_templates
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'media';

-- 2. RLS para route_templates (admin CRUD)
CREATE POLICY "Admin can insert route templates"
ON route_templates FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admin can update route templates"
ON route_templates FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin can delete route templates"
ON route_templates FOR DELETE
USING (is_admin());

-- 3. RLS para route_template_steps (admin CRUD)
CREATE POLICY "Admin can insert route template steps"
ON route_template_steps FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admin can update route template steps"
ON route_template_steps FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin can delete route template steps"
ON route_template_steps FOR DELETE
USING (is_admin());
```

### Interface TypeScript para RouteTemplate

```typescript
interface RouteTemplate {
  id: string;
  name: string;
  country: string;
  description: string | null;
  estimated_cost: string | null;
  required_savings: string | null;
  difficulty: 'facil' | 'media' | 'alta';
}

interface RouteTemplateStep {
  id: string;
  template_id: string;
  title: string;
  description: string | null;
  step_order: number;
}
```

### Logica de Reordenamiento de Pasos

```typescript
const moveStepUp = async (step: RouteTemplateStep) => {
  const currentIndex = steps.findIndex(s => s.id === step.id);
  if (currentIndex <= 0) return;
  
  const prevStep = steps[currentIndex - 1];
  
  // Swap orders
  await supabase.from('route_template_steps')
    .update({ step_order: prevStep.step_order })
    .eq('id', step.id);
    
  await supabase.from('route_template_steps')
    .update({ step_order: step.step_order })
    .eq('id', prevStep.id);
    
  fetchSteps();
};
```

### Sincronizacion

Los cambios en plantillas afectan solo a nuevas activaciones:
- Cuando un usuario inicia una ruta, se copian los pasos actuales a `user_route_progress`
- Las rutas ya iniciadas mantienen su estado original
- No se requiere logica adicional de sincronizacion

---

## Orden de Implementacion

1. **Migracion SQL** - Agregar columna difficulty y politicas RLS
2. **AdminRoutesTab.tsx** - Componente principal con tabla de rutas
3. **RouteTemplateForm.tsx** - Modal para crear/editar rutas
4. **StepTemplateForm.tsx** - Modal para crear/editar pasos
5. **Admin.tsx** - Integrar nuevo tab
6. **Funcionalidad de reordenar** - Flechas arriba/abajo para pasos

---

## Verificacion

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Admin crea nueva ruta | Aparece en tabla, disponible para usuarios |
| Admin edita ruta existente | Cambios guardados, rutas activas no afectadas |
| Admin elimina ruta | Se elimina con sus pasos (CASCADE) |
| Admin agrega paso | Aparece en lista ordenada |
| Admin reordena pasos | Orden actualizado correctamente |
| Usuario no-admin intenta CRUD | Operacion rechazada por RLS |
| Nuevo usuario inicia ruta | Recibe los pasos actualizados |
