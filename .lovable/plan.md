
# Unificacion de DocumentVault, Diagnostico Stripe y Estabilizacion

## Resumen

Tres cambios concretos: (1) eliminar `DocumentsSection` del flujo de Dashboard y usar siempre `DocumentVault`, (2) agregar logs de diagnostico en Stripe y mostrar errores crudos en el toast, (3) sin cambios de diseno.

---

## 1. Unificar DocumentVault (eliminar DocumentsSection del Dashboard)

**Archivo:** `src/pages/Dashboard.tsx`

**Problema:** Cuando el usuario no tiene ruta activa, el case `"documents"` renderiza `DocumentsSection` en lugar de `DocumentVault`. Esto rompe la coherencia visual.

**Solucion:**

- Eliminar el import de `DocumentsSection`
- En el case `"documents"` (lineas 424-441), siempre renderizar `DocumentVault`
- Si no hay `activeRouteType`, usar `"regularizacion2026"` como tipo por defecto para mostrar la estructura de categorias (Identidad, Residencia, etc.)
- El gating de premium ya funciona dentro de `DocumentVault` via `isPremium={false}`

```typescript
case "documents":
  return (
    <DocumentVault
      routeType={activeRouteType || "regularizacion2026"}
      isPremium={planFeatures.hasDocuments ? isPremium : false}
    />
  );
```

El archivo `src/components/dashboard/DocumentsSection.tsx` no se elimina fisicamente (puede usarse en otros contextos futuros), solo se deja de importar y usar en Dashboard.

---

## 2. Diagnostico de Stripe

### 2a. Log de prefijo de llave en Edge Function

**Archivo:** `supabase/functions/create-checkout/index.ts`

- Ya existe un log en linea 71 que muestra los primeros 7 caracteres cuando el prefijo es invalido
- Agregar un log adicional **antes** de la validacion (linea 62) que siempre se ejecute:

```typescript
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
console.log(`[create-checkout] DEBUG: Prefijo de la llave secreta -> ${stripeKey.substring(0, 7)}...`);
```

### 2b. Mostrar error crudo en toast del frontend

**Archivo:** `src/hooks/useSubscription.tsx`

- En el catch del checkout (linea 104-113), cambiar el toast para mostrar el `error.message` crudo que viene del servidor:

```typescript
} catch (error: any) {
  const rawMessage = error?.message || "Error desconocido";
  console.error("Error en checkout:", rawMessage, error);
  toast({
    variant: "destructive",
    title: "Error de pago",
    description: rawMessage,
  });
}
```

Esto permitira ver si Stripe rechaza por "Authentication Error", "Invalid Parameters", o el mensaje que devuelve la Edge Function.

---

## 3. Sin cambios de diseno

No se modifican colores, margenes, fuentes, Sidebar ni Header. La coherencia de badges de Admin y select de nacionalidad se mantiene intacta.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Dashboard.tsx` | Eliminar import de DocumentsSection; usar DocumentVault siempre en case "documents" con fallback a "regularizacion2026" |
| `supabase/functions/create-checkout/index.ts` | Agregar log de diagnostico del prefijo de la key (siempre) |
| `src/hooks/useSubscription.tsx` | Mostrar error.message crudo en el toast de checkout |
