
# Fix: Datos de perfil no se persisten (usuario sin onboarding)

## Problema raiz

Las consultas a `onboarding_submissions` para este usuario devuelven arrays vacios `[]`. El usuario se registro directamente (no paso por el flujo de onboarding), asi que **no tiene fila** en `onboarding_submissions`.

Cuando `ProfileSection.handleSave` ejecuta:
```typescript
await supabase.from("onboarding_submissions").update({...}).eq("user_id", user.id);
```
Esto hace un UPDATE que coincide con 0 filas. No hay error, pero tampoco se guarda nada. Al navegar a otra seccion, `loadData` re-ejecuta la consulta, no encuentra datos, y el nombre vuelve a "Usuario".

## Solucion

Usar **upsert** en lugar de update en `ProfileSection`, y asegurar que se cree una fila en `onboarding_submissions` si no existe.

---

## Cambios

### 1. ProfileSection.tsx - Usar upsert en handleSave

**Archivo:** `src/components/dashboard/ProfileSection.tsx`

Cambiar `handleSave` para usar `upsert` en lugar de `update`. Si no existe la fila, la crea; si existe, la actualiza:

```typescript
const handleSave = async () => {
  if (!user) return;
  setIsSaving(true);

  const { error } = await supabase
    .from("onboarding_submissions")
    .upsert({
      user_id: user.id,
      full_name: editData.full_name.trim(),
      nationality: editData.nationality.trim(),
      email: user.email || "",
    }, { onConflict: "user_id" });

  if (error) {
    toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el perfil." });
  } else {
    setProfileData(prev => ({ ...prev, full_name: editData.full_name.trim(), nationality: editData.nationality.trim() }));
    setIsEditing(false);
    toast({ title: "Perfil actualizado", description: "Tus datos se han guardado correctamente." });
    onProfileUpdate?.({ full_name: editData.full_name.trim(), nationality: editData.nationality.trim() });
  }
  setIsSaving(false);
};
```

Para que `upsert` con `onConflict: "user_id"` funcione, se necesita un indice UNIQUE en la columna `user_id` de `onboarding_submissions` (si no existe ya).

### 2. Migracion SQL - Asegurar indice UNIQUE en user_id

Crear un indice UNIQUE en `onboarding_submissions.user_id` para que el upsert funcione correctamente:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS onboarding_submissions_user_id_unique 
ON onboarding_submissions(user_id);
```

### 3. Dashboard.tsx - Manejar caso sin submission

**Archivo:** `src/pages/Dashboard.tsx`

En `loadData`, cuando no hay submission, usar el email del usuario como fallback y no dejar el nombre como "Usuario" si ya fue actualizado:

```typescript
if (submission) {
  // ... existing logic
} else {
  // No submission yet - use auth data
  setUserData(prev => ({
    ...prev,
    name: prev.name !== "Usuario" ? prev.name : (user.email?.split("@")[0] || "Usuario"),
    email: user.email || "",
  }));
}
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/ProfileSection.tsx` | Cambiar `.update()` a `.upsert()` con `onConflict: "user_id"` |
| `src/pages/Dashboard.tsx` | Agregar else para manejar caso sin submission |
| Migracion SQL | Crear indice UNIQUE en `onboarding_submissions.user_id` |
