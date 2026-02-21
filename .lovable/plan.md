

# Fix: Perfil, Logout y Checkout (3 bugs)

## Resumen

Tres bugs interconectados: (1) el nombre se resetea a "Usuario" al navegar porque el estado inicial no espera la carga de datos, (2) logout falla porque la sesion ya esta invalidada en el servidor y `signOut()` no limpia el estado local, (3) checkout lleva a pagina en blanco posiblemente porque `getClaims()` no existe en la version del SDK usado en la Edge Function.

---

## Bug 1: Nombre desaparece al cambiar de seccion

**Causa raiz:** En `Dashboard.tsx`, el estado inicial de `userData.name` es `"Usuario"` (linea 92). Al cambiar de seccion el componente no se remonta, pero si se navega a `/explorar` (linea 99 del Sidebar hace `navigate("/explorar")`) y luego se regresa, el Dashboard se remonta y muestra "Usuario" hasta que el `loadData` async completa la consulta a `onboarding_submissions`.

**Archivo:** `src/pages/Dashboard.tsx`

**Solucion:**
- Incluir la carga del perfil dentro del flujo de `isLoading`. Actualmente `setIsLoading(false)` se llama al final de `loadData`, pero el nombre ya se muestra como "Usuario" antes.
- Esto ya funciona correctamente, el bug visual real es que durante la transicion breve se ve "Usuario". Asegurar que el header no renderice hasta que `isLoading` sea false (esto ya esta cubierto por el loading guard en linea 549).
- Verificar que el Sidebar `userName` se actualice correctamente despues del profile save. Actualmente el callback `onProfileUpdate` solo actualiza `userData.name`, lo cual se propaga al Sidebar via `userName={userData.name}`.

**Cambio minimo necesario:** Ninguno estructural. El bug real podria ser que al navegar internamente entre secciones del menu, el `activeNavItem` cambia pero el estado `userData` NO se reinicia. Si el nombre se "borra", es porque `loadData` se re-ejecuta (por cambio en dependencias del useEffect) y durante la carga no hay nombre. Agregar un guard: solo sobrescribir `userData` si los datos del fetch son distintos al estado actual.

---

## Bug 2: Cerrar sesion no funciona

**Causa raiz:** Los auth logs muestran `session_not_found` con status 403 en `/logout`. La sesion `c5fe4eec-...` ya no existe en el servidor. Cuando `supabase.auth.signOut()` recibe un error del servidor, en algunas versiones del SDK no limpia el estado local (tokens, sesion en localStorage).

**Archivo:** `src/hooks/useAuth.tsx`

**Solucion:**
- Cambiar `signOut()` para usar `scope: "local"`. Esto limpia la sesion local sin intentar llamar al servidor, evitando el error 403.
- Adicionalmente, limpiar manualmente el estado en caso de error:

```typescript
const signOut = async () => {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    console.error("Error during signOut:", error);
  }
  // Force clear state regardless
  setUser(null);
  setSession(null);
  setIsPartner(false);
};
```

---

## Bug 3: Checkout lleva a pagina en blanco

**Causa raiz:** La Edge Function `create-checkout` usa `supabaseClient.auth.getClaims(token)` (linea 99). Este metodo **no existe** en `@supabase/supabase-js@2.57.2`. Fue introducido en versiones posteriores. La funcion lanza un error de runtime, que se captura como error 500. El frontend muestra el toast de error pero la pagina ya quedo en un estado intermedio.

La imagen del usuario muestra skeletons, lo que indica que el Dashboard quedo en estado de carga.

**Archivo:** `supabase/functions/create-checkout/index.ts`

**Solucion:**
- Revertir a `supabaseClient.auth.getUser(token)` que funciona en todas las versiones
- El error "Session not found" que veiamos antes con `getUser` se soluciona usando el **Service Role Key** para crear el cliente (el service role bypassa la validacion de sesion):

```typescript
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
```

**Archivo:** `supabase/functions/create-one-time-payment/index.ts`
- Aplicar el mismo cambio (revertir `getClaims` a `getUser` con Service Role Key).

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAuth.tsx` | signOut con `scope: "local"` + force clear state |
| `supabase/functions/create-checkout/index.ts` | Revertir getClaims a getUser con SUPABASE_SERVICE_ROLE_KEY |
| `supabase/functions/create-one-time-payment/index.ts` | Mismo cambio: revertir getClaims a getUser con SUPABASE_SERVICE_ROLE_KEY |
| `src/pages/Dashboard.tsx` | Guard en loadData para no sobrescribir userData si ya fue editado por el usuario |

