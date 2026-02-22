

# Fix: Perfil, Documentos y Plan Premium

## Problema 1: No se puede actualizar el perfil

**Error exacto:** `duplicate key value violates unique constraint "onboarding_submissions_email_key"`

**Causa raiz:** La tabla `onboarding_submissions` tiene un constraint UNIQUE en la columna `email`. Cuando el usuario actualiza su perfil, el payload incluye `email: user.email` en el UPDATE. Si existe otra fila anonima (lead) con el mismo email pero diferente `user_id` (o sin `user_id`), el UPDATE o INSERT falla por duplicado.

**Solucion:** Eliminar el campo `email` del payload de actualizacion en `handleSave`. El email no se esta editando, asi que no tiene sentido enviarlo. Solo enviar `full_name` y `nationality`.

**Archivo:** `src/components/dashboard/ProfileSection.tsx` (lineas 76-80)

---

## Problema 2: Diseno de documentos cambio

**Causa:** El Dashboard actualmente importa y renderiza `DocumentVault` (la version nueva con categorias de Identidad/Residencia/Antecedentes). El usuario quiere la version original `DocumentsSection` que muestra una grid de documentos con iconos individuales y el generador de Tasa 790.

**Solucion:** Cambiar el import y el render en `Dashboard.tsx` de `DocumentVault` a `DocumentsSection`, ajustando los props que se pasan.

**Archivo:** `src/pages/Dashboard.tsx`
- Linea 12: Cambiar import de `DocumentVault` a `DocumentsSection`
- Lineas 433-438: Cambiar el render del case "documents" para usar `DocumentsSection` con los props correctos (`visaType`, `isPremium`, `onCheckout`, `isCheckoutLoading`)

---

## Problema 3: Plan premium asignado pero muestra "Gratis"

**Causa:** Puede haber filas duplicadas en `onboarding_submissions` para el mismo usuario. El admin podria estar actualizando la fila del lead anonimo (sin `user_id`), mientras que `useSubscription` consulta por `user_id`. Si la fila con `user_id` sigue teniendo `subscription_status = 'free'`, el dashboard muestra "Gratis".

**Solucion doble:**
1. En el admin (`AdminUsersTab.tsx`), al guardar el plan, si el usuario tiene `user_id`, buscar TODAS las filas con ese `user_id` o con ese `email` y actualizar la que tiene `user_id` vinculado
2. Verificar con una consulta directa si el usuario `luisk20@gmail.com` tiene multiples filas y cual tiene el `user_id` correcto. Si el status esta en la fila incorrecta, corregir los datos via SQL

Ademas, agregar un log en `useSubscription` para diagnosticar que valor esta leyendo realmente de la base de datos.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/ProfileSection.tsx` | Quitar `email` del payload de update/insert |
| `src/pages/Dashboard.tsx` | Revertir de DocumentVault a DocumentsSection |
| `src/components/admin/AdminUsersTab.tsx` | Asegurar que el update del plan siempre use la fila correcta (por user_id cuando existe) |
| Consulta SQL directa | Verificar y corregir datos de luisk20@gmail.com |

