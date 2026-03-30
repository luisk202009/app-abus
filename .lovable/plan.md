
Objetivo: corregir de forma definitiva el favicon e iconos PWA para que no vuelva a aparecer el de Lovable por caché, formato incorrecto o rutas antiguas.

## Diagnóstico
He revisado el proyecto y veo 3 causas probables:

1. `public/isotipo-albus.png` se está usando en todos lados:
   - favicon en `index.html`
   - `apple-touch-icon`
   - iconos del manifest PWA en `vite.config.ts`
   - icono/badge de notificaciones en `src/hooks/usePushNotifications.tsx`

2. El proyecto sigue publicado en:
   - `https://app-abus.lovable.app`
   Esto significa que buscadores, PWA y previews públicas pueden seguir cacheando assets antiguos de ese dominio.

3. La causa más fuerte: el PNG probablemente quedó inválido porque antes se reemplazó con un JPEG renombrado a `.png`. Eso suele hacer que navegador, PWA o service worker ignoren el archivo nuevo y mantengan el icono viejo.

## Solución definitiva que implementaría

### 1. Crear iconos reales y separados
Usar el archivo que subiste para generar assets válidos, no renombrados:
- `public/favicon.png`
- `public/apple-touch-icon.png`
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- opcional: `public/favicon.ico`

Importante:
- cada archivo debe tener el formato real correcto
- no reutilizar un JPEG con extensión `.png`

### 2. Cambiar todas las referencias del proyecto
Actualizar `index.html` para que deje de depender de `isotipo-albus.png` como icono principal:
- `<link rel="icon" href="/favicon.png?v=3" type="image/png" />`
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />`

Y también versionar:
- `og:image`
- `twitter:image`

Ejemplo:
- `https://www.albus.com.co/Logo_Albus_redes.jpeg?v=3`

Esto fuerza a navegador, bots y redes a pedir una URL nueva.

### 3. Corregir el manifest PWA
En `vite.config.ts` actualizar:
- `includeAssets`
- `manifest.icons`

Para que usen:
- `/pwa-192x192.png?v=3`
- `/pwa-512x512.png?v=3`

Así el icono instalable de la PWA deja de apuntar al asset conflictivo actual.

### 4. Corregir iconos de notificaciones
En `src/hooks/usePushNotifications.tsx` reemplazar:
- `icon: "/isotipo-albus.png"`
- `badge: "/isotipo-albus.png"`

por un asset limpio y versionado, por ejemplo:
- `"/pwa-192x192.png?v=3"`

### 5. Mantener o retirar `isotipo-albus.png`
Hay dos opciones seguras:
- conservarlo solo para uso interno si realmente lo usan algunos componentes visuales
- pero dejar de usarlo para favicon, PWA y notificaciones

No lo usaría más como fuente maestra de iconos públicos.

### 6. Publicación y limpieza de caché
Para que se vea “definitivamente” corregido, después de implementar hay que:
1. publicar la app de nuevo
2. abrir el sitio en ventana incógnita
3. desinstalar la PWA anterior si ya estaba instalada
4. volver a instalarla
5. pedir reindexación si el problema visible es en buscadores

## Archivos a tocar
- `index.html`
- `vite.config.ts`
- `src/hooks/usePushNotifications.tsx`
- `public/`:
  - `favicon.png`
  - `apple-touch-icon.png`
  - `pwa-192x192.png`
  - `pwa-512x512.png`
  - opcional `favicon.ico`

## Resultado esperado
Después de eso:
- el navegador mostrará el favicon correcto
- la PWA instalada usará el icono correcto
- las notificaciones usarán la marca correcta
- buscadores y redes dejarán de arrastrar assets viejos al cambiar las URLs con versión

## Nota importante
Aunque el código quede bien, si Google o el navegador ya cachearon el asset viejo, puede tardar un poco en reflejarse. La parte “definitiva” del fix es:
- usar archivos válidos
- no renombrar formatos
- versionar URLs
- volver a publicar

## Siguiente implementación concreta
Si apruebas, haría exactamente esto:
1. reemplazar todos los iconos públicos por PNGs reales generados desde tu logo
2. versionar las URLs de favicon, apple-touch-icon, OG y PWA
3. actualizar el manifest PWA y notificaciones
4. dejar el proyecto sin depender de `isotipo-albus.png` para branding público
