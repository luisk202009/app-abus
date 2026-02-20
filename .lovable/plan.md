
# Plan: E04 - Conversion Tracking, Exit Intent y Lead Recovery

## Resumen

Implementar un sistema de tracking de eventos de conversion, un popup de exit intent para recuperar visitantes, filtro de "Pagos Pendientes" en el admin panel, y la infraestructura base para Meta Pixel y Google Tag Manager.

---

## 1. Servicio de Tracking de Eventos

### Nuevo archivo: `src/lib/trackingService.ts`

Servicio centralizado que registra eventos de conversion tanto en consola como en la tabla `onboarding_submissions`.

**Eventos soportados:**

| Evento | Trigger | Accion |
|--------|---------|--------|
| `lead_captured` | Usuario envia formulario del checklist (E02) | Log + tag CRM |
| `onboarding_started` | Usuario selecciona ruta en AnalysisModal | Log + tag CRM |
| `payment_success` | Usuario completa checkout Stripe | Log (ya gestionado por webhook) |
| `track_eligibility_check` | Usuario usa la calculadora | Log + evento analytics |

**Funciones:**
- `trackEvent(eventName, metadata)`: Log a consola + dispara evento `window.dataLayer.push` para GTM y `fbq` para Meta Pixel
- Integracion con los custom events de GTM/Meta

### Modificaciones en componentes existentes:
- `EligibilityCalculator.tsx`: Llamar `trackEvent('track_eligibility_check')` en `handleCheck` y `trackEvent('lead_captured')` en `handleLeadSubmit`
- `AnalysisModal.tsx`: Llamar `trackEvent('onboarding_started')` cuando el usuario selecciona una ruta

---

## 2. Exit Intent Modal

### Nuevo archivo: `src/components/ExitIntentModal.tsx`

Modal que se activa cuando:
- **Desktop**: El mouse sale de la ventana del navegador (`mouseleave` en `document.documentElement`)
- **Mobile**: Despues de 30 segundos de inactividad (sin scroll, click o touch)

**Restricciones:**
- Solo se muestra 1 vez por sesion (controlado via `sessionStorage`)
- Solo en paginas de pricing/regularizacion

**Contenido del modal:**
- Titulo: "No pierdas tu oportunidad!"
- Texto: "El proceso de Regularizacion 2026 es limitado. Tienes dudas? Descarga nuestra guia gratuita antes de irte."
- CTA Primario: Boton que hace scroll al EligibilityCalculator (lead magnet de E02)
- CTA Secundario: "No gracias, ya volveré"

### Integracion:
- Agregar en `Index.tsx`, `Regularizacion2026.tsx` y `PricingSection` parent pages

---

## 3. Filtro "Pagos Pendientes" en Admin

### Modificar: `src/components/admin/AdminUsersTab.tsx`

Agregar un sistema de filtros con tabs o botones encima de la tabla de usuarios:

**Filtros:**
- "Todos" (default)
- "Pagos Pendientes": Usuarios que tienen `crm_tag` relacionado a una ruta (contiene `regularizacion` o `arraigo`) pero `subscription_status` = `free` o `null`, y tienen `user_id` (se registraron pero no pagaron)
- "Leads sin registro": Usuarios sin `user_id`

**Boton "Recordatorio Manual":**
- Aparece en cada fila del filtro "Pagos Pendientes"
- Al hacer clic: muestra un toast de confirmacion "Recordatorio enviado a [email]" (simulado)
- Registra el evento en consola via `trackEvent('reminder_sent', { email })`

---

## 4. Analytics Infrastructure

### Nuevo archivo: `src/components/AnalyticsProvider.tsx`

Componente wrapper que inyecta los scripts de Meta Pixel y GTM como placeholders.

**Contenido:**
- Script de GTM con placeholder `YOUR_GTM_ID`
- Script de Meta Pixel con placeholder `YOUR_PIXEL_ID`
- Helper global `window.trackAlbusEvent` que unifica `dataLayer.push` + `fbq('trackCustom', ...)`
- Se renderiza como children wrapper (no visual)

### Integracion en `src/App.tsx`:
- Envolver el contenido principal con `<AnalyticsProvider>`

---

## Archivos a Crear

| Archivo | Proposito |
|---------|-----------|
| `src/lib/trackingService.ts` | Servicio centralizado de tracking |
| `src/components/ExitIntentModal.tsx` | Popup de exit intent |
| `src/components/AnalyticsProvider.tsx` | Wrapper con GTM + Meta Pixel |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/eligibility/EligibilityCalculator.tsx` | Agregar trackEvent en handleCheck y handleLeadSubmit |
| `src/components/AnalysisModal.tsx` | Agregar trackEvent en seleccion de ruta |
| `src/components/admin/AdminUsersTab.tsx` | Agregar filtros y boton "Recordatorio Manual" |
| `src/App.tsx` | Envolver con AnalyticsProvider |
| `src/pages/Index.tsx` | Agregar ExitIntentModal |
| `src/pages/espana/Regularizacion2026.tsx` | Agregar ExitIntentModal |

---

## Detalles Tecnicos

### trackingService.ts

```typescript
export const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
  // Console log for development
  console.log(`[Albus Track] ${eventName}`, metadata);

  // GTM dataLayer
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event: eventName, ...metadata });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, metadata);
  }
};
```

### ExitIntentModal - Logica de deteccion

```typescript
// Desktop: mouseleave en documentElement
document.documentElement.addEventListener('mouseleave', showModal);

// Mobile: 30s inactivity timer, reset on scroll/touch/click
let inactivityTimer = setTimeout(showModal, 30000);
['scroll', 'touchstart', 'click'].forEach(evt => 
  window.addEventListener(evt, () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showModal, 30000);
  })
);
```

Control con `sessionStorage.getItem('exit_intent_shown')`.

### AdminUsersTab - Filtro "Pagos Pendientes"

Logica de filtrado:
```typescript
const pendingPayments = users.filter(u => 
  u.user_id && 
  u.crm_tag && 
  (u.crm_tag.includes('regularizacion') || u.crm_tag.includes('arraigo') || u.crm_tag.includes('lead_checklist')) &&
  (!u.subscription_status || u.subscription_status === 'free')
);
```

---

## Orden de Implementacion

1. `trackingService.ts` - Servicio base de tracking
2. `AnalyticsProvider.tsx` - Wrapper GTM + Meta Pixel
3. `ExitIntentModal.tsx` - Popup de exit intent
4. Modificar `EligibilityCalculator.tsx` y `AnalysisModal.tsx` con tracking
5. Modificar `AdminUsersTab.tsx` con filtros y recordatorio
6. Integrar AnalyticsProvider en App.tsx y ExitIntentModal en paginas
