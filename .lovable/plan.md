

# Plan: Fix Route Limits, Plan Management, Checkout Errors & Document View Consistency

## Summary

Four bugs to fix: (1) free users can bypass route limit, (2) admin "Plan" button not visible for some users, (3) checkout crashes with circular JSON error, (4) document views inconsistent between users.

---

## Issue 1: Free User Can Add More Than 1 Route

**Root Cause:** The `canAddRoute` check in `useRoutes.tsx` relies on `totalRoutesCreated` fetched from `onboarding_submissions.total_routes_created`. If this counter was never properly incremented (missing DB trigger or the counter is 0 despite having routes), the client-side guard fails. There is no server-side enforcement.

**Fix (two parts):**

**A. Add a DB trigger** (migration) to auto-increment `total_routes_created` on `user_active_routes` INSERT:
```sql
CREATE OR REPLACE FUNCTION increment_total_routes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE onboarding_submissions
  SET total_routes_created = total_routes_created + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_increment_routes
AFTER INSERT ON user_active_routes
FOR EACH ROW
EXECUTE FUNCTION increment_total_routes();
```

**B. Fix the client-side fallback** in `useRoutes.tsx`: when `totalRoutesCreated` is 0 but `activeRoutes.length > 0`, use `activeRoutes.length` as the real count. Change `canAddRoute` logic:
```typescript
const canAddRoute = useMemo(() => {
  if (!user) return false;
  if (isPremium) {
    return activeRoutes.length < maxRoutes;
  } else {
    // Use the higher of totalRoutesCreated or activeRoutes.length
    const effectiveCount = Math.max(totalRoutesCreated, activeRoutes.length);
    return effectiveCount < 1;
  }
}, [user, isPremium, activeRoutes.length, maxRoutes, totalRoutesCreated]);
```

Also update `slotExhausted`:
```typescript
const slotExhausted = useMemo(() => {
  const effectiveCount = Math.max(totalRoutesCreated, activeRoutes.length);
  return !isPremium && effectiveCount >= 1;
}, [isPremium, totalRoutesCreated, activeRoutes.length]);
```

**C. Data fix migration:** Sync existing users' `total_routes_created` with their actual route count:
```sql
UPDATE onboarding_submissions os
SET total_routes_created = (
  SELECT COUNT(*) FROM user_active_routes uar WHERE uar.user_id = os.user_id
)
WHERE os.user_id IS NOT NULL;
```

---

## Issue 2: Admin Cannot See "Plan" Button for Some Users

**Root Cause:** The "Plan" button in `AdminUsersTab.tsx` only renders when `user.user_id` is truthy (line 450). Users showing as "Lead" have `user_id = null` in `onboarding_submissions`, so the button is hidden.

The user luisk20@gmail.com likely has a registered auth account but their `onboarding_submissions.user_id` was never linked. This is a data issue, not a code issue -- the button correctly only shows for registered users.

**Fix:** No code change needed for the button visibility logic (it's correct to only manage plans for registered users). However, we should make the button more visible by also showing a "Tipo" indicator:
- If `user_id` exists: show "Plan" button (already works)
- Verify the user is actually registered. If luisk20@gmail.com has `user_id` set, then the button should appear. If it shows as "Lead", the `user_id` column is null.

**Action:** Verify in the admin panel that luisk20@gmail.com has `user_id` set. If not, the user needs to log in to link their account. No code change needed.

---

## Issue 3: Circular Structure Error on Checkout

**Root Cause:** In `Dashboard.tsx`, multiple places call `handleCheckout` directly as a button onClick handler:
```tsx
<Button onClick={handleCheckout} disabled={isCheckoutLoading}>
```

This passes the `MouseEvent` object as the first argument to `handleCheckout(referralCode?: string)`. Inside `handleCheckout`, it then does:
```typescript
body: JSON.stringify({
  returnUrl: window.location.origin,
  ...(referralCode ? { referralCode } : {}),
})
```

Since `referralCode` is actually a MouseEvent (truthy), it spreads the entire MouseEvent into the JSON body. `JSON.stringify` fails because MouseEvent contains circular references (HTMLButtonElement -> React fiber -> stateNode -> back to element).

**Fix in `Dashboard.tsx`:** Wrap all `handleCheckout` calls in arrow functions:
```tsx
// Before (6+ places in Dashboard.tsx)
<Button onClick={handleCheckout}>

// After
<Button onClick={() => handleCheckout()}>
```

All affected locations in `renderContent()`:
- Line 364 (life-in-spain upsell)
- Line 381 (business upsell)
- Line 399 (appointment upsell)
- Line 414 (simulator upsell)

---

## Issue 4: Different Document Views Between Users

**Root Cause:** The document section in `Dashboard.tsx` (line 432-450) uses two completely different components:

- If user has reg2026/arraigos route -> shows `DocumentVault` (new component with categories: Identidad, Residencia, Antecedentes)
- Otherwise -> shows `DocumentsSection` (old component with generic documents grid)

The admin (l@albus.com.co) in "Pro" test mode may have a different route type than luisk20@gmail.com, resulting in different views.

Additionally, the `DocumentVault` component gates access with `isPremium` but does NOT use `planFeatures.hasDocuments` -- it uses the raw `isPremium` boolean. For free users, it should show the PremiumFeatureModal.

**Fix:** Update the documents case in Dashboard.tsx to use `planFeatures.hasDocuments` for gating:
```typescript
case "documents":
  if (!planFeatures.hasDocuments) {
    // Show upsell for document access
    return (
      <div className="text-center py-16 space-y-4">
        <FolderLock className="w-12 h-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-semibold">Boveda de Documentos</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Organiza y valida tus documentos. Disponible para usuarios Pro y Premium.
        </p>
        <Button onClick={() => handleCheckout()}>
          Mejorar mi plan
        </Button>
      </div>
    );
  }
  // Show DocumentVault for reg2026/arraigos, DocumentsSection otherwise
  if (activeRouteType) {
    return <DocumentVault routeType={activeRouteType} isPremium={isPremium} />;
  }
  return <DocumentsSection ... />;
```

This ensures both users see the same gating behavior, and the correct vault component is shown based on their route type.

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add trigger for `total_routes_created` increment + sync existing data |
| `src/hooks/useRoutes.tsx` | Fix `canAddRoute` and `slotExhausted` to use `Math.max(totalRoutesCreated, activeRoutes.length)` |
| `src/pages/Dashboard.tsx` | Wrap all `handleCheckout` in arrow functions; add `planFeatures.hasDocuments` gate for documents section |

