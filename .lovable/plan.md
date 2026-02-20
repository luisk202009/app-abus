

# Plan: G05 - Security Audit, SEO, Performance & Production Readiness

## Summary

Final production hardening pass: fix RLS security warnings, upgrade the 404 page, add proper OG tags, create an admin system status tab, add an admin manual route, and apply CSS transitions for smooth view changes.

---

## 1. Database Migration: Fix Overly Permissive RLS Policies

The Supabase linter flagged 3 `WITH CHECK (true)` policies. These need tightening:

### a) `onboarding_submissions` - "Allow anonymous inserts"
This is intentional (anonymous lead capture from onboarding flow). **Leave as-is** but document the rationale.

### b) `referrals` - "Allow authenticated insert referrals"
Currently `WITH CHECK (true)` allows any authenticated user to insert any referral. Tighten to only allow inserts via service role (the checkout function). Change to:
```sql
DROP POLICY "Allow authenticated insert referrals" ON public.referrals;
-- No replacement needed: inserts happen via service_role in the edge function
```

### c) Leaked password protection
This is a Supabase dashboard setting, not a code change. We will note it for the admin to enable manually.

---

## 2. Modify: `index.html` - OpenGraph & SEO Tags

Update OG tags with Albus-specific branding:
- `og:title`: "Albus - Tu Regularizacion 2026 en Espana"
- `og:description`: "Analizamos tu perfil legal, generamos tu hoja de ruta migratoria y automatizamos tu burocracia."
- `og:image`: Use the existing `/isotipo-albus.png` as a production image (or reference the published URL)
- `og:url`: `https://app-abus.lovable.app`
- Remove references to `lovable.dev` default OG images
- Update `twitter:site` from `@Lovable` to `@AlbusApp` (or remove)

---

## 3. Modify: `src/pages/NotFound.tsx` - Custom 404 Page

Redesign with Albus B&W aesthetic:
- Albus isotipo logo at the top
- "404" in large bold text
- Spanish text: "Pagina no encontrada"
- Two buttons: "Volver al Dashboard" and "Ir al Inicio"
- Clean white background with border card, matching dashboard style

---

## 4. New file: `src/components/admin/AdminSystemStatus.tsx`

A "System Status" card for the admin panel:
- Mock health indicators for: Supabase API, Stripe API, Edge Functions, Storage
- Each shows a green/red dot with "Operativo" / "Error"
- Uses `fetch` to ping Supabase health endpoint and Stripe (mock for Stripe)
- Displays last check timestamp
- "Verificar Ahora" button to re-run checks

---

## 5. New file: `src/pages/AdminManual.tsx`

Protected route `/admin/manual` with admin-only access:
- Three sections in accordion format:
  1. **Como asignar Partners**: Step-by-step guide (go to Admin > Users tab, select partner from dropdown)
  2. **Como validar recompensas de referidos**: Guide to update referral status in the referrals table
  3. **Contactos de soporte tecnico**: List of key emails and resources
- Same admin auth check as `/admin` page

---

## 6. Modify: `src/App.tsx` - Add AdminManual Route

Add route: `<Route path="/admin/manual" element={<AdminManual />} />`

---

## 7. Modify: `src/pages/Admin.tsx` - Add System Status & Manual Link

- Add the `AdminSystemStatus` component above the tabs
- Add a "Manual de Operacion" link button in the header that navigates to `/admin/manual`

---

## 8. Modify: `src/components/admin/AdminUsersTab.tsx` - Mask Sensitive Data

- Mask emails: show first 3 chars + "***" + domain (e.g., `joh***@gmail.com`)
- Add a "Mostrar" toggle button per row to reveal full email (admin convenience)
- This prevents accidental exposure in screen shares or screenshots

---

## 9. Add CSS Transitions for View Changes

Modify `src/pages/Dashboard.tsx`:
- Wrap `renderContent()` output in a container with CSS fade transition
- Use a simple `animate-in fade-in` class from tailwindcss-animate (already installed)
- Apply `key={activeNavItem}` to trigger re-render animation on section change

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/AdminSystemStatus.tsx` | System health indicator for admin panel |
| `src/pages/AdminManual.tsx` | Protected admin operations manual |

## Files to Modify

| File | Change |
|------|--------|
| `index.html` | Update OG tags with Albus branding, remove Lovable defaults |
| `src/pages/NotFound.tsx` | Redesign 404 page with Albus aesthetic |
| `src/App.tsx` | Add `/admin/manual` route |
| `src/pages/Admin.tsx` | Add SystemStatus card + manual link |
| `src/components/admin/AdminUsersTab.tsx` | Mask emails in user table |
| `src/pages/Dashboard.tsx` | Add fade transitions on section changes |

## Database Migration Required

Remove the overly permissive `Allow authenticated insert referrals` policy on the `referrals` table.

---

## Technical Details

### Email Masking Function

```typescript
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}
```

### System Status Health Check

```typescript
const checkSupabase = async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    return res.ok;
  } catch { return false; }
};
```

### 404 Page Design

```
+----------------------------------+
|        [Albus Isotipo]           |
|             404                  |
|    Pagina no encontrada          |
|                                  |
|  [Volver al Dashboard]  [Inicio] |
+----------------------------------+
```

### OG Tags (Final)

```html
<meta property="og:title" content="Albus - Tu Regularizacion 2026 en Espana" />
<meta property="og:description" content="Analizamos tu perfil legal, generamos tu hoja de ruta migratoria y automatizamos tu burocracia." />
<meta property="og:image" content="https://app-abus.lovable.app/isotipo-albus.png" />
<meta property="og:url" content="https://app-abus.lovable.app" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary" />
```

### Dashboard Fade Transition

```tsx
<div key={activeNavItem} className="animate-in fade-in duration-300">
  {renderContent()}
</div>
```

### Admin Manual Note for Leaked Password Protection

The admin manual will include a note:
> "Habilita la proteccion de contrasenas filtradas en Supabase Dashboard > Authentication > Settings > Password Security"

---

## Implementation Order

1. Database migration (remove permissive referrals INSERT policy)
2. `index.html` - OG tags
3. `src/pages/NotFound.tsx` - Custom 404
4. `src/components/admin/AdminSystemStatus.tsx` - System status
5. `src/pages/AdminManual.tsx` - Operations manual
6. `src/App.tsx` - Add manual route
7. `src/pages/Admin.tsx` - Wire system status + manual link
8. `src/components/admin/AdminUsersTab.tsx` - Email masking
9. `src/pages/Dashboard.tsx` - Fade transitions

