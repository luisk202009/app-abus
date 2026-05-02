import { renderLayout } from "./layout.ts";

export function renderMagicLinkEmail(params: { confirmUrl: string }) {
  const html = renderLayout({
    preheader: "Tu enlace de acceso a Albus.",
    heading: "Tu enlace de acceso",
    bodyHtml: `
      <p style="margin:0 0 16px;">Pulsa el botón para entrar a tu cuenta de Albus sin contraseña.</p>
    `,
    ctaLabel: "Entrar a Albus",
    ctaUrl: params.confirmUrl,
    footerNote: "Este enlace caduca pronto. Si no lo solicitaste, puedes ignorar este mensaje.",
  });
  return { subject: "Tu enlace de acceso a Albus", html };
}
