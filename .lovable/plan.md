

# Fix: Checkout after registration + Dashboard email verification UX

## Root Cause

**ChecklistModal "Inicia sesión" error**: After signup, `handleAuthSuccess` calls `handleCheckout()` from `useSubscription`. But `useSubscription` reads `user` from React state which hasn't re-rendered yet — so `user` is still `null` and the guard at line 64 fires the toast "Necesitas iniciar sesión para suscribirte."

**No "verify email" experience on Dashboard**: After signup + payment, the user lands on Dashboard but there's no blurred-background modal prompting them to verify their email before proceeding.

## Changes

### 1. `src/components/eligibility/ChecklistModal.tsx` (lines 101-106)
**Fix stale `user` in `handleAuthSuccess`**: Instead of calling `handleCheckout()` (which reads stale React state), call the Stripe checkout API directly using `supabase.auth.getSession()` — same pattern as `QualificationSuccess.initiateCheckout`.

Replace `handleAuthSuccess`:
```typescript
const handleAuthSuccess = async () => {
  setShowAuthModal(false);
  onClose();
  // Call checkout directly since useSubscription.user is stale after signup
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    
    localStorage.setItem("onboarding_source", "reg2026");
    
    const response = await fetch(
      "https://uidwcgxbybjpbteowrnh.supabase.co/functions/v1/create-checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ returnUrl: window.location.origin }),
      }
    );
    const data = await response.json();
    if (data.url) window.open(data.url, "_blank");
  } catch (error) {
    console.error("Checkout error:", error);
  }
};
```

Add import for `supabase` from `@/integrations/supabase/client`.

### 2. `src/pages/Dashboard.tsx` — Add email verification reminder modal
**New behavior**: If `user` exists but `user.email_confirmed_at` is null/undefined, show a blurred overlay with a modal prompting the user to check their email. The dashboard content is visible but blurred behind it.

Add state + check:
```typescript
const isEmailUnconfirmed = user && !user.email_confirmed_at;
```

Add UI at the end of the return JSX:
- A full-screen overlay with `backdrop-blur-sm bg-background/60`
- A centered card with:
  - Mail icon
  - "Verifica tu cuenta" title
  - "Revisa tu email en {user.email} y haz clic en el enlace de confirmación"
  - "Reenviar email" button (calls `supabase.auth.resend`)
  - The dashboard content remains visible but blurred behind

### 3. `src/pages/Dashboard.tsx` — Wrap main content in blur container
Wrap the main dashboard content div with a conditional `filter: blur(4px)` class when `isEmailUnconfirmed` is true, making the content visible but not interactive.

---

## Expected Flow After Fix

```text
Home → Calculator → Checklist → "Activar Plan Pro"
  → AuthModal (signup) → Stripe Checkout opens in new tab
  → User pays → redirected to /success → /dashboard
  → Dashboard shows blurred + "Verifica tu cuenta" modal
  → User confirms email → refreshes → Dashboard loads normally with auto-activated route
```

## Files impacted

| File | Change |
|------|--------|
| `ChecklistModal.tsx` | Direct API call for checkout instead of stale hook |
| `Dashboard.tsx` | Email verification overlay with blur |

