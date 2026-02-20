
# Plan: G05-FIX — Global Security Fix, RLS Hardening & Edge Function Auth

## Summary

Four targeted fixes addressing the exact security issues identified: (1) remove the `OR (user_id IS NULL)` RLS exposure on `onboarding_submissions`, (2) harden the `create-checkout` edge function to use `getClaims()`, (3) fix the internal server-to-server call from `stripe-webhook` → `send-welcome-email` that broke when JWT auth was added, and (4) add input validation to `send-welcome-email`. The document upload system is already fully functional — no changes needed there.

---

## Issue 1: Critical RLS Fix — `onboarding_submissions` SELECT Leak

### Current Broken Policy
```sql
"Users can view their own submissions"
USING: (auth.uid() = user_id) OR (user_id IS NULL)
```

The `OR (user_id IS NULL)` clause is a data leak. Any authenticated user can read ALL anonymous onboarding records (leads that haven't linked to an account yet), which contain: email, full name, nationality, income, savings, and professional profile.

### Fix
Drop and recreate as two separate, scoped policies:
- **Policy A** (authenticated users, their own linked record): `USING (auth.uid() = user_id)`
- **Policy B** (anonymous submissions, only visible to the session that created them — i.e., `user_id IS NULL` rows are only readable by unauthenticated queries, which RLS would handle via `anon` role): Since the onboarding flow uses `anon` insert but doesn't need to SELECT back, **we simply drop the `user_id IS NULL` clause entirely**.

```sql
DROP POLICY "Users can view their own submissions" ON public.onboarding_submissions;

CREATE POLICY "Users can view their own submissions"
ON public.onboarding_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

This is safe because:
- Admins see all via the `is_admin()` policy (already exists)
- Partners see assigned users via `is_assigned_to_partner()` (already exists)
- Anonymous leads don't need to SELECT their own record (they just insert and move on)
- Authenticated users see only their own linked record

---

## Issue 2: Edge Function — `create-checkout` Auth Upgrade

### Current State
`create-checkout` uses the older `getUser(token)` pattern (network call to auth server) instead of the faster, local `getClaims(token)` pattern used in the other functions.

### Fix
Update `create-checkout/index.ts` to use `getClaims()` for consistency and security:

```typescript
// Replace getUser() with getClaims()
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  { global: { headers: { Authorization: authHeader } } }
);

const token = authHeader.replace("Bearer ", "");
const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
if (claimsError || !claimsData?.claims) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}
const userId = claimsData.claims.sub;
const userEmail = claimsData.claims.email;
```

---

## Issue 3: `stripe-webhook` → `send-welcome-email` Internal Call (CRITICAL BUG)

### The Problem
When a payment completes, `stripe-webhook` calls `send-welcome-email` with:
```typescript
Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
```

But `send-welcome-email` now requires a **valid user JWT** via `getClaims()`. The anon key is a static API key — NOT a user JWT. This means **welcome emails are silently failing** for every new paid subscriber.

### Fix Option: Use Service Role Key as the Bearer for internal server-to-server calls
The Supabase service role JWT **is** a valid JWT that `getClaims()` can verify. We switch the internal call to use `SUPABASE_SERVICE_ROLE_KEY`:

```typescript
Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
```

This is a secure server-to-server call (both functions run in Supabase's secure environment), so using the service role key here is appropriate.

---

## Issue 4: `send-welcome-email` — Input Validation

### Current State
The function accepts `name`, `email`, `visaType` without validation. An attacker with a valid token could submit malformed data.

### Fix
Add validation before processing:
```typescript
// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email)) {
  return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
}

// Validate name
if (!name || name.trim().length === 0 || name.length > 200) {
  return new Response(JSON.stringify({ error: "Invalid name" }), { status: 400 });
}

// Validate visaType whitelist
const validVisaTypes = ['remote_worker', 'student', 'entrepreneur', 'non_lucrative'];
if (visaType && !validVisaTypes.includes(visaType)) {
  return new Response(JSON.stringify({ error: "Invalid visa type" }), { status: 400 });
}
```

---

## Issue 5: Document Upload — Status Assessment

After reviewing `useDocumentVault.tsx` and `DocumentStatusCard.tsx` in detail:

**The document upload system is already fully functional.** It:
- Uploads files to the `user-documents` Supabase Storage bucket
- Sets status to `"analyzing"` (blue — "En revisión") immediately on upload
- Runs mock AI validation and updates to `"valid"` or `"error"`
- Has a proper 5MB file size limit
- Only accepts PDF, JPG, PNG formats
- The storage bucket has correct RLS policies scoped by user ID

No changes needed here. The task's mention of a "disponible pronto" toast refers to an older version that has already been replaced.

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Drop + recreate `"Users can view their own submissions"` policy removing `OR (user_id IS NULL)` |
| `supabase/functions/create-checkout/index.ts` | Replace `getUser()` with `getClaims()` pattern |
| `supabase/functions/stripe-webhook/index.ts` | Fix internal call to use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_ANON_KEY` |
| `supabase/functions/send-welcome-email/index.ts` | Add email/name/visaType input validation |

## Files NOT Changing (Already Correct)

| File | Why |
|------|-----|
| `useDocumentVault.tsx` | Upload logic is fully implemented and connected to storage |
| `DocumentStatusCard.tsx` | Upload button and file input are working |
| `supabase/functions/stripe-webhook/index.ts` | JWT auth is NOT needed here — it's a webhook authenticated by Stripe signature, which is the correct pattern for public webhook endpoints |
| `supabase/config.toml` | All `verify_jwt = false` entries are correct — we validate in code |

---

## Technical Details

### Why `verify_jwt = false` in config.toml is Correct
Supabase's `verify_jwt = true` config flag uses a deprecated key-rotation system. The modern, recommended approach is `verify_jwt = false` + manual `getClaims()` in the function code. This is exactly what the current setup does (and what Supabase docs recommend).

### RLS Policy Breakdown After Fix

```
onboarding_submissions SELECT access:
├── Admin (is_admin()) → sees ALL rows ✓
├── Partners (is_assigned_to_partner()) → sees assigned rows ✓  
├── Authenticated users → sees ONLY their own (auth.uid() = user_id) ✓
└── Anonymous rows (user_id IS NULL) → NOT accessible to anyone via SELECT ✓
```

### Edge Function Auth Flow After Fix

```
create-checkout:     Client JWT → getClaims() → verified ✓
send-welcome-email:  Client JWT → getClaims() → verified ✓ (or Service Role from webhook)
create-one-time:     Client JWT → getClaims() → verified ✓
stripe-webhook:      Stripe Signature → constructEvent() → verified ✓ (no JWT needed)
```

## Implementation Order

1. Database migration: fix `onboarding_submissions` RLS policy
2. Update `create-checkout` to use `getClaims()`
3. Fix `stripe-webhook` internal email call (use service role key)
4. Add input validation to `send-welcome-email`
5. Redeploy all affected edge functions
6. Re-run security scan to confirm all errors resolved
