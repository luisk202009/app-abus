
# Plan: Corregir Error RLS en Tabla Resources

## Diagnóstico del Problema

El error **"new row violates row-level security policy for table 'resources'"** ocurre porque:

1. La tabla `resources` tiene RLS (Row-Level Security) habilitado
2. Solo existe una política SELECT: "Anyone can view active resources"
3. **No existen políticas INSERT, UPDATE ni DELETE**
4. Aunque el frontend verifica que el usuario sea admin (`l@albus.com.co`), la base de datos no tiene esta información y bloquea la operación

## Solución

Crear una función de verificación de admin en la base de datos y agregar las políticas RLS correspondientes para que el admin pueda gestionar recursos.

---

## Cambios en Base de Datos (SQL Migration)

### 1. Crear función `is_admin()`

Una función SECURITY DEFINER que verifica si el usuario autenticado es el admin basándose en su email:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND email = 'l@albus.com.co'
  )
$$;
```

### 2. Agregar políticas RLS para la tabla `resources`

```sql
-- Admin puede crear recursos
CREATE POLICY "Admin can insert resources"
ON public.resources
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admin puede actualizar recursos
CREATE POLICY "Admin can update resources"
ON public.resources
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin puede eliminar recursos
CREATE POLICY "Admin can delete resources"
ON public.resources
FOR DELETE
TO authenticated
USING (public.is_admin());
```

### 3. Agregar políticas RLS para la tabla `plans` (mismo problema potencial)

```sql
-- Admin puede crear planes
CREATE POLICY "Admin can insert plans"
ON public.plans
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admin puede actualizar planes
CREATE POLICY "Admin can update plans"
ON public.plans
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin puede eliminar planes
CREATE POLICY "Admin can delete plans"
ON public.plans
FOR DELETE
TO authenticated
USING (public.is_admin());
```

---

## Diagrama de Flujo de Seguridad

```text
┌─────────────────────────────────────────────────────────────┐
│                    Admin crea recurso                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: Verifica user.email === "l@albus.com.co"         │
│  (Ya implementado en Admin.tsx)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase Client: INSERT INTO resources                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Base de Datos RLS:                                         │
│  ¿is_admin() = true?                                        │
│                                                             │
│  Antes: ❌ No había política → ERROR                        │
│  Después: ✅ Política verifica email → PERMITIDO            │
└─────────────────────────────────────────────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| Nueva migración SQL | Crear función `is_admin()` y políticas RLS |

---

## Sección Técnica

### ¿Por qué usar SECURITY DEFINER?

La función `is_admin()` usa `SECURITY DEFINER` para poder consultar `auth.users` (que normalmente no es accesible vía RLS) de forma segura. Esto evita problemas de recursión y permite la verificación del email del usuario.

### Consideraciones de Seguridad

- La verificación del email se hace **en la base de datos**, no solo en el frontend
- Esto proporciona protección "defense in depth" (defensa en profundidad)
- Incluso si alguien intenta hacer requests directos a la API, el RLS los bloqueará

### Notas sobre escalabilidad

Si en el futuro se necesitan múltiples admins, se puede:
1. Crear una tabla `user_roles` (recomendado por las instrucciones de seguridad)
2. Modificar la función `is_admin()` para consultar esa tabla
