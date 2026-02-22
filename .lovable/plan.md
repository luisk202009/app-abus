

# Fix: Perfil no se actualiza + Pago muestra pantalla en blanco

## Problema 1: Perfil no se actualiza

**Causa raiz:** El `upsert` en `ProfileSection.tsx` puede fallar si el usuario no tiene una fila previa en `onboarding_submissions`. Ademas, el manejo de errores no muestra detalles utiles para diagnosticar.

**Solucion:**
- Mejorar `handleSave` en `ProfileSection.tsx` para usar una estrategia de "intentar UPDATE, si no hay filas afectadas entonces INSERT"
- Agregar log detallado del error (`error.message`, `error.code`, `error.details`) para diagnostico
- Mostrar el mensaje de error real en el toast

**Archivo:** `src/components/dashboard/ProfileSection.tsx` (lineas 72-94)

---

## Problema 2: Pago lleva a pantalla en blanco

**Causa raiz:** La consola muestra claramente: `"Stripe Checkout is not able to run in an iFrame. Please redirect to Checkout at the top level."` El codigo actual usa `window.location.href = data.url` (linea 102 de `useSubscription.tsx`), que intenta navegar dentro del iframe del preview, pero Stripe lo bloquea.

**Solucion:**
- Cambiar `window.location.href` por `window.open(data.url, '_blank')` para abrir Stripe Checkout en una nueva pestana
- Esto funciona tanto en el preview de Lovable como en produccion

**Archivo:** `src/hooks/useSubscription.tsx` (linea 102)

Tambien hay otro lugar que hace checkout en `src/components/dashboard/DocumentVault.tsx` que usa el mismo patron y necesita el mismo fix.

---

## Resumen de cambios

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/ProfileSection.tsx` | Mejorar upsert con fallback INSERT y log de errores detallado |
| `src/hooks/useSubscription.tsx` | Cambiar `window.location.href` a `window.open(url, '_blank')` |
| `src/components/dashboard/DocumentVault.tsx` | Mismo fix de checkout que useSubscription |

