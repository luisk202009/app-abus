// Auth Email Hook de Supabase: intercepta correos de auth y los envía vía Resend
// con plantillas branded de Albus.
//
// Configuración requerida en Supabase Dashboard → Auth → Hooks → Send Email Hook:
//   URL: https://uidwcgxbybjpbteowrnh.supabase.co/functions/v1/auth-email-hook
//   Secret: copiar el valor generado a SEND_EMAIL_HOOK_SECRET
//
// Documentación: https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { sendEmail } from "../_shared/resend.ts";
import { renderAuthConfirmationEmail } from "../_shared/email-templates/auth-confirmation.ts";
import { renderPasswordResetEmail } from "../_shared/email-templates/password-reset.ts";
import { renderMagicLinkEmail } from "../_shared/email-templates/magic-link.ts";
import { renderLawyerInvitationEmail } from "../_shared/email-templates/lawyer-invitation.ts";
import { renderEmailChangeEmail } from "../_shared/email-templates/email-change.ts";

const HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

interface EmailPayload {
  user: { email: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildVerifyUrl(p: EmailPayload["email_data"], type: string): string {
  // Construye la URL del callback de verificación de Supabase. Esta URL,
  // al visitarla, valida el token y luego redirige al `redirect_to` con la
  // sesión hidratada (#access_token=...).
  const url = new URL(`${SUPABASE_URL}/auth/v1/verify`);
  url.searchParams.set("token", p.token_hash);
  url.searchParams.set("type", type);
  url.searchParams.set("redirect_to", p.redirect_to);
  return url.toString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawPayload = await req.text();

    // Verificar firma del webhook (estándar Supabase Auth Hooks)
    if (!HOOK_SECRET) {
      console.error("[auth-email-hook] SEND_EMAIL_HOOK_SECRET no configurado");
      return new Response(JSON.stringify({ error: "hook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // El secret de Supabase llega como "v1,whsec_xxx". El SDK requiere solo "whsec_xxx".
    const cleanSecret = HOOK_SECRET.replace(/^v1,\s*/, "");
    const wh = new Webhook(cleanSecret);
    const headers = Object.fromEntries(req.headers);

    let payload: { user: EmailPayload["user"]; email_data: EmailPayload["email_data"] };
    try {
      payload = wh.verify(rawPayload, headers) as typeof payload;
    } catch (e) {
      console.error("[auth-email-hook] firma inválida", (e as Error).message);
      return new Response(JSON.stringify({ error: "invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user, email_data } = payload;
    const action = email_data.email_action_type;
    console.log("[auth-email-hook] evento", { action, to: user.email });

    let rendered: { subject: string; html: string } | null = null;

    switch (action) {
      case "signup": {
        rendered = renderAuthConfirmationEmail({
          confirmUrl: buildVerifyUrl(email_data, "signup"),
        });
        break;
      }
      case "recovery": {
        rendered = renderPasswordResetEmail({
          confirmUrl: buildVerifyUrl(email_data, "recovery"),
        });
        break;
      }
      case "magiclink": {
        rendered = renderMagicLinkEmail({
          confirmUrl: buildVerifyUrl(email_data, "magiclink"),
        });
        break;
      }
      case "invite": {
        rendered = renderLawyerInvitationEmail({
          confirmUrl: buildVerifyUrl(email_data, "invite"),
        });
        break;
      }
      case "email_change":
      case "email_change_new":
      case "email": {
        rendered = renderEmailChangeEmail({
          confirmUrl: buildVerifyUrl(email_data, "email_change"),
        });
        break;
      }
      default: {
        console.warn("[auth-email-hook] acción no soportada", action);
        // Devolvemos 200 para que Supabase no reintente; usará su plantilla por defecto.
        return new Response(JSON.stringify({ skipped: true, action }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const result = await sendEmail({
      to: user.email,
      subject: rendered.subject,
      html: rendered.html,
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({ error: "resend send failed", detail: result.data }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[auth-email-hook] error", (e as Error).message);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
