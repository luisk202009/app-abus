

# Marca Blanca: Eliminar rastros de Lovable y URLs por defecto

## Resumen
Reemplazar todas las referencias a `app-abus.lovable.app` con el dominio personalizado `albus.com.co`, eliminar `favicon.ico` por defecto, y limpiar metadatos SEO. No existe `manifest.json` independiente (se genera vía VitePWA en `vite.config.ts`), y el badge de Lovable ya está oculto.

## Cambios

### 1. Eliminar `public/favicon.ico`
- Borrar el archivo — el navegador lo solicita por defecto y podría mostrar un icono genérico/Lovable.
- El favicon correcto ya está configurado como `/isotipo-albus.png` en `index.html`.

### 2. `index.html` — Actualizar metadatos y URLs
- Cambiar `lang="en"` → `lang="es"`
- Agregar `<link rel="canonical" href="https://www.albus.com.co" />`
- `og:url` → `https://www.albus.com.co`
- `og:image` → `https://www.albus.com.co/isotipo-albus.png`
- `twitter:image` → `https://www.albus.com.co/isotipo-albus.png`

### 3. `public/robots.txt` — Agregar Sitemap
- Agregar línea: `Sitemap: https://www.albus.com.co/sitemap.xml`

### 4. `supabase/functions/create-checkout/index.ts` (línea 32)
- Cambiar fallback de `https://app-abus.lovable.app` → `https://www.albus.com.co`
- Mantener `.lovable.app` y `.lovableproject.com` en la lista de orígenes permitidos (necesario para preview/desarrollo)

### 5. `supabase/functions/create-one-time-payment/index.ts` (línea 113)
- Cambiar fallback de `https://app-abus.lovable.app` → `https://www.albus.com.co`

### 6. `supabase/functions/send-welcome-email/index.ts` (línea 109)
- Cambiar enlace del dashboard de `https://app-abus.lovable.app/dashboard` → `https://www.albus.com.co/dashboard`

### 7. `vite.config.ts` — Sin cambios necesarios
- El `lovable-tagger` solo se activa en desarrollo (`mode === "development"`), no afecta producción ni SEO.
- El manifest PWA ya usa datos correctos de Albus.

## Archivos impactados

| Archivo | Acción |
|---------|--------|
| `public/favicon.ico` | Eliminar |
| `index.html` | Actualizar lang, canonical, og:url, og:image, twitter:image |
| `public/robots.txt` | Agregar Sitemap |
| `supabase/functions/create-checkout/index.ts` | Actualizar fallback URL |
| `supabase/functions/create-one-time-payment/index.ts` | Actualizar fallback URL |
| `supabase/functions/send-welcome-email/index.ts` | Actualizar enlace dashboard |

