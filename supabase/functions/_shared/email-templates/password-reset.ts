import { renderLayout } from "./layout.ts";

export function renderPasswordResetEmail(params: { confirmUrl: string }) {
  const html = renderLayout({
    preheader: "Restablece tu contraseña de Albus.",
    heading: "Restablece tu contraseña",
    bodyHtml: `
      <p style="margin:0 0 16px;">Recibimos una solicitud para restablecer tu contraseña.</p>
      <p style="margin:0 0 16px;">Pulsa el botón para crear una nueva contraseña.</p>
    `,
    ctaLabel: "Restablecer contraseña",
    ctaUrl: params.confirmUrl,
    footerNote: "Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá funcionando.",
  });
  return { subject: "Restablece tu contraseña de Albus", html };
}
