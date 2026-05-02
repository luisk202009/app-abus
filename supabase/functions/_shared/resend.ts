// Helper compartido para envío de correos vía Resend con dominio Albus.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_DEFAULT = "Albus <noreply@albus.com.co>";
const REPLY_TO_DEFAULT = "hola@albus.com.co";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = FROM_DEFAULT,
  replyTo = REPLY_TO_DEFAULT,
}: SendEmailParams): Promise<{ ok: boolean; status: number; data: unknown }> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY no está configurada");
  }

  const recipients = Array.isArray(to) ? to : [to];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[resend] envío fallido", res.status, data);
  } else {
    console.log("[resend] envío correcto", { to: recipients, subject });
  }
  return { ok: res.ok, status: res.status, data };
}
