

# Plan: F01 - Document Upload Activation, Profile View, and Final UX Polish

## Summary

The document upload infrastructure already exists and works (storage bucket, RLS, upload logic in `useDocumentVault`). The main gaps are: file size validation, a real Profile view, logout button, and minor polish items.

---

## 1. File Size Validation (5MB limit)

### Modify: `src/components/dashboard/DocumentStatusCard.tsx`

Add validation in `handleFileChange` before calling `onUpload`:
- Check `file.size > 5 * 1024 * 1024`
- If too large, show toast error: "El archivo no puede superar los 5MB"
- Accept types already correct: `.pdf,.jpg,.jpeg,.png`

This is a small change (5 lines) in the existing handler.

---

## 2. Build Profile Section

### Replace the "Proximamente" toast in `Dashboard.tsx`

When `activeNavItem === "profile"`, render a new `ProfileSection` component instead of showing a toast.

### New file: `src/components/dashboard/ProfileSection.tsx`

Professional profile view with the B&W Albus aesthetic:

**User Info Card:**
- Full Name (from `onboarding_submissions.full_name`)
- Email (from auth user)
- Nationality (from `onboarding_submissions.nationality`)
- Plan Status badge: Free (outline gray), Pro (black with Crown), Premium (black with Crown)

**Actions:**
- "Editar Perfil" button: Opens inline edit form for full_name and nationality, saves to `onboarding_submissions`
- "Cambiar Contrasena" button: Calls `supabase.auth.resetPasswordForEmail()` and shows confirmation toast

**Billing History:**
- Simple list of recent payments
- Since Stripe payment data is managed by webhooks, we show a simplified view from `onboarding_submissions.subscription_status` and the plan info
- Show current plan details with price from `plans` table
- Link to Stripe customer portal (if available) or simple status display

---

## 3. Logout Button in Sidebar

### Modify: `src/components/dashboard/DashboardSidebar.tsx`

- Import `LogOut` icon and `useAuth`
- Add "Cerrar Sesion" button below the admin section, above footer
- Only visible when `isLoggedIn === true`
- Call `signOut()` and navigate to `/`
- Update footer copyright from "2024" to "2026"

### Also add `signOut` prop or use `useAuth` directly

Since the sidebar is a child component, pass `onLogout` callback from Dashboard or import `useAuth` directly.

---

## 4. Plan Badge Always Visible

### Modify: `src/components/dashboard/DashboardSidebar.tsx`

- Currently the user info section only shows for `isPremium` users
- Change to show for ALL logged-in users
- Display appropriate badge: "Gratis" (outline), "Pro" (black), "Premium" (black)
- Add `subscriptionStatus` prop to distinguish between plans

---

## 5. CountdownBanner

Already correctly targets June 30, 2026. No changes needed.

---

## 6. Footer Legal Links

Already has links to `/terminos` and `/privacidad` and "Copyright 2026 Albus". No changes needed.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/ProfileSection.tsx` | User profile view with edit, password change, billing |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/DocumentStatusCard.tsx` | Add 5MB file size validation |
| `src/components/dashboard/DashboardSidebar.tsx` | Add logout button, plan badge for all users, fix copyright year |
| `src/pages/Dashboard.tsx` | Render ProfileSection instead of toast, pass subscriptionStatus to sidebar |

---

## Technical Details

### DocumentStatusCard - File validation

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    toast({ variant: "destructive", title: "Archivo muy grande", 
            description: "El archivo no puede superar los 5MB." });
    return;
  }
  onUpload(file);
};
```

### ProfileSection - Data fetching

```typescript
// Fetch from onboarding_submissions
const { data } = await supabase
  .from("onboarding_submissions")
  .select("full_name, nationality, subscription_status, email")
  .eq("user_id", user.id)
  .maybeSingle();

// Fetch plan details
const { data: plan } = await supabase
  .from("plans")
  .select("name, price_cents, currency, interval")
  .eq("slug", subscriptionStatus)
  .eq("is_active", true)
  .maybeSingle();
```

### DashboardSidebar - Logout

```typescript
// Add onLogout prop
interface DashboardSidebarProps {
  // ...existing
  onLogout?: () => void;
  subscriptionStatus?: string;
}

// In the component, before footer:
{isLoggedIn && onLogout && (
  <div className="px-4 pb-2">
    <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={onLogout}>
      <LogOut className="w-4 h-4" />
      Cerrar Sesion
    </Button>
  </div>
)}
```

---

## Implementation Order

1. `DocumentStatusCard.tsx` - Add file size validation
2. `ProfileSection.tsx` - Build profile view
3. `DashboardSidebar.tsx` - Logout button + plan badge + copyright fix
4. `Dashboard.tsx` - Wire profile section, logout, and subscriptionStatus

