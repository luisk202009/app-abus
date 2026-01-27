

# Plan: Finalizar Footer Legal y Páginas de Términos/Privacidad

## Resumen de Cambios

Se actualizará el footer y las páginas legales para cumplir con estándares profesionales de SaaS que maneja datos migratorios y pagos via Stripe.

---

## 1. Actualizar Footer (`src/components/Footer.tsx`)

### Cambios:
- **Copyright**: Cambiar a "© 2026 Albus. Desarrollado por Albus LLC."
- **Botón "Empezar ahora"**: Conectar con el modal de análisis (agregar prop `onOpenModal`)
- **Link Cookies**: Crear una sección de cookies en la página de Privacidad y anclar el link
- **Disclaimer**: Mantener el texto actual que ya es correcto

### Código propuesto:

```tsx
interface FooterProps {
  onOpenModal?: () => void;
}

export const Footer = ({ onOpenModal }: FooterProps) => {
  // ... resto del componente

  // Actualizar botón
  <Button onClick={onOpenModal}>
    Empezar ahora
  </Button>

  // Actualizar copyright
  <p>© 2026 Albus. Desarrollado por Albus LLC.</p>

  // Actualizar link de cookies
  <Link to="/privacidad#cookies">Cookies</Link>
}
```

---

## 2. Actualizar Página de Términos (`src/pages/Terms.tsx`)

### Secciones a agregar/expandir:

| Sección | Contenido |
|---------|-----------|
| **Pagos y Stripe** | Procesamiento via Stripe, políticas de reembolso, disputas |
| **Propiedad Intelectual** | Derechos sobre contenido generado |
| **Terminación** | Condiciones para cancelar cuenta |
| **Jurisdicción** | Ley aplicable (España/UE) |
| **Modificaciones** | Derecho a actualizar términos |

### Estructura final:
1. Aceptación de los Términos
2. Descripción del Servicio
3. Cuenta de Usuario
4. Pagos y Suscripciones (expandido con Stripe)
5. Limitación de Responsabilidad
6. Propiedad Intelectual (nuevo)
7. Terminación del Servicio (nuevo)
8. Ley Aplicable (nuevo)
9. Modificaciones (nuevo)
10. Contacto

---

## 3. Actualizar Página de Privacidad (`src/pages/Privacy.tsx`)

### Secciones a agregar/expandir:

| Sección | Contenido |
|---------|-----------|
| **Stripe y pagos** | Datos compartidos con procesador de pagos |
| **Supabase** | Almacenamiento de datos |
| **Derechos GDPR** | Acceso, rectificación, portabilidad, supresión |
| **Retención de datos** | Cuánto tiempo se guardan |
| **Transferencias internacionales** | Cláusulas contractuales estándar |
| **Cookies (con id="cookies")** | Para anclar link del footer |

### Estructura final:
1. Información que Recopilamos
2. Base Legal del Tratamiento (nuevo - GDPR)
3. Uso de la Información
4. Procesadores de Datos (nuevo - Stripe, Supabase)
5. Almacenamiento y Seguridad
6. Compartir Información
7. Transferencias Internacionales (nuevo)
8. Retención de Datos (nuevo)
9. Tus Derechos (expandido con GDPR)
10. Cookies (con `id="cookies"`)
11. Menores de Edad (nuevo)
12. Cambios en la Política (nuevo)
13. Contacto

---

## 4. Actualizar Index.tsx

### Cambio:
Pasar el `onOpenModal` al componente Footer para activar el botón "Empezar ahora":

```tsx
<Footer onOpenModal={() => setIsModalOpen(true)} />
```

---

## 5. Rutas (sin cambios necesarios)

Las rutas actuales (`/terminos`, `/privacidad`) ya están en español y son coherentes con el idioma de la aplicación. Se mantendrán así.

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/Footer.tsx` | Agregar prop, actualizar copyright y links |
| `src/pages/Terms.tsx` | Expandir con secciones SaaS/Stripe |
| `src/pages/Privacy.tsx` | Expandir con GDPR/Stripe/Cookies |
| `src/pages/Index.tsx` | Pasar prop al Footer |

---

## Sección Técnica

### Navegación con ancla (Cookies)
Para que el link de Cookies funcione correctamente:

```tsx
// En Footer.tsx
<Link to="/privacidad#cookies">Cookies</Link>

// En Privacy.tsx
<section id="cookies" className="mb-8">
  <h2>6. Cookies</h2>
  ...
</section>
```

### Auto-scroll al ancla
React Router no hace scroll automático a anclas. Se puede añadir un hook simple:

```tsx
// En Privacy.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Privacy = () => {
  const { hash } = useLocation();
  
  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);
  
  // ... resto
};
```

