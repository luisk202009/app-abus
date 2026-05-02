
## Objetivo

Unificar todos los envíos de correo bajo Resend con el remitente verificado `noreply@albus.com.co` y plantillas con marca Albus (blanco/negro minimalista). Esto cubre:

1. Correos de autenticación de Supabase (confirmación de registro, magic link, reset de contraseña, **invitación de abogado**, cambio de email).
2. Correos transaccionales (bienvenida Pro, futuros: confirmación de pago, recordatorios, etc.).

## Estado actual

- `RESEND_API_KEY` ya está como secret en Supabase ✅
- `send-welcome-email` ya usa Resend pero con `onboarding@resend.dev` (no el dominio verificado) y HTML inline.
- `invite-lawyer` usa `auth.admin.inviteUserByEmail` y `signInWithOtp` → estos correos los envía Supabase Auth con su plantilla por defecto (el problema reportado anteriormente: "supabase auth" en el asunto, sin marca Albus).
- No existe infraestructura compartida de plantillas ni un sender genérico.

## Arquitectura propuesta

### A. Helper compartido `_shared/resend.ts`

Crear un módulo único que:
- Centralice `RESEND_API_KEY` y el `from: "Albus <noreply@albus.com.co>"`.
- Exponga `sendEmail({ to, subject, html, replyTo? })`.
- Maneje errores y logging consistente.

### B. Plantillas compartidas `_shared/email-templates/`

Plantillas HTML (string templates con interpolación, no React Email para mantener simplicidad y evitar build steps en edge functions) con layout común Albus:
- `layout.ts` — wrapper base con header (logo Albus), footer (disclaimer legal + © 2026 Albus LLC, marca blanco/negro).
- `welcome-pro.ts` — bienvenida Pro (reemplaza HTML inline actual).
- `lawyer-invitation.ts` — invitación a abogado con CTA "Aceptar invitación".
- `magic-link.ts` — enlace de acceso para abogados con cuenta existente.
- `auth-confirmation.ts` — confirmación de registro de cliente.
- `password-reset.ts` — restablecimiento de contraseña.

Estilo: fondo blanco, tipografía sans-serif (Inter/Arial fallback), botón negro `#000000` con texto blanco, radius 8px, según memoria de marca.

### C. Hook de Auth para interceptar correos de Supabase

Para que los correos de auth (incluyendo invitaciones) salgan por Resend con plantillas Albus:

1. Crear edge function `auth-email-hook` (verify_jwt = false, validada por header secret de Supabase Auth Hooks).
2. Registrarla en Supabase como **"Send Email Hook"** (Auth → Hooks).
3. La función recibe el evento (`signup`, `recovery`, `invite`, `magiclink`, `email_change`), genera el HTML branded usando las plantillas y lo envía vía Resend.
4. Generar un secret `SEND_EMAIL_HOOK_SECRET` para validar que las llamadas vienen de Supabase.

Esto reemplaza completamente las plantillas por defecto de Supabase Auth → todos los correos auth (incluida la invitación de abogado vía `inviteUserByEmail`) saldrán desde `noreply@albus.com.co` con marca Albus.

### D. Refactor de funciones existentes

- **`send-welcome-email`**: usar `_shared/resend.ts` + `welcome-pro.ts`. Cambiar `from` a `noreply@albus.com.co`. Corregir el bug actual del `<a href="<a href=...">` anidado.
- **`invite-lawyer`**: sin cambios funcionales — el correo ya saldrá branded automáticamente vía el hook. Solo confirmar que `redirectTo` apunta a `/aceptar-invitacion`.

### E. Configuración manual requerida

1. **Resend Dashboard**: confirmar que `albus.com.co` está verificado (DNS: SPF, DKIM, DMARC).
2. **Supabase Dashboard → Auth → Hooks**:
   - Habilitar "Send Email Hook" → apuntar a la URL de `auth-email-hook`.
   - Generar y guardar el secret `SEND_EMAIL_HOOK_SECRET` (lo registramos también como secret en Supabase Functions).
3. **Supabase Dashboard → Auth → Email Templates**: dejar las plantillas por defecto (no se usarán cuando el hook esté activo, pero sirven de fallback).

## Archivos a crear / modificar

**Nuevos:**
- `supabase/functions/_shared/resend.ts`
- `supabase/functions/_shared/email-templates/layout.ts`
- `supabase/functions/_shared/email-templates/welcome-pro.ts`
- `supabase/functions/_shared/email-templates/lawyer-invitation.ts`
- `supabase/functions/_shared/email-templates/magic-link.ts`
- `supabase/functions/_shared/email-templates/auth-confirmation.ts`
- `supabase/functions/_shared/email-templates/password-reset.ts`
- `supabase/functions/auth-email-hook/index.ts`

**Modificar:**
- `supabase/functions/send-welcome-email/index.ts` (usar helper + dominio propio + corregir HTML)
- `supabase/config.toml` (registrar `auth-email-hook` con `verify_jwt = false`)

**Secrets a añadir:**
- `SEND_EMAIL_HOOK_SECRET` (lo solicitaré al usuario tras aprobar el plan, generándolo desde el panel de Supabase Auth → Hooks).

## Acciones manuales del usuario tras implementación

1. Verificar dominio `albus.com.co` en Resend (si aún no está).
2. En Supabase Auth → Hooks → "Send Email Hook":
   - Pegar URL: `https://uidwcgxbybjpbteowrnh.supabase.co/functions/v1/auth-email-hook`
   - Copiar el secret generado y pasármelo para añadirlo como `SEND_EMAIL_HOOK_SECRET`.
3. Probar enviando una invitación de abogado y un registro nuevo para confirmar marca Albus en bandeja.

## Resultado esperado

- Todos los correos (auth + transaccionales) salen desde `noreply@albus.com.co`.
- Asunto y contenido con marca Albus en español, tipografía y colores consistentes.
- Invitaciones de abogado, magic links y confirmaciones llegan branded sin "supabase" en el remitente.
- Código DRY: una sola función `sendEmail()` y una sola plantilla base reutilizable.
