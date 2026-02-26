

# Fix: Precio incorrecto en SlotExhaustedModal

## Problema
`SlotExhaustedModal.tsx` muestra **€6,99/mes** en el texto y botón CTA, pero el checkout real usa `price_1SwlHBGVNlA5jALg4s8gArUM` que corresponde a **€9,99/mes** (Plan Pro definido en `STRIPE_PRICES` y `QualificationSuccess`).

## Cambio

### `src/components/dashboard/SlotExhaustedModal.tsx`
- Línea 38: Cambiar `€6,99/mes` → `€9,99/mes`
- Línea 60: Cambiar `Mejorar a Pro - €6,99/mes` → `Mejorar a Pro - €9,99/mes`

