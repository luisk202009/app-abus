

# Plan: Unificar flujo de Regularizacion y corregir error de pago

## Diagnostico del error de pago

El error 401 en las capturas viene de `create-one-time-payment`, que es la edge function antigua que requiere autenticacion. El componente `RegistrationModal.tsx` sigue existiendo en el proyecto y llama a esa funcion SIN crear una cuenta auth de Supabase primero. Aunque `QualificationSuccess` ya fue refactorizado para usar `create-checkout` (suscripcion con auth), el archivo `RegistrationModal.tsx` sigue presente y podria estar siendo referenciado por una version publicada anterior.

## Cambios propuestos

### 1. Eliminar `RegistrationModal.tsx`
**Archivo**: `src/components/eligibility/RegistrationModal.tsx`
- Eliminar completamente este archivo. Ya no es importado por ningun componente.
- Era el origen del error: llamaba a `create-one-time-payment` sin sesion auth, resultando en 401.

### 2. Simplificar la landing de Regularizacion 2026
**Archivo**: `src/pages/espana/Regularizacion2026.tsx`
- **Problema actual**: Tiene 3 puntos de entrada redundantes:
  1. Hero CTA "Analizar mi elegibilidad" → abre `EligibilityModalReg2026`
  2. Seccion CTA "Verificar si califico" → abre la misma modal
  3. `EligibilityCalculator` con fecha + lead capture + ChecklistModal
- **Cambio**: Eliminar el componente `EligibilityCalculator` de esta pagina (ya esta en el Home). Mantener solo el flujo de `EligibilityModalReg2026` con los 2 CTAs del hero y de la seccion inferior, que es mas directo para conversion.

### 3. Agregar CTA en el Home para ir a la landing de Regularizacion
**Archivo**: `src/components/eligibility/EligibilityCalculator.tsx`
- Despues de que el usuario ve que es "eligible" y completa el lead capture (o tras ver el checklist), agregar un boton secundario: "Conoce mas sobre la Regularizacion 2026" que navega a `/españa/regularizacion`.
- Esto conecta el flujo del Home (calculadora gratuita) con la landing de conversion (pricing).

### 4. Agregar CTA en el ChecklistModal hacia la landing
**Archivo**: `src/components/eligibility/ChecklistModal.tsx`
- Debajo del CTA "Activar Plan Pro ahora", agregar un enlace secundario: "Ver detalles del proceso de Regularizacion" que lleva a `/españa/regularizacion`.
- El CTA principal de pago ya funciona correctamente (usa `handleCheckout` con auth).

---

## Detalle tecnico

### Regularizacion2026.tsx - remover EligibilityCalculator:

```text
Antes:
  HeroReg2026 → EligibilityModalReg2026
  RequirementsSection
  DeadlineSection → EligibilityModalReg2026
  EligibilityCalculator (duplicado del Home)
  TestimonialsCarousel

Despues:
  HeroReg2026 → EligibilityModalReg2026
  RequirementsSection
  DeadlineSection → EligibilityModalReg2026
  TestimonialsCarousel
```

### EligibilityCalculator.tsx - nuevo CTA secundario:

En la seccion de resultado "eligible", despues del formulario de lead capture o tras mostrar el checklist, agregar:
```tsx
<Button variant="outline" onClick={() => navigate("/españa/regularizacion")} className="w-full gap-2">
  Conoce mas sobre la Regularizacion 2026
  <ArrowRight className="w-4 h-4" />
</Button>
```

### ChecklistModal.tsx - enlace a landing:

Despues del bloque de CTA "Activar Plan Pro ahora":
```tsx
<Button variant="ghost" size="sm" onClick={() => { onClose(); navigate("/españa/regularizacion"); }}>
  Ver detalles del proceso
</Button>
```

---

## Archivos impactados

| Archivo | Cambio |
|---------|--------|
| `RegistrationModal.tsx` | Eliminar archivo |
| `Regularizacion2026.tsx` | Remover EligibilityCalculator de la pagina |
| `EligibilityCalculator.tsx` | Agregar CTA secundario hacia landing |
| `ChecklistModal.tsx` | Agregar enlace secundario hacia landing |

## Archivos que NO cambian

- `QualificationSuccess.tsx` - ya usa AuthModal + create-checkout correctamente
- `EligibilityModalReg2026.tsx` - flujo de 2 preguntas funciona bien
- `create-checkout/index.ts` - edge function de suscripcion funciona correctamente
- `ChecklistModal.tsx` CTA principal - ya llama handleCheckout con auth

