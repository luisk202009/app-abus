

# Plan: Fix Storage Connectivity, Checkout Resilience & UI Placeholders

## Summary

Three targeted fixes to resolve storage status checks, prevent checkout failures from referral errors, and replace the last remaining placeholder toast with real upload functionality.

---

## Change 1: Fix AdminSystemStatus Storage Check

**Problem:** The Storage health check pings `/storage/v1/bucket` with the anon key, which returns an auth error (the anon key lacks permission to list buckets), causing a false "error" status.

**Fix:** Change the endpoint to check the specific `user-documents` bucket's public info at `/storage/v1/object/list/user-documents` or use the health-check friendly endpoint `/storage/v1/bucket/user-documents`. Since anon can't list buckets but the API responds with a structured error (not a 500), we adjust to check for `status < 500` like Edge Functions, or better: use a known-accessible path.

**File:** `src/components/admin/AdminSystemStatus.tsx`
- Change Storage check from `/storage/v1/bucket` to `/storage/v1/bucket/user-documents` with the Authorization header
- Accept any non-5xx response as "ok" (a 401/400 means the service is running; a 500 means it's down)

---

## Change 2: Wrap Referral Logic in try/catch in create-checkout

**Problem:** If the referral code lookup or insert fails (e.g., invalid code, DB error), the entire checkout fails and the user sees "No se pudo iniciar el proceso de pago."

**Fix:** Wrap the referral block (lines 126-188) in its own try/catch so referral failures are logged but the checkout session still completes.

**File:** `supabase/functions/create-checkout/index.ts`
- Wrap referral code lookup + discount creation (lines 126-155) in try/catch; on failure, set `discounts = undefined` and `referralCodeId = null`
- Wrap the post-session referral insert (lines 177-188) in its own try/catch; log the error but don't throw

---

## Change 3: Replace "disponible pronto" Toast with Real Upload

**Problem:** `DocumentsSection.tsx` (the fallback for non-regularizacion visa types) still shows "La funcionalidad de subida estara disponible pronto" instead of triggering a real file upload.

**Fix:** Add a hidden file input (like `DocumentStatusCard` already does) and wire `handleUploadClick` to trigger it. On file selection, upload via `supabase.storage.from('user-documents').upload()`.

**File:** `src/components/dashboard/DocumentsSection.tsx`
- Add a `useRef<HTMLInputElement>` for a hidden file input
- Replace the toast in `handleUploadClick` with `fileInputRef.current?.click()`
- Add `handleFileChange` handler with 5MB validation
- Add `uploadToStorage` function using Supabase Storage SDK
- Add a hidden `<input type="file">` element
- Track which document triggered the upload via state

---

## Change 4: Improve Checkout Error Logging

**Problem:** The error toast "No se pudo iniciar el proceso de pago" gives no debugging info.

**Fix:** In `DocumentVault.tsx`, the error is already logged to console (`console.error("Checkout error:", error)`). Enhance it to also include the server response body for easier debugging.

**File:** `src/components/dashboard/DocumentVault.tsx`
- Before `throw new Error(data.error)`, log the full response: `console.error("Checkout server error:", data)`

---

## No Changes Needed

| Item | Status |
|------|--------|
| Storage bucket `user-documents` | Already exists, private, with full RLS |
| Storage RLS policies | Complete: owner CRUD, admin full, partner read |
| `DocumentStatusCard` upload | Already has real file input and calls `onUpload` |
| `DocumentVault` upload flow | Already wired to `useDocumentVault.uploadDocument` |
| `PremiumFeatureModal` checkout | Already calls `onUpgrade(priceId)` correctly |

---

## Technical Details

### AdminSystemStatus - Storage endpoint fix
```typescript
// Before
const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
  headers: { apikey: SUPABASE_ANON_KEY },
});
results.push({ name: "Storage", status: res.ok ? "ok" : "error" });

// After: check specific bucket endpoint; non-5xx = service is running
const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/user-documents`, {
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  },
});
results.push({ name: "Storage", status: res.status < 500 ? "ok" : "error" });
```

### create-checkout - Referral try/catch
```typescript
// Wrap referral lookup in try/catch
if (referralCode) {
  try {
    // ... existing referral lookup and discount logic ...
  } catch (refError) {
    console.error("Referral processing failed (non-blocking):", refError);
    // Continue checkout without discount
  }
}

// Wrap post-checkout referral insert in try/catch
if (referralCodeId) {
  try {
    // ... existing insert logic ...
  } catch (refInsertError) {
    console.error("Referral tracking failed (non-blocking):", refInsertError);
  }
}
```

### DocumentsSection - Real upload replacement
```typescript
const fileInputRef = useRef<HTMLInputElement>(null);
const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

const handleUploadClick = (docId: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (!isPremium) { setShowPremiumModal(true); return; }
  setUploadingDocId(docId);
  fileInputRef.current?.click();
};

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user || !uploadingDocId) return;
  if (file.size > 5 * 1024 * 1024) {
    toast({ variant: "destructive", title: "Archivo muy grande", description: "Max 5MB." });
    return;
  }
  // Upload to storage and update toast
  const path = `${user.id}/${uploadingDocId}_${Date.now()}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage.from('user-documents').upload(path, file);
  if (error) {
    toast({ variant: "destructive", title: "Error", description: "No se pudo subir." });
  } else {
    toast({ title: "Documento subido", description: `${file.name} subido correctamente.` });
  }
  if (fileInputRef.current) fileInputRef.current.value = "";
};
```

---

## Deployment

- `create-checkout` edge function will be auto-deployed after edit
- No database migration needed (storage bucket and policies already exist)
- All changes are code-only
