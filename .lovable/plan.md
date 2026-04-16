

## Plan: Eliminar promesa de "15 días" en página de Regularización 2026

### Contexto
El usuario indica que no se debe garantizar el plazo de "15 días" para el permiso de trabajo, ya que esa promesa puede generar expectativas legales incorrectas. Solo se debe mencionar "permiso de trabajo y permiso de residencia" sin plazos concretos.

### Cambios a realizar

**1. `src/pages/espana/Regularizacion2026.tsx`**
- En el array `requirements`, tarjeta "Resultado": cambiar `"Permiso de trabajo en 15 días hábiles tras presentar la solicitud"` por algo como `"Permiso de trabajo y residencia tras la aprobación de la solicitud"`.

**2. `src/components/espana/HeroReg2026.tsx`**
- En el subtítulo del hero: reemplazar `"Permiso de trabajo en 15 días"` por `"Permiso de trabajo y residencia"` (eliminando la referencia temporal).

**3. `src/components/eligibility/EligibilityModalReg2026.tsx`**
- En el resultado de elegibilidad positivo (`message: "Podrás trabajar legalmente en 15 días tras tu solicitud."`): cambiar por `"Podrás obtener tu permiso de trabajo y residencia legal en España."`.

### Lo que NO cambia
- La estructura, diseño visual ni flujo de la página.
- Los demás requisitos (fecha de entrada, 5 meses de estancia).
- El plazo límite del proceso (30 de junio de 2026), que sí es una fecha oficial del trámite, no una promesa de resultado.
- Otras páginas o componentes que no mencionen esta promesa.

