
# Plan: Separar Arraigos y Regularización 2026 con Flujos Independientes

## Resumen

Dividir la experiencia actual de regularización en dos páginas independientes bajo `/españa/`, cada una con su propio flujo de preguntas de elegibilidad específico. Esto permite filtrar mejor a los usuarios y dirigirlos al template correcto según su situación real.

---

## Arquitectura de URLs

```text
ANTES:
/regularizacion → Contenido mixto (3 pilares + docs)

DESPUÉS:
/españa/arraigos        → Página sobre los 3 tipos de arraigo tradicionales
/españa/regularizacion  → Página dedicada a Regularización Extraordinaria 2026
```

---

## Flujos de Elegibilidad

### Path A: Regularización 2026 (`/españa/regularizacion`)

```text
┌────────────────────────────────────────────────────────┐
│  Pregunta 1:                                           │
│  "¿Ingresaste a España antes del 31 de diciembre      │
│   de 2025?"                                            │
│                                                        │
│  [ Sí, antes de esa fecha ]                           │
│  [ No, después de esa fecha ]                         │
│                                                        │
│  Si NO → Redirige a /españa/arraigos con mensaje      │
└────────────────────────────────────────────────────────┘
              │
              │ SI
              ▼
┌────────────────────────────────────────────────────────┐
│  Pregunta 2:                                           │
│  "¿Puedes acreditar 5 meses de estancia mediante      │
│   empadronamiento o recibos?"                          │
│                                                        │
│  [ Sí, tengo documentación ]                          │
│  [ No, aún no llego a 5 meses ]                       │
│                                                        │
│  Si NO → Mensaje: "Debes esperar hasta completar      │
│          5 meses antes del 30 de junio"               │
└────────────────────────────────────────────────────────┘
              │
              │ SI
              ▼
┌────────────────────────────────────────────────────────┐
│  ÉXITO:                                                │
│  "¡Apto para Regularización!"                         │
│  Podrás trabajar en 15 días tras tu solicitud.        │
│                                                        │
│  [Continuar al proceso completo →]                    │
│  (Inicia ruta: Regularización Extraordinaria 2026)    │
└────────────────────────────────────────────────────────┘
```

### Path B: Arraigos (`/españa/arraigos`)

```text
┌────────────────────────────────────────────────────────┐
│  Pregunta 1:                                           │
│  "¿Cuánto tiempo llevas viviendo en España?"          │
│                                                        │
│  [ Menos de 2 años ]                                  │
│  [ 2 años ]                                           │
│  [ 3 años o más ]                                     │
│                                                        │
│  Si < 2 años → "Debes esperar hasta cumplir 2 años   │
│                para solicitar arraigo"                │
└────────────────────────────────────────────────────────┘
              │
              │ 2 años o 3+ años
              ▼
┌────────────────────────────────────────────────────────┐
│  Pregunta 2 (varía según tiempo):                     │
│                                                        │
│  SI 2 AÑOS:                                           │
│  "¿Tienes una oferta de trabajo (Laboral) o vas a    │
│   matricularte en formación (Socioformativo)?"        │
│                                                        │
│  [ Tengo oferta de trabajo ]                          │
│  [ Voy a estudiar/formarme ]                          │
│  [ Ninguna de las dos ]                               │
│                                                        │
│  SI 3+ AÑOS:                                          │
│  "¿Tienes informe de inserción social o contrato?"   │
│                                                        │
│  [ Tengo informe de inserción ]                       │
│  [ Tengo contrato de trabajo ]                        │
│  [ Ninguno de los dos ]                               │
└────────────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│  RESULTADO PERSONALIZADO:                             │
│                                                        │
│  2 años + trabajo → "Arraigo Laboral"                 │
│  2 años + formación → "Arraigo Socioformativo"        │
│  3+ años + inserción → "Arraigo Social"               │
│  3+ años + contrato → "Arraigo Social"                │
│                                                        │
│  [Continuar al proceso completo →]                    │
│  (Inicia ruta: Arraigo Social - template existente)   │
└────────────────────────────────────────────────────────┘
```

---

## Diseño Visual: Landing Regularización 2026

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Navbar                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [REGULARIZACIÓN 2026] Badge con fondo negro                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │           Regularización Extraordinaria 2026                            ││
│  │           ════════════════════════════════════                          ││
│  │                                                                         ││
│  │   Entrada en España antes del 31/12/2025                               ││
│  │   + 5 meses de estancia = Permiso de trabajo en 15 días                ││
│  │                                                                         ││
│  │                    [Analizar mi elegibilidad →]                        ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  Requisitos Clave                                                          │
│                                                                             │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │ FECHA DE ENTRADA  │ │ TIEMPO MÍNIMO     │ │ RESULTADO         │         │
│  │ ─────────────     │ │ ─────────────     │ │ ─────────────     │         │
│  │ Antes del         │ │ 5 meses de        │ │ Permiso de        │         │
│  │ 31 dic 2025       │ │ empadronamiento   │ │ trabajo en 15     │         │
│  │                   │ │                   │ │ días hábiles      │         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  Plazo límite: 30 de junio de 2026                                        │
│  [Verificar si califico →]                                                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Footer                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diseño Visual: Landing Arraigos

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Navbar                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │                    Vías de Arraigo en España                           ││
│  │                    ═════════════════════════                           ││
│  │                                                                         ││
│  │   Regularízate a través de tu tiempo de residencia,                    ││
│  │   vínculos laborales o formación profesional.                          ││
│  │                                                                         ││
│  │                    [Analizar mi perfil →]                              ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  Los 3 Pilares del Arraigo                                                 │
│                                                                             │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │ ARRAIGO SOCIAL    │ │ ARRAIGO LABORAL   │ │ ARRAIGO           │         │
│  │ ─────────────     │ │ ─────────────     │ │ SOCIOFORMATIVO    │         │
│  │ 3 años + informe  │ │ 2 años + contrato │ │ ─────────────     │         │
│  │ de inserción o    │ │ de trabajo        │ │ 2 años +          │         │
│  │ contrato          │ │                   │ │ matriculación     │         │
│  │                   │ │                   │ │ en formación      │         │
│  │ ✓ Empadronamiento │ │ ✓ Empadronamiento │ │ ✓ Empadronamiento │         │
│  │ ✓ Antecedentes    │ │ ✓ Antecedentes    │ │ ✓ Antecedentes    │         │
│  │ ✓ Informe/Contrato│ │ ✓ Oferta laboral  │ │ ✓ Curso acreditado│         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  Documentos Requeridos (Checklist interactivo)                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Footer                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/pages/espana/Regularizacion2026.tsx` | Landing de Regularización Extraordinaria 2026 |
| `src/pages/espana/Arraigos.tsx` | Landing de Arraigos (contenido actual adaptado) |
| `src/components/eligibility/EligibilityModalReg2026.tsx` | Modal de 2 preguntas para Reg 2026 |
| `src/components/eligibility/EligibilityModalArraigos.tsx` | Modal de 2 preguntas para Arraigos |
| `src/components/eligibility/EligibilityResult.tsx` | Componente de resultado de elegibilidad |
| `src/components/espana/RequirementCard.tsx` | Tarjeta de requisito para Reg 2026 |
| `src/components/espana/HeroArraigos.tsx` | Hero section para página de Arraigos |
| `src/components/espana/HeroReg2026.tsx` | Hero section para página de Reg 2026 |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar rutas `/españa/regularizacion` y `/españa/arraigos`, redirigir `/regularizacion` |
| `src/pages/Dashboard.tsx` | Manejar sources `reg2026` y `arraigos` para auto-asignación |
| `src/components/Navbar.tsx` | Actualizar enlaces si aplica |

## Archivos a Eliminar (Opcional)

| Archivo | Razón |
|---------|-------|
| `src/pages/Regularizacion.tsx` | Reemplazado por las dos nuevas páginas (o mantener como redirect) |

---

## Sección Técnica

### Conexión con Templates

```typescript
// IDs de templates para auto-routing
const TEMPLATE_IDS = {
  regularizacion2026: "57b27d4a-190b-4ece-a1c3-de1859d58217",
  arraigoSocial: "f451f205-2dae-4eaf-9103-d895c626d57c",
};
```

### Tipos de Resultado de Elegibilidad

```typescript
type EligibilityResult = 
  | { eligible: true; routeType: "regularizacion2026" | "arraigo_social" | "arraigo_laboral" | "arraigo_formativo"; message: string }
  | { eligible: false; reason: "date" | "time" | "documents"; message: string; redirect?: string };
```

### Flujo del Modal de Elegibilidad Reg 2026

```typescript
// EligibilityModalReg2026.tsx
interface Reg2026FormData {
  enteredBeforeDeadline: boolean | null; // Q1: ¿Antes del 31/12/2025?
  hasFiveMonthsProof: boolean | null;    // Q2: ¿5 meses de empadronamiento?
}

const evaluateEligibility = (data: Reg2026FormData): EligibilityResult => {
  if (data.enteredBeforeDeadline === false) {
    return {
      eligible: false,
      reason: "date",
      message: "Para la Regularización 2026 debes haber entrado antes del 31 de diciembre de 2025. Te recomendamos explorar las vías de arraigo tradicionales.",
      redirect: "/españa/arraigos",
    };
  }
  
  if (data.hasFiveMonthsProof === false) {
    return {
      eligible: false,
      reason: "time",
      message: "Debes esperar hasta completar 5 meses de estancia antes del 30 de junio de 2026.",
    };
  }
  
  return {
    eligible: true,
    routeType: "regularizacion2026",
    message: "¡Apto para Regularización! Podrás trabajar en 15 días tras tu solicitud.",
  };
};
```

### Flujo del Modal de Elegibilidad Arraigos

```typescript
// EligibilityModalArraigos.tsx
interface ArraigosFormData {
  timeInSpain: "less_than_2" | "2_years" | "3_plus_years" | null;
  // Pregunta condicional según tiempo:
  twoYearOption: "trabajo" | "formacion" | "ninguno" | null;
  threeYearOption: "insercion" | "contrato" | "ninguno" | null;
}

const evaluateArraigo = (data: ArraigosFormData): EligibilityResult => {
  if (data.timeInSpain === "less_than_2") {
    return {
      eligible: false,
      reason: "time",
      message: "Debes esperar hasta cumplir al menos 2 años de residencia continuada para solicitar arraigo.",
    };
  }
  
  if (data.timeInSpain === "2_years") {
    if (data.twoYearOption === "trabajo") {
      return { eligible: true, routeType: "arraigo_laboral", message: "Calificas para Arraigo Laboral" };
    }
    if (data.twoYearOption === "formacion") {
      return { eligible: true, routeType: "arraigo_formativo", message: "Calificas para Arraigo Socioformativo" };
    }
    return { eligible: false, reason: "documents", message: "Necesitas una oferta de trabajo o matricularte en formación." };
  }
  
  // 3+ años
  if (data.threeYearOption === "ninguno") {
    return { eligible: false, reason: "documents", message: "Necesitas informe de inserción social o contrato de trabajo." };
  }
  
  return { eligible: true, routeType: "arraigo_social", message: "Calificas para Arraigo Social" };
};
```

### Actualización de App.tsx

```typescript
// Nuevas rutas
<Route path="/españa/regularizacion" element={<Regularizacion2026 />} />
<Route path="/españa/arraigos" element={<Arraigos />} />

// Redirect de URL antigua (opcional)
<Route path="/regularizacion" element={<Navigate to="/españa/arraigos" replace />} />
```

### Actualización de Dashboard.tsx

```typescript
// Detectar source y auto-iniciar ruta
useEffect(() => {
  const source = localStorage.getItem("onboarding_source");
  
  if (source === "reg2026") {
    localStorage.removeItem("onboarding_source");
    const template = templates.find(t => t.id === TEMPLATE_IDS.regularizacion2026);
    if (template && canAddRoute) handleStartRoute(template.id);
  }
  
  if (source === "arraigos") {
    localStorage.removeItem("onboarding_source");
    const template = templates.find(t => t.id === TEMPLATE_IDS.arraigoSocial);
    if (template && canAddRoute) handleStartRoute(template.id);
  }
}, [templates, canAddRoute]);
```

---

## Orden de Implementación

1. **Crear componentes de elegibilidad** - Modales con flujo de preguntas
2. **Crear página Regularización 2026** - Landing con hero y requisitos
3. **Crear página Arraigos** - Adaptar contenido actual con nuevo hero
4. **Actualizar App.tsx** - Nuevas rutas bajo `/españa/`
5. **Actualizar Dashboard.tsx** - Manejar nuevos sources
6. **Mantener redirect** - `/regularizacion` → `/españa/arraigos`
7. **Actualizar navegación** - Si hay enlaces directos

---

## Verificación

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Usuario visita `/españa/regularizacion` | Ve landing de Reg 2026 con requisitos |
| Click "Analizar elegibilidad" en Reg 2026 | Modal con 2 preguntas específicas |
| No entró antes del 31/12/2025 | Redirige a `/españa/arraigos` |
| No tiene 5 meses de estancia | Mensaje: "Debes esperar hasta..." |
| Cumple ambos requisitos | Mensaje éxito + botón continuar → auto-inicia ruta |
| Usuario visita `/españa/arraigos` | Ve landing con 3 pilares |
| Click "Analizar perfil" en Arraigos | Modal con preguntas de tiempo |
| Menos de 2 años en España | Mensaje: "Debes esperar..." |
| 2 años + oferta trabajo | Identifica "Arraigo Laboral" |
| 3+ años + contrato | Identifica "Arraigo Social" → auto-inicia ruta |
| URL antigua `/regularizacion` | Redirige a `/españa/arraigos` |
