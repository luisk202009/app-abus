

# Plan: Corregir error 401 en Paso 5 del AnalysisModal

## Causa raíz

En `handleSubmit` (línea 151), hay tres operaciones que fallan para usuarios no autenticados:

1. **Línea 175**: `.select("id")` en `onboarding_submissions` -- no hay política RLS de SELECT para usuarios anónimos
2. **Línea 188**: `.update()` -- no hay política RLS de UPDATE para usuarios anónimos
3. **Línea 196**: `.insert([...]).select("id").single()` -- el `.select()` encadenado después del insert también requiere SELECT, que el anónimo no tiene

No hay llamada a `send-welcome-email` en este paso, así que ese punto no aplica.

## Corrección en `src/components/AnalysisModal.tsx`

Simplificar `handleSubmit` para que solo haga un INSERT sin intentar leer ni actualizar:

1. **Eliminar** la consulta previa de "check existing" (`.select("id").eq("email", ...).maybeSingle()`)
2. **Eliminar** la rama de `.update()` para registros existentes
3. **Cambiar** el insert para que NO encadene `.select()` -- solo `.insert([submissionData])`
4. **Generar** el `leadId` del lado del cliente con `crypto.randomUUID()` y pasarlo como campo `id` en el insert, así no necesitamos leer el ID de vuelta

Esto resulta en un flujo donde el Paso 5 solo ejecuta un INSERT puro, que sí está permitido por la política RLS `"Allow anonymous inserts for lead capture"`.

## Archivos modificados
- `src/components/AnalysisModal.tsx` (solo la función `handleSubmit`, ~20 líneas)

No se requieren migraciones ni cambios en Edge Functions.

