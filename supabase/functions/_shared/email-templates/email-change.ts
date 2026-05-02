import { renderLayout } from "./layout.ts";

export function renderEmailChangeEmail(params: { confirmUrl: string }) {
  const html = renderLayout({
    preheader: "Confirma el cambio de tu correo en Albus.",
    heading: "Confirma tu nuevo correo",
    bodyHtml: `
      <p style="margin:0 0 16px;">Has solicitado cambiar tu correo electrónico en Albus.</p>
      <p style="margin:0 0 16px;">Confirma este nuevo correo para finalizar el cambio.</p>
    `,
    ctaLabel: "Confirmar nuevo correo",
    ctaUrl: params.confirmUrl,
    footerNote: "Si no solicitaste este cambio, contacta con nosotros inmediatamente.",
  });
  return { subject: "Confirma tu nuevo correo en Albus", html };
}
