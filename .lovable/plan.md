

# Plan: E02 - Lead Magnet: Generador de Checklist Personalizado

## Resumen

Transformar el resultado "Eligible" de la Calculadora de Elegibilidad en un formulario de captura de leads que genera un checklist personalizado por pais, con opcion de descarga PDF y CTA hacia Plan Pro.

---

## 1. Modificar EligibilityCalculator - Captura de Leads

### Archivo: `src/components/eligibility/EligibilityCalculator.tsx`

Reemplazar el resultado estatico verde por un formulario de conversion:

- Cuando resultado = "eligible", mostrar:
  - Texto: "Eres apto! Para no cometer errores, descarga tu Hoja de Ruta Personalizada para la Regularizacion 2026."
  - Campos: Nombre y Email
  - Boton: "Obtener mi Guia Gratuita"
- Añadir prop opcional `country` para recibir el pais desde las landings de nacionalidad
- Al enviar el formulario:
  1. Guardar lead en `onboarding_submissions` con `crm_tag = lead_checklist_[pais]`
  2. Abrir modal del checklist personalizado

---

## 2. Componente ChecklistModal

### Nuevo archivo: `src/components/eligibility/ChecklistModal.tsx`

Modal que genera un checklist dinamico basado en el pais del usuario.

**Logica de generacion:**

| Pais | Items adicionales |
|------|-------------------|
| Venezuela | "Legalizacion SAREN de documentos civiles", "Apostilla via MPPRE" |
| Colombia | "Apostilla digital via cancilleria.gov.co" |
| Honduras | "Apostilla presencial en Corte Suprema o consulado" |
| Peru | "Legalizacion via RREE", "Apostilla en cancilleria peruana" |
| Marruecos | "Traduccion jurada de documentos en arabe/frances" |
| General (todos) | "Padron Historico (entrada antes 31/12/2025)", "Antecedentes Penales apostillados", "Pasaporte vigente", "Certificado medico", "Tasa 790-052", "Foto carnet" |

**Estructura del modal:**
- Header con nombre del usuario y pais
- Lista de items con checkboxes interactivos (como DocumentChecklist existente)
- Barra de progreso
- Boton "Descargar en PDF"
- CTA al final: "Te abruma tanto papeleo? Por solo 9.99 euros, el Plan Pro organiza estos documentos en tu Boveda Segura y valida tus fechas automaticamente." + Boton "Activar Plan Pro ahora"

---

## 3. Generador PDF del Checklist

### Nuevo archivo: `src/lib/generateChecklistPDF.ts`

Funcion que usa `jsPDF` (ya instalado) para generar un PDF con branding Albus B&W.

**Contenido del PDF:**
- Header negro con logo Albus
- Titulo: "Tu Hoja de Ruta - Regularizacion 2026"
- Subtitulo con nombre y pais del usuario
- Lista de documentos con checkboxes vacios
- Seccion de requisitos especificos del pais
- Footer con CTA a albus y fecha de generacion

El estilo seguira el patron de `generateTasa790.ts` existente.

---

## 4. Integracion con Landings de Nacionalidad

### Archivo: `src/pages/espana/RegularizacionPais.tsx`

Pasar el `paisId` como prop `country` al `EligibilityCalculator`:

```
<EligibilityCalculator 
  onStartProcess={() => setIsModalOpen(true)} 
  country={paisId}
/>
```

### Archivo: `src/pages/Index.tsx`

Sin cambios - la calculadora en la homepage no tendra pais preseleccionado; el checklist mostrara la version "General".

### Archivo: `src/pages/espana/Regularizacion2026.tsx`

Sin prop country - usara version general.

---

## 5. CRM Sync - Base de Datos

No se necesitan migraciones. Se reutiliza la tabla `onboarding_submissions` existente:
- Se inserta un registro con `crm_tag = 'lead_checklist_[pais]'` (ej: `lead_checklist_venezuela`)
- Se guardan `full_name`, `email`, y `nationality`

---

## Archivos a Crear

| Archivo | Proposito |
|---------|-----------|
| `src/components/eligibility/ChecklistModal.tsx` | Modal con checklist personalizado |
| `src/lib/generateChecklistPDF.ts` | Generador PDF del checklist |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/eligibility/EligibilityCalculator.tsx` | Formulario de captura post-eligibilidad + prop country |
| `src/pages/espana/RegularizacionPais.tsx` | Pasar country al calculator |

---

## Detalles Tecnicos

### EligibilityCalculator - Nuevo estado

```typescript
interface EligibilityCalculatorProps {
  onStartProcess?: () => void;
  country?: string; // paisId from nationality landing
}

// New states
const [showLeadForm, setShowLeadForm] = useState(false);
const [leadName, setLeadName] = useState("");
const [leadEmail, setLeadEmail] = useState("");
const [showChecklist, setShowChecklist] = useState(false);
```

Cuando `result === "eligible"`, en lugar de mostrar el resultado estatico, se muestra el formulario de captura. Al enviar, se guarda el lead y se abre `ChecklistModal`.

### ChecklistModal - Props

```typescript
interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  country?: string;
}
```

### CTA Plan Pro

Al hacer clic en "Activar Plan Pro ahora", se redirige al flujo de onboarding/checkout existente (`AnalysisModal` o directamente a Stripe).

---

## Orden de Implementacion

1. `generateChecklistPDF.ts` - Generador PDF
2. `ChecklistModal.tsx` - Modal del checklist
3. `EligibilityCalculator.tsx` - Formulario de captura
4. `RegularizacionPais.tsx` - Pasar prop country

