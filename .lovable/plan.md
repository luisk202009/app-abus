
# Plan: G07 — Fix Stripe Errors & Implement Dynamic Plan Management

## Summary

Five changes: fix checkout URL and error handling, add feature-gate columns to the `plans` table, update the Admin Plans editor, make feature gating dynamic from the DB, and make the Pricing Page data-driven.

---

## Change 1: Fix Checkout URL & Error Handling

**Problem A:** `useSubscription.tsx` sends `returnUrl: window.location.origin` (e.g., `https://app-abus.lovable.app`). The edge function then builds `success_url: ${returnUrl}/success`. This works. However, the `allowedOrigins` list in `create-checkout` does NOT include the preview URL, causing failures during dev/testing.

**Fix:** Add the preview origin to the `allowedOrigins` array. Also add a fallback: if no `returnUrl` is provided, use `req.headers.get("origin")`.

**Problem B:** When `handleCheckout` errors, passing the raw error object to toast can cause "circular structure" issues.

**Fix:** Ensure only `error.message` (string) is ever passed to the toast description. Already mostly correct but add a safety wrapper.

**Files:**
- `supabase/functions/create-checkout/index.ts` — add preview URL to allowedOrigins, add origin fallback
- `src/hooks/useSubscription.tsx` — ensure error.message safety

---

## Change 2: Add Feature-Gate Columns to Plans Table (Migration)

The `plans` table already has `max_routes` (integer). We need to add boolean feature columns.

**Migration:**
```sql
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS has_documents boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_fiscal_simulator boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_appointments boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_life_in_spain boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_business boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_referrals boolean NOT NULL DEFAULT false;
```

Then seed existing plans with appropriate values using the insert tool (UPDATE).

---

## Change 3: Update Admin Plans Tab

**File:** `src/components/admin/AdminPlansTab.tsx`

Add to the Plan interface and form:
- `max_routes` (number input)
- Six boolean toggles: `has_documents`, `has_fiscal_simulator`, `has_appointments`, `has_life_in_spain`, `has_business`, `has_referrals`

Display `max_routes` and feature toggles in the table and edit dialog.

---

## Change 4: Dynamic Feature Gating via useSubscription

**Current:** `useSubscription` returns `isPremium` (boolean) and `maxRoutes` (number). Dashboard checks `isPremium` for every section.

**New approach:** Create a `usePlanFeatures` hook (or extend `useSubscription`) that:
1. Fetches the user's `subscription_status` from `onboarding_submissions`
2. Fetches the matching plan from `plans` table (by slug matching subscription_status)
3. Returns individual feature booleans: `hasDocuments`, `hasFiscalSimulator`, `hasAppointments`, `hasLifeInSpain`, `hasBusiness`, `hasReferrals`, `maxRoutes`

**Files:**
- New: `src/hooks/usePlanFeatures.tsx`
- Update: `src/pages/Dashboard.tsx` — replace `isPremium` checks with specific feature checks
- Update: `src/components/dashboard/DashboardSidebar.tsx` — optionally show lock icons on gated items
- Update: `src/hooks/useRoutes.tsx` — use `maxRoutes` from plan features

---

## Change 5: Data-Driven Pricing Page

**File:** `src/components/PricingSection.tsx`

Replace hardcoded feature lists with data fetched from `plans` table:
- Fetch all active plans on mount
- Render cards dynamically from DB data (name, price_cents, features array, stripe_price_id)
- Mark the "Popular" plan based on slug === "pro"

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add 6 boolean columns to `plans` |
| Data update | Seed existing plans with correct feature flags |
| `supabase/functions/create-checkout/index.ts` | Add preview URL, origin fallback |
| `src/hooks/useSubscription.tsx` | Safe error message handling |
| `src/hooks/usePlanFeatures.tsx` | New hook for dynamic feature gating |
| `src/components/admin/AdminPlansTab.tsx` | Add max_routes input + 6 feature toggles |
| `src/pages/Dashboard.tsx` | Use `usePlanFeatures` for section gating |
| `src/components/PricingSection.tsx` | Fetch plans from DB, render dynamically |

---

## Technical Details

### usePlanFeatures hook
```typescript
export const usePlanFeatures = () => {
  const { subscriptionStatus } = useSubscription();
  const [planFeatures, setPlanFeatures] = useState({
    maxRoutes: 1,
    hasDocuments: false,
    hasFiscalSimulator: false,
    hasAppointments: false,
    hasLifeInSpain: false,
    hasBusiness: false,
    hasReferrals: false,
  });

  useEffect(() => {
    const fetchPlan = async () => {
      const slug = subscriptionStatus === "free" ? "free" : subscriptionStatus;
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (data) {
        setPlanFeatures({
          maxRoutes: data.max_routes,
          hasDocuments: data.has_documents,
          hasFiscalSimulator: data.has_fiscal_simulator,
          hasAppointments: data.has_appointments,
          hasLifeInSpain: data.has_life_in_spain,
          hasBusiness: data.has_business,
          hasReferrals: data.has_referrals,
        });
      }
    };
    fetchPlan();
  }, [subscriptionStatus]);

  return planFeatures;
};
```

### Dashboard gating (before vs after)
```typescript
// Before
case "simulator":
  if (!isPremium) { /* show upsell */ }

// After
case "simulator":
  if (!planFeatures.hasFiscalSimulator) { /* show upsell */ }
```

### Pricing Section (dynamic)
```typescript
const [plans, setPlans] = useState([]);
useEffect(() => {
  supabase.from("plans").select("*").eq("is_active", true)
    .order("price_cents").then(({ data }) => setPlans(data || []));
}, []);
// Render plan cards from `plans` array
```
