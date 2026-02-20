
# Plan: E01 - SEO Landings por Nacionalidad, Calculadora de Elegibilidad y Centro de Recursos

## Resumen

Crear paginas de aterrizaje por nacionalidad para SEO, un widget interactivo de calculadora de elegibilidad con DatePicker, un centro de recursos en `/recursos`, y metadata dinamica con banner countdown sticky.

---

## 1. Paginas por Nacionalidad

### Nuevo archivo: `src/pages/espana/RegularizacionPais.tsx`

Pagina template dinamica que recibe el pais desde la URL `/españa/regularizacion/:paisId`.

**Datos por pais** (constante en el mismo archivo):

| Pais | Codigo | Requisito Especifico |
|------|--------|---------------------|
| Venezuela | ve | Legalizacion via SAREN para documentos civiles |
| Colombia | co | Apostilla digital disponible via cancilleria.gov.co |
| Honduras | hn | Apostilla presencial en Tegucigalpa o consulado |
| Peru | pe | Legalizacion via RREE y apostilla en cancilleria |
| Marruecos | ma | Traduccion jurada obligatoria de documentos en arabe |

**Estructura de cada pagina:**
- Navbar + sticky countdown banner
- Hero con titulo SEO: "Regularizacion 2026 para [Gentilicio]s en Espana: Guia Paso a Paso"
- Seccion de requisitos especificos del pais
- Widget de Calculadora de Elegibilidad (componente compartido)
- CTA hacia onboarding Pro/Premium
- Footer

### Metadata SEO dinamica

Usar `document.title` y meta tags via `useEffect` en cada pagina de pais:
- Title: "Regularizacion 2026 para [Gentilicio]s en Espana | Albus"
- Description: "Guia completa para [gentilicio]s que quieren regularizarse en Espana en 2026. Requisitos, documentos y plazos."

---

## 2. Calculadora de Elegibilidad 2026

### Nuevo archivo: `src/components/eligibility/EligibilityCalculator.tsx`

Widget independiente con DatePicker de Shadcn.

**Interfaz:**
- Titulo: "Calculadora de Elegibilidad 2026"
- Input: Popover con Calendar para seleccionar fecha de entrada a Espana
- Boton "Verificar"

**Logica:**
- Si fecha <= 31/12/2025: Resultado verde "Eres elegible! Tienes hasta el 30 de junio para aplicar." + CTA a onboarding
- Si fecha > 31/12/2025: Resultado amarillo "No aplicas para la Regularizacion 2026, pero te ayudamos con el proceso de Arraigo Social." + link a `/españa/arraigos`

**Ubicacion:**
- Homepage (Index.tsx): entre HowItWorksSection y FeaturesSection
- Todas las landings de regularizacion por pais
- Pagina principal de Regularizacion2026.tsx

---

## 3. Centro de Recursos (`/recursos`)

### Nuevo archivo: `src/pages/Recursos.tsx`

Grid de tarjetas de articulos SEO (placeholders por ahora).

**3 tarjetas iniciales:**

| Titulo | Descripcion | Tag |
|--------|-------------|-----|
| Padron Historico: Como solicitarlo para la Regularizacion | Guia paso a paso para obtener tu certificado de empadronamiento historico | Documentacion |
| Antecedentes Penales: Que vigencia deben tener en 2026? | Todo sobre la validez y apostilla de tus antecedentes penales | Legal |
| Hijos menores: El permiso de 5 anos explicado | Como incluir a tus hijos menores en el proceso de regularizacion | Familia |

**Diseno:** Grid responsive (1-2-3 columnas), tarjetas con icono, titulo, descripcion, tag de categoria, y un label "Proximamente" ya que son placeholders.

### Ruta en App.tsx

Agregar `<Route path="/recursos" element={<Recursos />} />`

---

## 4. Countdown Banner Sticky

### Nuevo archivo: `src/components/CountdownBanner.tsx`

Banner sticky debajo del navbar (top fijo) que muestra los dias restantes.

- Texto: "Faltan [X] dias para el cierre del proceso (30 de Junio)"
- Estilo: fondo `bg-primary text-primary-foreground`, sticky debajo del nav
- Se muestra en: paginas de regularizacion por pais y Regularizacion2026

---

## Archivos a Crear

| Archivo | Proposito |
|---------|-----------|
| `src/pages/espana/RegularizacionPais.tsx` | Template dinamico por nacionalidad |
| `src/components/eligibility/EligibilityCalculator.tsx` | Widget calculadora con DatePicker |
| `src/pages/Recursos.tsx` | Centro de recursos / blog |
| `src/components/CountdownBanner.tsx` | Banner sticky con countdown |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar rutas `/españa/regularizacion/:paisId` y `/recursos` |
| `src/pages/Index.tsx` | Insertar EligibilityCalculator entre secciones |
| `src/pages/espana/Regularizacion2026.tsx` | Agregar EligibilityCalculator y CountdownBanner |
| `src/components/Navbar.tsx` | Agregar link "Recursos" apuntando a `/recursos` |

---

## Detalles Tecnicos

### Routing

```typescript
// App.tsx - nuevas rutas
<Route path="/españa/regularizacion/:paisId" element={<RegularizacionPais />} />
<Route path="/recursos" element={<Recursos />} />
```

### EligibilityCalculator - Logica principal

```typescript
const cutoffDate = new Date("2025-12-31");

const handleCheck = () => {
  if (!selectedDate) return;
  if (selectedDate <= cutoffDate) {
    setResult("eligible");
  } else {
    setResult("not-eligible");
  }
};
```

Usa el componente Calendar de Shadcn dentro de un Popover con `pointer-events-auto` como indica la documentacion.

### SEO Metadata

Cada pagina de pais usara un `useEffect` para establecer:
- `document.title`
- `meta[name="description"]` via `document.querySelector`

### Datos de Paises

```typescript
const paisesData = {
  venezuela: {
    name: "Venezuela", gentilicio: "Venezolano",
    code: "ve",
    requisito: "Legalizacion via SAREN para documentos civiles",
    detalle: "Los documentos venezolanos deben ser legalizados...",
  },
  colombia: { ... },
  honduras: { ... },
  peru: { ... },
  marruecos: { ... },
};
```

---

## Orden de Implementacion

1. CountdownBanner (componente reutilizable)
2. EligibilityCalculator (widget con DatePicker)
3. RegularizacionPais (template + datos de 5 paises)
4. Recursos (pagina grid)
5. Actualizar App.tsx con rutas
6. Integrar calculadora en Index.tsx y Regularizacion2026.tsx
7. Actualizar Navbar con link a Recursos
