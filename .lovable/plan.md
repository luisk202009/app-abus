
Objetivo: reemplazar de forma definitiva el icono que Google, navegadores y la PWA siguen arrastrando del estado anterior.

## Hallazgo clave
Revisé el código actual y ya apunta a assets de Albus:
- `index.html` usa `/favicon.png?v=3` y `/apple-touch-icon.png?v=3`
- `vite.config.ts` usa iconos PWA de Albus
- `usePushNotifications.tsx` ya no apunta a Lovable

Eso significa que el problema restante no es solo “el HTML”, sino una combinación de:
1. caché de Google y del navegador
2. ausencia de un `favicon.ico` real en la raíz
3. caché del service worker/PWA
4. posible arrastre del dominio publicado `app-abus.lovable.app`

## Plan de corrección definitiva

### 1. Añadir un `favicon.ico` real
Crear un `public/favicon.ico` válido desde el logo de Albus.
Motivo:
- muchos navegadores y crawlers siguen consultando `/favicon.ico`
- hoy ese archivo no existe, así que pueden reutilizar un icono viejo cacheado

### 2. Publicar una familia de iconos limpia y estable
Generar desde el logo oficial estos archivos reales:
- `public/favicon.ico`
- `public/favicon-48x48.png`
- `public/favicon-32x32.png`
- `public/apple-touch-icon.png`
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`

Importante:
- formato real correcto
- no JPEG renombrado a PNG
- tamaños cuadrados y nítidos

### 3. Hacer explícitas todas las referencias en `index.html`
Actualizar el head para que no dependa de una sola referencia:
- `rel="icon"` a PNG 48x48
- `rel="shortcut icon"` a `/favicon.ico`
- `rel="apple-touch-icon"` a su archivo propio
- mantener OG/Twitter con la imagen de Albus

Así Google y navegadores tienen rutas claras y compatibles.

### 4. Endurecer el manifest PWA
En `vite.config.ts`:
- mantener `includeAssets` con todos los iconos nuevos
- usar iconos del manifest sin depender de assets heredados
- preferir rutas directas de archivos finales de Albus
- añadir `id`/`scope` consistentes si hace falta para que la instalación se refresque correctamente

### 5. Limpiar el arrastre del service worker
Agregar en `src/main.tsx` una protección para:
- evitar registros problemáticos en preview/iframe
- desregistrar service workers antiguos cuando corresponda en entornos de preview
- reducir que la PWA siga mostrando iconos viejos por caché local

### 6. Unificar también notificaciones
Actualizar `src/hooks/usePushNotifications.tsx` para usar el nuevo icono final de PWA y no una ruta heredada si todavía queda alguna inconsistencia.

## Archivos a tocar
- `index.html`
- `vite.config.ts`
- `src/main.tsx`
- `src/hooks/usePushNotifications.tsx`
- `public/favicon.ico`
- `public/favicon-48x48.png`
- `public/favicon-32x32.png`
- `public/apple-touch-icon.png`
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`

## Pasos fuera del código que sí son necesarios
Después de implementar:
1. publicar el frontend con **Update**
2. abrir `www.albus.com.co` en incógnito
3. borrar datos del sitio si el navegador sigue mostrando el anterior
4. desinstalar y reinstalar la PWA
5. solicitar reindexación en Google Search Console para la home

## Resultado esperado
- navegador: favicon correcto de Albus
- Google: nuevo favicon tras recrawl
- PWA instalada: icono correcto
- notificaciones: icono correcto
- menos riesgo de que reaparezca el de Lovable por caché o rutas antiguas

## Detalle técnico importante
La corrección “definitiva” no depende de un solo cambio. Requiere estas tres capas juntas:
- archivos de icono válidos
- referencias explícitas y compatibles
- limpieza de caché/publicación/reindexación

Si solo se cambia una de las tres, Google o la PWA pueden seguir enseñando el icono anterior.
