

# Plan: G06 — Operational Excellence, Manual Plan Management & Usage Limits

## Summary

Four changes: add admin plan management modal, enforce free-tier limit messaging on route buttons, improve checkout error diagnostics, and clean up remaining placeholder text.

---

## Change 1: Manual Plan Management in Admin Users Tab

**File:** `src/components/admin/AdminUsersTab.tsx`

Add a "Gestionar Plan" button to each user row (only for registered users with `user_id`). Clicking opens a Dialog with:
- A Select dropdown for subscription level: `free`, `pro`, `premium`
- A DatePicker for expiration/next billing date (stored as metadata but not currently in the schema -- see note below)
- A "Guardar" button that updates `onboarding_submissions.subscription_status` directly

**Schema note:** There is no `next_billing_date` column on `onboarding_submissions`. We need a migration to add it.

**New migration:**
```sql
ALTER TABLE public.onboarding_submissions
ADD COLUMN IF NOT EXISTS next_billing_date date;
```

**UI flow:**
- Button appears in each user row (visible column or inline)
- Dialog pre-fills with current `subscription_status` and `next_billing_date`
- On save: `supabase.from("onboarding_submissions").update({ subscription_status, next_billing_date }).eq("user_id", userId)`
- Toast confirms success; local state updates immediately

---

## Change 2: Free Tier Limit Enforcement Messaging

The limit logic already exists in `useRoutes.tsx` (`canAddRoute`, `slotExhausted`). The modals (`RouteLimitModal`, `SlotExhaustedModal`) already trigger correctly.

**Enhancement needed in two places:**

**A. `RouteExplorer.tsx` (dashboard route explorer):**
- When `!canAddRoute && slotExhausted`, show a Banner/Alert above the grid:
  "Limite de ruta gratuita alcanzado. Mejora a Pro para gestionar multiples procesos."
- Disable the "Iniciar esta ruta" button for non-active routes and change label to "Limite alcanzado"

**B. `RouteDetailModal` (Explorar page detail modal):**
- Pass `canAddRoute` and `slotExhausted` as props
- When limits are hit, disable the start button and show inline message

**File:** `src/components/routes/RouteDetailModal.tsx` -- add props for limit state
**File:** `src/pages/Explorar.tsx` -- pass the new props

---

## Change 3: Checkout Error Diagnostics

**File:** `supabase/functions/create-checkout/index.ts`

In the catch block (line 207-216):
- Log `error.raw` for Stripe-specific errors: `console.log("Stripe Error Details:", error?.raw || error)`
- Return a more descriptive error message based on error type:
  - If `error.type === "StripeInvalidRequestError"` -> "Error de configuracion de Stripe: ID de precio invalido o inexistente"
  - Otherwise -> current generic message

**File:** `src/hooks/useSubscription.tsx`

In `handleCheckout` (line 93-97):
- Before throwing, log the full response: `console.error("Checkout server response:", data)`
- Show `data.error` in the toast description instead of the generic message

---

## Change 4: UI Placeholder Cleanup

Search results show "Proximamente" in these files (none are DocumentVault/FiscalSimulator/BusinessOnboarding -- those are clean):

| File | Text | Action |
|------|------|--------|
| `src/components/ResourcesSection.tsx` | `tag: "Proximamente"` on 4 items | Keep as-is -- these are marketing landing page items for features not yet built. They are NOT toasts, they are legitimate "coming soon" labels for unreleased content sections. |
| `src/components/WaitlistModal.tsx` | `"Proximamente: {country.name}"` | Keep -- this is intentional for countries not yet supported |
| `src/pages/Recursos.tsx` | `"Proximamente"` badge | Keep -- same as ResourcesSection |
| `src/components/dashboard/ResourcesSection.tsx` | `"Proximamente mas recursos"` | Keep -- empty state for resources section when no resources exist |

**Result:** No "disponible pronto" toasts remain anywhere. The "Proximamente" labels found are all legitimate content labels, not placeholder toasts blocking functionality. No cleanup needed.

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add `next_billing_date` column to `onboarding_submissions` |
| `src/components/admin/AdminUsersTab.tsx` | Add "Gestionar Plan" button + Dialog with plan selector and date picker |
| `src/components/dashboard/RouteExplorer.tsx` | Add limit-reached banner and disable buttons with message |
| `src/components/routes/RouteDetailModal.tsx` | Accept limit props and disable start button when exhausted |
| `src/pages/Explorar.tsx` | Pass `canAddRoute`/`slotExhausted` to `RouteDetailModal` |
| `supabase/functions/create-checkout/index.ts` | Add `error.raw` logging and descriptive error responses |
| `src/hooks/useSubscription.tsx` | Log full server response and show specific error in toast |

## Files NOT Changing

| File | Why |
|------|-----|
| `src/components/dashboard/DocumentVault.tsx` | No "disponible pronto" found |
| `src/components/dashboard/FiscalSimulator.tsx` | No placeholder toasts found |
| `src/components/dashboard/BusinessOnboardingSection.tsx` | No placeholder toasts found |
| `src/components/dashboard/DocumentsSection.tsx` | Already fixed in previous sprint |
| `src/components/admin/AdminSystemStatus.tsx` | Already fixed in previous sprint |

