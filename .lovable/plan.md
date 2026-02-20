

# Plan: G04 - Refer-a-Friend Viral System

## Summary

Build a referral system with a new `referral_codes` table, a referral dashboard in the sidebar, social sharing (WhatsApp/Telegram/Facebook), Stripe coupon integration for 5 EUR discount, and a "Refer and Win" banner on the main dashboard.

---

## 1. Database Migration: `referral_codes` table

Create a new table to store referral codes and track referrals:

```sql
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id uuid,
  referred_name text,
  status text NOT NULL DEFAULT 'pendiente',
  reward_amount numeric NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS for referral_codes
CREATE POLICY "Users can view their own code" ON public.referral_codes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own code" ON public.referral_codes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all codes" ON public.referral_codes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- RLS for referrals
CREATE POLICY "Users can view their referrals" ON public.referrals
  FOR SELECT TO authenticated USING (
    referrer_id IN (SELECT id FROM public.referral_codes WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can manage all referrals" ON public.referrals
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Allow system inserts (via service role) for referral tracking
CREATE POLICY "Allow insert via service role" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (true);

-- Validation trigger for referral status
CREATE OR REPLACE FUNCTION public.validate_referral_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pendiente', 'completado') THEN
    RAISE EXCEPTION 'Invalid status. Must be pendiente or completado';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_referral_status_trigger
  BEFORE INSERT OR UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.validate_referral_status();
```

---

## 2. New file: `src/hooks/useReferral.tsx`

Custom hook that:
- Fetches or generates a 6-character referral code for the current user (stored in `referral_codes`)
- Fetches referral stats: count of invited friends, total rewards, list of referrals with status
- Code generation: random 6-char alphanumeric uppercase string
- Only generates codes for Pro/Premium users

---

## 3. New file: `src/components/dashboard/ReferralDashboard.tsx`

Main referral section with:

### Section A: Your Code
- Large, copyable referral code display with a "Copiar" button
- Generates the code on first visit (if Pro/Premium)

### Section B: Stats Cards
- "Amigos Invitados" - count of referrals
- "Dinero Ahorrado/Ganado" - sum of `reward_amount` where status = 'completado'

### Section C: Sharing Buttons
- **WhatsApp**: Pre-filled message with code and signup URL
- **Telegram**: Share link with message
- **Facebook**: Share dialog with URL
- Message template: "Hola! Estoy usando Albus para mi Regularizacion 2026. Si usas mi codigo [CODE], tendras 5 EUR de descuento en tu plan Pro. Registrate aqui: [URL]"

### Section D: Referral Status Table
- Columns: Nombre (masked), Fecha, Estado (Pendiente/Completado badge)
- Empty state: "Comparte tu codigo para empezar a ganar recompensas"

---

## 4. New file: `src/components/dashboard/ReferralBanner.tsx`

A small gold-accented banner for the main dashboard roadmap view:
- Text: "Invita amigos y gana 5 EUR por cada uno"
- Icon: `Gift`
- Button: "Ver mi codigo" -> navigates to referrals section
- Dismissible (localStorage flag)

---

## 5. Modify: `src/components/dashboard/DashboardSidebar.tsx`

Add nav item after "Negocios":

```typescript
{ id: "referrals", label: "Referidos", icon: <Gift className="w-5 h-5" /> }
```

---

## 6. Modify: `src/pages/Dashboard.tsx`

- Add case `"referrals"` in `renderContent()` -> render `ReferralDashboard` (gated for Pro/Premium)
- Add `ReferralBanner` component in the roadmap view (between UrgencyBanner and header)
- Import `Gift` icon, `ReferralDashboard`, `ReferralBanner`

---

## 7. Modify: `supabase/functions/create-checkout/index.ts`

Add referral code validation logic:
- Accept optional `referralCode` in request body
- If provided, look up the code in `referral_codes` table (using service role client)
- If valid, create or retrieve a Stripe coupon for 5 EUR off and apply it to the checkout session via `discounts`
- After successful session creation, insert a record into `referrals` table with status 'pendiente'

---

## 8. Modify: `src/hooks/useSubscription.tsx`

- Update `handleCheckout` to accept optional `referralCode` parameter
- Pass `referralCode` in the request body to `create-checkout`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useReferral.tsx` | Referral code management and stats |
| `src/components/dashboard/ReferralDashboard.tsx` | Full referral section UI |
| `src/components/dashboard/ReferralBanner.tsx` | Gold CTA banner for dashboard |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/DashboardSidebar.tsx` | Add "Referidos" nav item |
| `src/pages/Dashboard.tsx` | Add referrals route + banner |
| `supabase/functions/create-checkout/index.ts` | Referral code discount logic |
| `src/hooks/useSubscription.tsx` | Pass referral code to checkout |
| `supabase/config.toml` | Already has verify_jwt=false for create-checkout |

## Database Migration Required

New `referral_codes` and `referrals` tables with RLS policies and validation trigger.

---

## Technical Details

### Referral Code Generation

```typescript
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### Stripe Coupon for Referral Discount

In `create-checkout`, when a valid referral code is provided:

```typescript
// Create or find a 5 EUR off coupon
let coupon;
const coupons = await stripe.coupons.list({ limit: 100 });
coupon = coupons.data.find(c => c.name === 'REFERRAL_5EUR');
if (!coupon) {
  coupon = await stripe.coupons.create({
    name: 'REFERRAL_5EUR',
    amount_off: 500, // 5 EUR in cents
    currency: 'eur',
    duration: 'once',
  });
}

// Apply to checkout session
session = await stripe.checkout.sessions.create({
  ...sessionParams,
  discounts: [{ coupon: coupon.id }],
});
```

### WhatsApp Share URL

```typescript
const message = `Hola! Estoy usando Albus para mi Regularizacion 2026. Si usas mi codigo ${code}, tendras 5€ de descuento en tu plan Pro. Registrate aqui: ${window.location.origin}`;
const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
```

### Aesthetic

- Gold accents: `border-amber-500/30 bg-amber-50/5 text-amber-600`
- Icons: `Gift` (nav + banner), `Users` (stats), `Copy` (code), `Share2` (sharing)
- Code display: large monospace font in a bordered card
- Stats cards: same pattern as existing dashboard cards

### Admin Notification

When a referral status changes to 'completado', the admin can see all referrals via the existing admin panel pattern. A future enhancement could add an admin tab for referral management, but for now the `referrals` table is queryable by admin via RLS.

---

## Implementation Order

1. Database migration (referral_codes + referrals tables)
2. `src/hooks/useReferral.tsx` - Hook
3. `src/components/dashboard/ReferralDashboard.tsx` - Main UI
4. `src/components/dashboard/ReferralBanner.tsx` - CTA banner
5. `src/components/dashboard/DashboardSidebar.tsx` - Nav item
6. `supabase/functions/create-checkout/index.ts` - Discount logic
7. `src/hooks/useSubscription.tsx` - Pass referral code
8. `src/pages/Dashboard.tsx` - Wire everything together

