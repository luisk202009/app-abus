# Plan: Invitación de abogados con marca Albus y entrega fiable

## Diagnóstico de los 3 problemas

### Problema 1 — Usuario ya registrado: no llega correo
En `invite-lawyer/index.ts`, cuando `inviteUserByEmail` devuelve "already registered", el código sólo busca el `user_id` existente y vincula `lawyers.user_id`, **pero nunca envía un correo**. Por eso el abogado no recibe nada y, como aún no ha iniciado sesión en su cuenta previa con ese email, al entrar a `/portal-abogado` cae en "Cuenta sin perfil de abogado" (la sesión activa puede ser otra o ninguna).

### Problema 2 — Email viene de "Supabase Auth" y no de Albus
Actualmente el proyecto **no tiene dominio de email configurado** en Lovable Cloud. Los correos de auth los manda Supabase con su plantilla genérica (`noreply@mail.app.supabase.io`, asunto "You have been invited"). Para enviar desde `noreply@albus.com.co` con marca Albus hay que:
1. Configurar el dominio de email `albus.com.co` (delegación NS a Lovable).
2. Scaffoldear las plantillas de auth-email (incluida `invite`) con estilos Albus en español.
3. Desplegar `auth-email-hook`.

### Problema 3 — "Este sitio no admite una conexión segura" tras aceptar invitación
La captura muestra que el enlace abre `http://albus.com.co/dashboard#access_token=...` (HTTP, no HTTPS). El navegador lo bloquea en incógnito. Causa: el `redirectTo` que envía `invite-lawyer` es `${window.location.origin}/portal-abogado`, pero la URL "Site URL" configurada en Supabase Auth es `http://albus.com.co` y el correo de Supabase usa esa Site URL como base para construir el link de confirmación. Además, el redirect actual lleva a `/dashboard` y no a `/portal-abogado`, lo que indica que `redirect_to` no está autorizado en la lista de Redirect URLs y Supabase recae en la Site URL por defecto.

---

## Cambios propuestos

### 1. Edge function `invite-lawyer` — reenvío garantizado
Cuando el email ya esté registrado:
- Vincular `lawyers.user_id` (ya lo hace).
- Llamar a `admin.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo } })` para generar un nuevo magic link y enviarlo al abogado mediante el sistema de email transaccional Albus (asunto: "Acceso a tu portal de abogado en Albus").
- Devolver `mode: "linked_existing_relogin_sent"` con mensaje claro.

Para invitaciones nuevas, seguir usando `inviteUserByEmail`, pero con `redirectTo = https://albus.com.co/portal-abogado` (ya con HTTPS forzado).

### 2. Forzar HTTPS y ruta correcta en el cliente admin
En `AdminLawyersTab.handleInvite`, construir:
```
const origin = window.location.origin.replace(/^http:/, 'https:');
const redirectTo = `${origin}/portal-abogado`;
```
Esto evita que el preview/dev en HTTP filtre un link sin TLS.

### 3. Configurar dominio de email Albus + plantillas con marca

**Paso 3a (requiere acción del usuario):** Configurar el subdominio de envío (por defecto `notify.albus.com.co`) mediante el diálogo de setup de email. El sender final será `noreply@notify.albus.com.co` (o `noreply@albus.com.co` si se elige el apex; recomendado un subdominio para no alterar MX existentes).

**Paso 3b (automático):** Scaffold de plantillas de auth-email (signup, recovery, magiclink, **invite**, email-change, reauthentication) con estilos Albus:
- Fondo blanco, tipografía Inter, acentos negro/dorado.
- Logo Albus en cabecera.
- Copy 100% en español. Para `invite`: "Has sido invitado al Portal de Abogados de Albus", botón "Definir mi contraseña y entrar".
- Footer Albus 2026.

**Paso 3c:** Desplegar `auth-email-hook`. Desde ese momento Supabase enrutará todos los correos de auth (incluida la invitación de abogados) por las plantillas Albus.

### 4. Configuración manual en Supabase (instrucciones para el usuario)
Para que el redirect funcione:
- En Supabase → Authentication → URL Configuration:
  - **Site URL**: `https://albus.com.co`
  - **Redirect URLs** (añadir si faltan): `https://albus.com.co/portal-abogado`, `https://www.albus.com.co/portal-abogado`, `https://albus.com.co/dashboard`, además de las URLs de preview de Lovable.

---

## Detalles técnicos

**Archivos a modificar:**
- `supabase/functions/invite-lawyer/index.ts` — reenvío magic link cuando usuario existe + asegurar `redirectTo` HTTPS.
- `src/components/admin/AdminLawyersTab.tsx` — forzar `https://` en `redirectTo`.
- `supabase/functions/_shared/email-templates/*.tsx` (creados por scaffold) — estilos Albus.
- `supabase/functions/auth-email-hook/index.ts` (creado por scaffold) — sin modificación funcional.
- `supabase/config.toml` — entradas auto-añadidas por scaffold.

**Pasos de ejecución (en build mode):**
1. Mostrar diálogo de configuración de dominio de email (espera acción del usuario).
2. Tras configurar el dominio: scaffold de plantillas + aplicar marca Albus + desplegar `auth-email-hook`.
3. Editar `invite-lawyer` y `AdminLawyersTab`.
4. Indicar al usuario las URLs a añadir en Supabase Auth.

**Nota importante:** El paso 1 (configurar dominio de email) **requiere que tú añadas registros NS en tu proveedor DNS de albus.com.co**. Sin eso, los correos seguirán saliendo desde `mail.app.supabase.io`. La verificación DNS puede tardar hasta 72h, pero el resto del flujo (plantillas, código) queda listo de inmediato y se activa automáticamente al verificarse el dominio.
