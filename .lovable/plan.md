

# Plan: G03 - Progressive Web App (PWA) with Push Notifications

## Summary

Transform Albus into an installable PWA using `vite-plugin-pwa`, add mobile-optimized features (camera-first uploads, pull-to-refresh, offline vault access), implement a push notification engine, and polish responsive tables for small screens.

---

## 1. Install `vite-plugin-pwa`

Add `vite-plugin-pwa` as a dev dependency. This handles service worker generation, manifest injection, and offline caching automatically.

---

## 2. Configure PWA in `vite.config.ts`

- Add `VitePWA()` plugin with:
  - `registerType: 'autoUpdate'`
  - `manifest` object with Albus branding (name, short_name, theme_color: `#000000`, background_color: `#ffffff`)
  - Icons: reference existing `/isotipo-albus.png` + generate 192x192 and 512x512 variants in `public/`
  - `workbox.runtimeCaching` rules to cache `/dashboard` and `/dashboard/documentos` routes (NetworkFirst strategy)
  - `workbox.navigateFallbackDenylist: [/^\/~oauth/]` to protect OAuth flow
  - Cache Supabase storage URLs (CacheFirst) for offline vault access

---

## 3. Add PWA meta tags to `index.html`

- `<meta name="theme-color" content="#000000">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black">`
- `<link rel="apple-touch-icon" href="/isotipo-albus.png">`

---

## 4. Create PWA icon assets

Create two placeholder icon files in `public/`:
- `public/pwa-192x192.png` (copy from isotipo-albus.png or reference it)
- `public/pwa-512x512.png`

For simplicity, reference the existing `/isotipo-albus.png` in the manifest for both sizes.

---

## 5. New file: `src/components/dashboard/InstallAppBanner.tsx`

A smart banner that:
- Listens for the `beforeinstallprompt` event
- Shows after the second visit (tracked via `localStorage` counter)
- Displays: "Instala Albus en tu dispositivo" with Install and Dismiss buttons
- B&W Albus aesthetic with a `Smartphone` icon
- Only visible on mobile (via `useIsMobile` hook)

---

## 6. New file: `src/hooks/usePushNotifications.tsx`

Push notification hook:
- Checks for browser Push API support (`'Notification' in window`)
- `requestPermission()`: Asks for notification permission
- `sendLocalNotification(title, body)`: Creates a browser notification
- `subscribeToChanges()`: Sets up Supabase real-time subscriptions on:
  - `user_documents` changes (status updates) -> "Tu expediente ha sido revisado!"
  - `document_comments` inserts -> "Nuevo comentario de tu equipo legal"
- Deadline countdown: Calculates days until June 30, 2026 and sends a local notification if <= 30 days

---

## 7. New file: `src/components/dashboard/PullToRefresh.tsx`

A wrapper component for dashboard views:
- Detects touch pull-down gesture at top of scroll container
- Shows a spinner indicator during refresh
- Calls a `onRefresh` callback to reload data
- Works by tracking `touchstart`/`touchmove`/`touchend` events
- Only active on mobile (via `useIsMobile`)

---

## 8. Modify: `src/components/route-detail/StepFileUpload.tsx`

Mobile scanner enhancement:
- Add `capture="environment"` attribute to the file input when on mobile
- Add a secondary button "Escanear Documento" with `Camera` icon that opens camera directly
- Detect mobile via `useIsMobile` hook
- On mobile, the primary button becomes "Escanear Documento" with camera icon instead of upload icon

---

## 9. Modify: `src/pages/Dashboard.tsx`

- Import and render `InstallAppBanner` at the top of the dashboard
- Import and use `PullToRefresh` wrapper around dashboard content
- Import `usePushNotifications` and call `subscribeToChanges()` on mount
- Add notification permission request button in the notification area

---

## 10. Modify: `src/components/dashboard/BusinessOnboardingSection.tsx`

Mobile table responsiveness:
- Wrap tables in `overflow-x-auto` containers (likely already done, but verify)
- Add `min-w-0` and `text-xs sm:text-sm` responsive text sizing
- For the Cuota Cero table and Tax Obligations table: stack on mobile using card layout instead of table when `useIsMobile` is true

---

## 11. Modify: `src/components/dashboard/FiscalSimulator.tsx`

Mobile polish:
- Ensure result cards use `grid-cols-1 sm:grid-cols-2` instead of fixed columns
- Add `text-xs sm:text-sm` for table cells

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/InstallAppBanner.tsx` | PWA install prompt for mobile users |
| `src/hooks/usePushNotifications.tsx` | Push notification engine with real-time Supabase subscriptions |
| `src/components/dashboard/PullToRefresh.tsx` | Pull-to-refresh gesture wrapper for mobile |

## Files to Modify

| File | Change |
|------|--------|
| `vite.config.ts` | Add VitePWA plugin with manifest, caching, icons |
| `index.html` | Add PWA meta tags (theme-color, apple-mobile-web-app) |
| `src/pages/Dashboard.tsx` | Add InstallAppBanner, PullToRefresh, push notification init |
| `src/components/route-detail/StepFileUpload.tsx` | Add mobile camera capture and scanner UI |
| `src/components/dashboard/BusinessOnboardingSection.tsx` | Mobile-responsive tables |
| `src/components/dashboard/FiscalSimulator.tsx` | Mobile-responsive grid/tables |

## No Database Migration Required

Push subscriptions use browser APIs. Real-time uses existing Supabase tables.

---

## Technical Details

### vite-plugin-pwa Configuration

```typescript
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['isotipo-albus.png', 'albus-logo.png'],
  manifest: {
    name: 'Albus - Tu asistente de migracion',
    short_name: 'Albus',
    description: 'Simplificamos tu migracion a Espana',
    theme_color: '#000000',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/dashboard',
    icons: [
      { src: '/isotipo-albus.png', sizes: '192x192', type: 'image/png' },
      { src: '/isotipo-albus.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    navigateFallbackDenylist: [/^\/~oauth/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/,
        handler: 'CacheFirst',
        options: { cacheName: 'vault-documents', expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 } },
      },
    ],
  },
})
```

### Install Banner Logic

```typescript
// Track visits in localStorage
const visitCount = parseInt(localStorage.getItem('albus_visits') || '0');
localStorage.setItem('albus_visits', String(visitCount + 1));
const showBanner = visitCount >= 2 && deferredPrompt !== null;
```

### Push Notification Triggers

```typescript
// Real-time subscription on user_documents
supabase
  .channel('doc-status-changes')
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'user_documents',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    if (payload.new.status !== payload.old.status) {
      sendLocalNotification('Albus', 'Tu expediente ha sido revisado!');
    }
  })
  .subscribe();
```

### Mobile Camera Capture

```html
<!-- On mobile, add capture attribute -->
<input type="file" accept="image/*,.pdf" capture="environment" />
```

### Pull to Refresh

```typescript
// Touch gesture detection
const startY = useRef(0);
const onTouchStart = (e) => { startY.current = e.touches[0].clientY; };
const onTouchMove = (e) => {
  const diff = e.touches[0].clientY - startY.current;
  if (diff > 80 && scrollTop === 0) triggerRefresh();
};
```

### Offline Vault Access

The Workbox `CacheFirst` strategy for Supabase storage URLs means previously viewed document files (PDFs, images) will be served from cache when offline. The document metadata is cached via the default navigation caching.

### Aesthetic

- Install banner: `bg-background border border-border rounded-2xl` with `Smartphone` icon
- Pull-to-refresh spinner: Albus isotipo rotating animation
- Scanner button: `Camera` icon with "Escanear Documento" label, full-width on mobile
- All existing B&W palette maintained

---

## Implementation Order

1. `vite.config.ts` + `index.html` - PWA core setup
2. `src/components/dashboard/InstallAppBanner.tsx` - Install prompt
3. `src/hooks/usePushNotifications.tsx` - Notification engine
4. `src/components/dashboard/PullToRefresh.tsx` - Pull to refresh
5. `src/components/route-detail/StepFileUpload.tsx` - Mobile scanner
6. `src/components/dashboard/BusinessOnboardingSection.tsx` + `FiscalSimulator.tsx` - Mobile polish
7. `src/pages/Dashboard.tsx` - Wire everything together

