
# Fix: getClaims, Stripe Checkout, Admin Plan Management y Storage Health

## Resumen

Cinco correcciones criticas: (1) reemplazar `getClaims` inexistente por `getUser`, (2) corregir URLs de Stripe, (3) permitir gestion de plan para Leads sin `user_id`, (4) arreglar Storage ping, (5) limpiar mensajes de error.

---

## 1. Fix getClaims (CRITICO)

**Archivos:** `supabase/functions/create-checkout/index.ts`, `supabase/functions/create-one-time-payment/index.ts`

**Problema:** Ambas funciones llaman `supabaseClient.auth.getClaims(token)` que NO existe en `@supabase/supabase-js`. El error en logs confirma: `"supabaseClient.auth.getClaims is not a function"`.

**Solucion:** Reemplazar con `supabase.auth.getUser(token)`:

```typescript
// ANTES (no existe)
const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
const userId = claimsData.claims.sub;
const userEmail = claimsData.claims.email;

// DESPUES (correcto)
const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
if (userError || !userData?.user) {
  return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
}
const userId = userData.user.id;
const userEmail = userData.user.email;
```

Tambien actualizar la version de Stripe en `create-checkout` de `stripe@14.21.0` a `stripe@18.5.0` y la version de supabase-js de `@2.45.0` a `@2.57.2` para consistencia.

---

## 2. Fix Stripe Checkout URLs

**Archivo:** `supabase/functions/create-checkout/index.ts`

**Problema:** La lista `allowedOrigins` puede no incluir el origen actual del preview, causando "Invalid return URL".

**Solucion:** Hacer la validacion mas flexible: en vez de una lista fija, aceptar cualquier subdominio de `lovable.app` y `localhost`:

```typescript
const isAllowed = (origin: string) => {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" ||
           url.hostname.endsWith(".lovable.app") ||
           url.hostname === "app-abus.lovable.app";
  } catch { return false; }
};
```

---

## 3. Admin Plan Management para Leads

**Archivo:** `src/components/admin/AdminUsersTab.tsx`

**Problema actual:**
- Linea 450: `{user.user_id && (...)}` oculta el boton para Leads
- Linea 208: `if (!planModalUser?.user_id) return;` impide guardar si no hay `user_id`

**Solucion:**

A. Mostrar el boton siempre (quitar la condicion `user.user_id`):
```tsx
<Button variant="outline" size="sm" onClick={() => openPlanModal(user)}>
  <CreditCard className="w-3.5 h-3.5" />
  Gestionar Plan
</Button>
```

B. Modificar `handleSavePlan` para que funcione con el `id` de la submission cuando no hay `user_id`:
```typescript
const handleSavePlan = async () => {
  if (!planModalUser) return;
  setIsSavingPlan(true);
  try {
    const updateData = {
      subscription_status: planModalStatus,
      next_billing_date: planModalDate ? format(planModalDate, "yyyy-MM-dd") : null,
    };

    let query;
    if (planModalUser.user_id) {
      query = supabase.from("onboarding_submissions")
        .update(updateData).eq("user_id", planModalUser.user_id);
    } else {
      query = supabase.from("onboarding_submissions")
        .update(updateData).eq("id", planModalUser.id);
    }
    const { error } = await query;
    if (error) throw error;

    // Actualizar estado local
    setUsers(prev => prev.map(u =>
      u.id === planModalUser.id
        ? { ...u, subscription_status: planModalStatus, next_billing_date: ... }
        : u
    ));
    toast.success(`Plan actualizado a "${planModalStatus}"`);
    setPlanModalUser(null);
  } catch (error) {
    toast.error("Error al actualizar el plan");
  } finally {
    setIsSavingPlan(false);
  }
};
```

---

## 4. Storage Health Check

**Archivo:** `src/components/admin/AdminSystemStatus.tsx`

**Problema:** Hace ping a un bucket privado (`user-documents`) que devuelve 401/403 con el anon key.

**Solucion:** Usar el bucket publico `resources` en su lugar, o simplemente hacer ping al endpoint base de Storage:

```typescript
// Usar bucket publico
const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/resources`, {
  headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
});
results.push({ name: "Storage", status: res.status < 500 ? "ok" : "error" });
```

---

## 5. UI Cleanup - Mensajes de Error

**Archivo:** `src/hooks/useSubscription.tsx`

El toast de error ya esta bien escrito, pero si el error viene como objeto no-string, el mensaje puede ser confuso. Reforzar el fallback:

```typescript
toast({
  variant: "destructive",
  title: "Error de pago",
  description: "No se pudo iniciar el proceso de pago. Intenta de nuevo mas tarde.",
});
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/create-checkout/index.ts` | Reemplazar `getClaims` con `getUser`; flexibilizar validacion de URLs; actualizar versiones |
| `supabase/functions/create-one-time-payment/index.ts` | Reemplazar `getClaims` con `getUser` |
| `src/components/admin/AdminUsersTab.tsx` | Mostrar boton "Gestionar Plan" para todos; permitir guardar plan por `id` de submission |
| `src/components/admin/AdminSystemStatus.tsx` | Usar bucket publico para Storage ping |
| `src/hooks/useSubscription.tsx` | Limpiar mensaje de error en toast |
