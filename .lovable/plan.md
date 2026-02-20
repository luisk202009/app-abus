
# Plan: E03 - Trust Architecture, Social Proof y Red de Expertos

## Resumen

Crear componentes de confianza y prueba social para aumentar la conversion: seccion de expertos legales, carrusel de testimonios, barra de confianza contextual y roadmap visual de 4 pasos. Todo en estetica Albus B&W.

---

## 1. Expert Network Preview

### Nuevo archivo: `src/components/ExpertNetworkPreview.tsx`

Grid de 3 tarjetas de abogados placeholder con foto, nombre y especializacion.

**Datos:**

| Nombre | Especializacion |
|--------|----------------|
| Dra. Laura Martinez | Experta en Regularizacion 2026 |
| Dr. Carlos Fernandez | Experto en Arraigo Social y Laboral |
| Dra. Sofia Navarro | Experta en Derecho Migratorio |

**Estructura de cada tarjeta:**
- Avatar circular con iniciales (usando componente Avatar existente)
- Nombre en negrita
- Especializacion en texto muted
- Badge "Verificado por Albus" con icono ShieldCheck

**Diseno:** Fondo `bg-secondary/30`, tarjetas con borde `border-border`, badge en negro con texto blanco.

---

## 2. Testimonials Carousel

### Nuevo archivo: `src/components/TestimonialsCarousel.tsx`

Carrusel horizontal usando Embla Carousel (ya instalado) con 3 testimonios.

**Testimonios:**

| Autor | Cita |
|-------|------|
| Carlos M. | "La calculadora de plazos me dio la tranquilidad que necesitaba. Ya tengo mis penales listos." |
| Elena R. | "El plan Pro de 9.99 euros es la mejor inversion. La boveda organiza todo por ti." |
| Miguel A. | "Saber que un abogado revisa mis documentos antes de enviarlos me quita un peso de encima." |

**Estructura:** Card con comillas decorativas, texto de la cita, nombre del autor, y estrellas (5/5). Navegacion con puntos indicadores.

---

## 3. Trust Bar Contextual

### Nuevo archivo: `src/components/TrustBadgesBar.tsx`

Barra de confianza con 3 badges para paginas de regularizacion y arraigos.

**Badges:**

| Icono | Texto |
|-------|-------|
| Shield | Proteccion de Datos Nivel Bancario |
| RefreshCw | Contenido Actualizado Enero 2026 |
| Clock | Respuesta en menos de 24h |

**Diseno:** Similar al TrustBar existente - fondo `bg-secondary`, items con icono + texto en cards con borde sutil.

---

## 4. Visual Process Roadmap

### Nuevo archivo: `src/components/ProcessRoadmap.tsx`

Infografia de 4 pasos con conexiones visuales y tags de plan.

**Pasos:**

| Paso | Titulo | Plan | Descripcion |
|------|--------|------|-------------|
| 1 | Valida tu perfil | Gratis | Analiza tu elegibilidad en minutos |
| 2 | Organiza tus documentos | Pro | Boveda segura con validacion automatica |
| 3 | Revision por experto | Premium | Un abogado revisa todo antes de enviar |
| 4 | Presentacion oficial | Abril 2026 | Envia tu solicitud con confianza |

**Diseno:** Timeline vertical en mobile, horizontal en desktop. Cada paso con numero, icono, titulo, badge de plan (outline para Gratis, filled para Pro/Premium), y linea conectora.

---

## 5. Integracion en Paginas

### `src/pages/Index.tsx`

Insertar en este orden:
1. HeroSection
2. TrustBar (existente)
3. HowItWorksSection
4. EligibilityCalculator
5. **ProcessRoadmap** (nuevo)
6. **ExpertNetworkPreview** (nuevo)
7. **TestimonialsCarousel** (nuevo)
8. FeaturesSection
9. ResourcesSection
10. PricingSection

### `src/pages/espana/Regularizacion2026.tsx`

Insertar `TrustBadgesBar` despues del hero (antes de Requirements):
```
<HeroReg2026 />
<TrustBadgesBar />
<section>Requirements...</section>
```

Insertar `TestimonialsCarousel` antes del footer.

### `src/pages/espana/Arraigos.tsx`

Insertar `TrustBadgesBar` despues del hero (antes de Pillars):
```
<HeroArraigos />
<TrustBadgesBar />
<section>Pillars...</section>
```

---

## Archivos a Crear

| Archivo | Proposito |
|---------|-----------|
| `src/components/ExpertNetworkPreview.tsx` | Grid de expertos legales |
| `src/components/TestimonialsCarousel.tsx` | Carrusel de testimonios |
| `src/components/TrustBadgesBar.tsx` | Barra de badges de confianza |
| `src/components/ProcessRoadmap.tsx` | Roadmap visual de 4 pasos |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Agregar ProcessRoadmap, ExpertNetworkPreview, TestimonialsCarousel |
| `src/pages/espana/Regularizacion2026.tsx` | Agregar TrustBadgesBar y TestimonialsCarousel |
| `src/pages/espana/Arraigos.tsx` | Agregar TrustBadgesBar |

---

## Detalles Tecnicos

### ExpertNetworkPreview

Usa componentes `Avatar` y `Badge` existentes de Shadcn. Las fotos son placeholders con iniciales (AvatarFallback). El badge "Verificado por Albus" usa `ShieldCheck` de Lucide.

### TestimonialsCarousel

Usa `embla-carousel-react` (ya instalado). Autoplay con intervalo de 5 segundos. Navegacion con dots indicators. Cada slide es un Card con Quote icon decorativo.

### ProcessRoadmap

Grid responsive: `grid-cols-1 md:grid-cols-4`. Lineas conectoras con pseudo-elementos CSS o divs con bordes. Badges de plan usan el componente Badge existente con variantes `outline` y `default`.

### TrustBadgesBar

Componente simple con flex wrap, similar al patron del TrustBar existente pero con contenido de confianza/compliance.

---

## Orden de Implementacion

1. TrustBadgesBar (componente mas simple)
2. ExpertNetworkPreview (grid de expertos)
3. TestimonialsCarousel (carrusel con Embla)
4. ProcessRoadmap (infografia de 4 pasos)
5. Integrar en Index.tsx
6. Integrar en Regularizacion2026.tsx y Arraigos.tsx
