

# Reemplazar icono de marca en favicon, PWA y OG image

## Problema
El archivo `isotipo-albus.png` actual en `/public` sigue mostrando un icono antiguo o de Lovable. El usuario ha subido el logo oficial de Albus (`Logo_Albus_redes.jpeg`) para reemplazarlo en todas las ubicaciones.

## Cambios

### 1. Copiar el logo subido a `public/`
- Copiar `user-uploads://Logo_Albus_redes.jpeg` → `public/Logo_Albus_redes.jpeg`
- Este archivo servirá como imagen OG/Twitter (formato JPEG, alta calidad para redes sociales)

### 2. Reemplazar `isotipo-albus.png`
- Copiar `user-uploads://Logo_Albus_redes.jpeg` → `public/isotipo-albus.png` (sobrescribir el actual)
- Esto actualiza automáticamente: favicon, apple-touch-icon, iconos PWA y OG image sin cambiar ninguna referencia en el código

### 3. `index.html` — Actualizar OG image a JPEG dedicado
- Línea 20: `og:image` → `https://www.albus.com.co/Logo_Albus_redes.jpeg`
- Línea 23: `twitter:image` → `https://www.albus.com.co/Logo_Albus_redes.jpeg`
- Esto da mejor calidad en previsualizaciones de redes sociales (imagen más grande y nítida)

### 4. `vite.config.ts` — Agregar el JPEG a assets incluidos
- Línea 21: agregar `"Logo_Albus_redes.jpeg"` al array `includeAssets`

## Resultado
- **Favicon del navegador**: Logo Albus ✓
- **Icono PWA (instalación)**: Logo Albus ✓
- **Apple touch icon**: Logo Albus ✓
- **Open Graph / Twitter Cards**: Logo Albus en alta calidad ✓

