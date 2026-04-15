

# Actualizar dominios permitidos en `create-checkout`

## Problema
La función `isAllowedOrigin` no incluye `albus.com.co` ni `www.albus.com.co`, bloqueando pagos desde producción.

## Cambio
En `supabase/functions/create-checkout/index.ts`, líneas 12-20, agregar dos condiciones al return:

```typescript
url.hostname === "albus.com.co" ||
url.hostname === "www.albus.com.co" ||
```

No se toca nada más de la función.

