

# Reemplazar isotipo (letra "a") por logo completo

## Resumen

Cambiar la imagen del isotipo (`isotipo-albus.png` - solo la letra "a") por el logo completo (`albus-logo.png` - "albus") en dos contextos: el modal de login y todos los spinners de carga.

## Archivos a modificar

| Archivo | Uso actual | Cambio |
|---------|-----------|--------|
| `src/components/auth/AuthModal.tsx` | Isotipo en modal de login | Cambiar import y referencia a `albus-logo.png` |
| `src/pages/Dashboard.tsx` | Isotipo en spinner "Cargando tu dashboard..." | Cambiar import a `albus-logo.png`, ajustar tamano |
| `src/pages/RouteDetail.tsx` | Isotipo en spinner de carga | Cambiar import a `albus-logo.png` |
| `src/pages/Admin.tsx` | Isotipo en spinner de carga y header | Cambiar import a `albus-logo.png` |
| `src/components/AnalysisModal.tsx` | Posible uso de isotipo en evaluacion | Verificar y cambiar si aplica |

## Archivos que NO se modifican

- `src/components/dashboard/PremiumModal.tsx` - El isotipo ahi es decorativo con corona, se mantiene
- `src/components/dashboard/DocumentsSection.tsx` - Watermark sutil, se mantiene
- `src/pages/NotFound.tsx` - Pagina 404, se mantiene con isotipo
- `src/pages/AdminManual.tsx` - Header admin, se mantiene
- `src/hooks/usePushNotifications.tsx` - Icono de notificaciones push, se mantiene (necesita ser cuadrado)

## Detalle tecnico

En cada archivo afectado:
1. Cambiar el import de `isotipo-albus.png` a `albus-logo.png`
2. Ajustar las clases CSS del `<img>` para que el logo completo se vea bien (el logo completo es horizontal/mas ancho, asi que cambiar de `w-12 h-12` a algo como `h-10 w-auto` para mantener proporcion)

Para el AuthModal especificamente, el logo pasara de ser un cuadrado pequeno a mostrar la palabra "albus" completa, centrada sobre el titulo "Inicia sesion".
