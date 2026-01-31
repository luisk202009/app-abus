
# Plan: Lanzamiento Completo de Regularizacion Espanola 2026

## Resumen

Crear una experiencia de conversion completa para el programa de Regularizacion Extraordinaria 2026 en Espana. Incluye una landing page de alto impacto, plantilla de ruta con sus pasos detallados, y logica de conexion para auto-asignar la ruta a usuarios que lleguen desde esta pagina.

---

## Arquitectura del Flujo

```text
/regularizacion (Landing Page)
         │
         │ Click "Iniciar mi proceso"
         │ source=regularizacion
         ▼
┌──────────────────────────────────┐
│   AnalysisModal (Onboarding)     │
│   - Guarda source en localStorage│
│   - O pasa via state             │
└──────────────────────────────────┘
         │
         │ Completa onboarding
         ▼
┌──────────────────────────────────┐
│   Dashboard                      │
│   - Detecta source=regularizacion│
│   - Auto-inicia ruta especifica  │
│   - Salta Route Explorer         │
└──────────────────────────────────┘
```

---

## 1. Landing Page `/regularizacion`

### Estructura Visual

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Navbar                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [NEW 2026] Badge                                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │              Nueva Reforma de Extranjeria 2026                          ││
│  │              ═══════════════════════════════════                        ││
│  │                                                                         ││
│  │   Regularizate en Espana con las nuevas leyes                          ││
│  │   que entran en vigor este ano.                                        ││
│  │                                                                         ││
│  │                    [Iniciar mi proceso →]                              ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  Los 3 Pilares de la Nueva Ley                                             │
│                                                                             │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │ ARRAIGO SOCIAL    │ │ ARRAIGO FORMACION │ │ SEGUNDA OPORTUN.  │         │
│  │ ─────────────     │ │ ─────────────     │ │ ─────────────     │         │
│  │ 2 anos residencia │ │ Formacion + empleo│ │ Vias irregulares  │         │
│  │ (antes eran 3)    │ │ sin experiencia   │ │ previa reconocida │         │
│  │                   │ │                   │ │                   │         │
│  │ ✓ Empadronamiento │ │ ✓ Curso acreditado│ │ ✓ Buen historial  │         │
│  │ ✓ Antecedentes    │ │ ✓ Contrato empleo │ │ ✓ Sin delitos     │         │
│  │ ✓ Contrato/Medios │ │ ✓ Seguro medico   │ │ ✓ Integracion     │         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  Documentos que Necesitaras (Preview Interactivo)                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  □  Empadronamiento historico (min. 2 anos)                            ││
│  │  □  Pasaporte vigente                                                  ││
│  │  □  Antecedentes penales apostillados                                  ││
│  │  □  Contrato de trabajo o compromiso de formacion                      ││
│  │  □  Certificado medico                                                 ││
│  │  □  Tasa 790-052 pagada                                                ││
│  │  □  Foto tipo carnet                                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│               [Comenzar mi proceso de regularizacion →]                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Footer                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cambios de Base de Datos

### Actualizar route_templates

Actualizar el registro existente "Regularizacion" (id: `57b27d4a-190b-4ece-a1c3-de1859d58217`) con datos completos:

| Campo | Valor |
|-------|-------|
| name | Regularizacion Extraordinaria 2026 |
| country | Espana |
| description | Nueva via de regularizacion con arraigo social de 2 anos bajo la reforma de extranjeria 2026. |
| estimated_cost | 200 - 500 EUR |
| required_savings | Variable |
| difficulty | facil |

### Insertar route_template_steps

5 pasos para la ruta de regularizacion:

| Orden | Titulo | Descripcion |
|-------|--------|-------------|
| 1 | Verificacion de Permanencia | Conseguir empadronamiento historico que demuestre al menos 2 anos de residencia continuada en Espana. Solicitar en tu Ayuntamiento local. |
| 2 | Antecedentes Penales | Solicitar certificado de antecedentes penales de tu pais de origen y apostillarlo con la Apostilla de la Haya. Algunos paises requieren traduccion jurada. |
| 3 | Prueba de Medios Economicos | Preparar contrato de trabajo (min. 1 ano, 40h/semana) o compromiso de formacion acreditado. Alternativa: recursos propios demostrables. |
| 4 | Tasa 790-052 | Generar y pagar la tasa administrativa 790-052 en una entidad bancaria colaboradora. Importe aprox: 16-20 EUR. |
| 5 | Presentacion Telematica | Subir todos los documentos a la plataforma Mercurio del Ministerio. Agendar cita si es requerido por tu oficina de extranjeria. |

---

## 3. Logica de Conexion

### Flujo Tecnico

```text
1. Usuario llega a /regularizacion
         │
         ▼
2. Click "Iniciar mi proceso"
   - Abre AnalysisModal con prop: source="regularizacion"
   - Guarda en localStorage: "onboarding_source" = "regularizacion"
         │
         ▼
3. Usuario completa onboarding
   - Se guarda en onboarding_submissions
         │
         ▼
4. Redirige a Dashboard con state:
   {
     ...userData,
     source: "regularizacion",
     autoStartRouteSlug: "regularizacion-2026"
   }
         │
         ▼
5. Dashboard detecta source y autoStartRouteSlug
   - Busca template con name LIKE "%Regularizacion%"
   - Auto-ejecuta startRoute(templateId)
   - Free users gastan su slot en esta ruta
   - NO muestra Route Explorer
```

---

## Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/pages/Regularizacion.tsx` | Landing page completa de la campana |
| `src/components/regularizacion/PillarCard.tsx` | Tarjeta para cada pilar de la ley |
| `src/components/regularizacion/DocumentChecklist.tsx` | Preview interactivo de documentos |
| `src/components/regularizacion/HeroRegularizacion.tsx` | Hero section con badge NEW 2026 |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar ruta `/regularizacion` |
| `src/components/AnalysisModal.tsx` | Aceptar prop `source` y pasarlo al state |
| `src/pages/Dashboard.tsx` | Detectar `source=regularizacion` y auto-iniciar ruta |

---

## Seccion Tecnica

### Migracion SQL

```sql
-- Actualizar template de Regularizacion
UPDATE route_templates
SET 
  name = 'Regularización Extraordinaria 2026',
  description = 'Nueva vía de regularización con arraigo social de 2 años bajo la reforma de extranjería 2026.',
  estimated_cost = '200 - 500€',
  required_savings = 'Variable',
  difficulty = 'facil'
WHERE id = '57b27d4a-190b-4ece-a1c3-de1859d58217';

-- Insertar los 5 pasos
INSERT INTO route_template_steps (template_id, step_order, title, description)
VALUES
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 1, 'Verificación de Permanencia', 
   'Conseguir empadronamiento histórico que demuestre al menos 2 años de residencia continuada en España. Solicitar en tu Ayuntamiento local.'),
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 2, 'Antecedentes Penales', 
   'Solicitar certificado de antecedentes penales de tu país de origen y apostillarlo con la Apostilla de la Haya. Algunos países requieren traducción jurada.'),
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 3, 'Prueba de Medios Económicos', 
   'Preparar contrato de trabajo (mín. 1 año, 40h/semana) o compromiso de formación acreditado. Alternativa: recursos propios demostrables.'),
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 4, 'Tasa 790-052', 
   'Generar y pagar la tasa administrativa 790-052 en una entidad bancaria colaboradora. Importe aprox: 16-20€.'),
  ('57b27d4a-190b-4ece-a1c3-de1859d58217', 5, 'Presentación Telemática', 
   'Subir todos los documentos a la plataforma Mercurio del Ministerio. Agendar cita si es requerido por tu oficina de extranjería.');
```

### Componente Regularizacion.tsx (Estructura)

```typescript
// src/pages/Regularizacion.tsx
interface RegularizacionProps {}

const Regularizacion = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartProcess = () => {
    // Guardar source en localStorage
    localStorage.setItem("onboarding_source", "regularizacion");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroRegularizacion onStart={handleStartProcess} />
      <PillarsSection />
      <DocumentChecklist />
      <CTASection onStart={handleStartProcess} />
      <Footer />
      <AnalysisModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        source="regularizacion"
      />
    </div>
  );
};
```

### Logica de Auto-Start en Dashboard

```typescript
// En src/pages/Dashboard.tsx - dentro del useEffect
useEffect(() => {
  const source = localStorage.getItem("onboarding_source");
  const stateSource = location.state?.source;
  
  if (source === "regularizacion" || stateSource === "regularizacion") {
    // Limpiar localStorage
    localStorage.removeItem("onboarding_source");
    
    // Buscar template de Regularizacion
    const regTemplate = templates.find(t => 
      t.name.toLowerCase().includes("regularización")
    );
    
    if (regTemplate && canAddRoute) {
      // Auto-iniciar la ruta
      startRoute(regTemplate.id);
    }
  }
}, [templates, canAddRoute, startRoute, location.state]);
```

---

## Diseno Visual

### Paleta de Colores

| Elemento | Color | Uso |
|----------|-------|-----|
| Badge "NEW 2026" | Negro con borde | Destacar novedad |
| Pillar Cards | Fondo gris claro | Seccion informativa |
| Document Checklist | Background blanco | Interactividad |
| CTA Button | Negro solido | Accion principal |

### Iconografia

- Pilares: `Scale`, `GraduationCap`, `RefreshCw`
- Documentos: `FileText`, `FileCheck`, `Stamp`, `CreditCard`, `Upload`
- Badge: `Sparkles` o `Star`

---

## Orden de Implementacion

1. **Migracion SQL** - Actualizar template y agregar pasos
2. **Regularizacion.tsx** - Pagina principal con estructura
3. **HeroRegularizacion.tsx** - Hero con badge NEW 2026
4. **PillarCard.tsx** - Componente de pilar reutilizable
5. **DocumentChecklist.tsx** - Preview interactivo de docs
6. **App.tsx** - Agregar ruta `/regularizacion`
7. **AnalysisModal.tsx** - Agregar prop `source`
8. **Dashboard.tsx** - Logica de auto-start

---

## Verificacion

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Usuario visita /regularizacion | Ve landing page con 3 pilares y checklist |
| Click "Iniciar mi proceso" | Abre onboarding modal |
| Completa onboarding desde landing | Auto-inicia ruta Regularizacion 2026 |
| Usuario Free usa landing | Gasta su slot en esta ruta especifica |
| Usuario Pro usa landing | Inicia ruta sin gastar ultimo slot |
| Template en Explorar | Muestra badge "Nuevo 2026" |
