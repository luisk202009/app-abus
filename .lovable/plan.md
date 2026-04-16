

## Plan: Añadir "Regularización" al menú de navegación con badge "Nuevo"

### Contexto
El usuario quiere agregar un enlace destacado a "Regularización" en el Navbar principal (landing pública), con un distintivo visual que indique que es un servicio nuevo. Debe llevar a `/españa/regularizacion`.

### Archivo a modificar

**`src/components/Navbar.tsx`**

1. **Desktop nav** (sección `hidden md:flex items-center gap-8`): Agregar entre `DestinosDropdown` y `Recursos` un nuevo enlace:
   - Texto: "Regularización"
   - Link a `/españa/regularizacion` usando `<a href>` (consistente con los demás enlaces)
   - Badge "Nuevo" al lado: pequeño pill con fondo `bg-primary text-primary-foreground` (negro/blanco según el tema fintech) o un acento dorado para reforzar el distintivo premium. Usaré el componente `Badge` de shadcn con clase personalizada, tamaño compacto (`text-[10px] px-1.5 py-0.5`), con un punto pulsante opcional (`animate-pulse`) para llamar la atención.

2. **Mobile menu** (sección `md:hidden py-6 border-t`): Replicar el mismo enlace + badge con estilo apropiado para móvil (font-size base, padding consistente con los demás items), cerrando el menú al hacer clic.

### Detalles visuales del badge
- Estilo: pill redondeado, alto contraste con el aesthetic B&W minimalista de Albus.
- Texto: "Nuevo" en mayúscula inicial, font-medium, tracking ligero.
- Posición: inline al lado del texto del enlace, con `gap-2`.
- Opcional: pequeño punto (•) animado con `animate-pulse` en color de acento para reforzar la novedad sin romper la estética minimalista.

### Lo que NO cambia
- `DestinosDropdown`, `Recursos`, `Precios` y los CTAs (`Entrar`, `Empezar Gratis`) permanecen intactos.
- El Dashboard, Sidebar interno y rutas existentes no se tocan.
- No se requiere migración, ni cambios en routing (la ruta `/españa/regularizacion` ya existe en `App.tsx`).

