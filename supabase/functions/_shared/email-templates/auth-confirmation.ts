import { renderLayout } from "./layout.ts";

export function renderAuthConfirmationEmail(params: { confirmUrl: string }) {
  const html = renderLayout({
    preheader: "Confirma tu correo para empezar con Albus.",
    heading: "Confirma tu correo electrónico",
    bodyHtml: `
      <p style="margin:0 0 16px;">¡Bienvenido a Albus!</p>
      <p style="margin:0 0 16px;">Confirma tu correo para activar tu cuenta y acceder a tu hoja de ruta migratoria.</p>
    `,
    ctaLabel: "Confirmar correo",
    ctaUrl: params.confirmUrl,
    footerNote: "Si no creaste esta cuenta, puedes ignorar este mensaje.",
  });
  return { subject: "Confirma tu correo en Albus", html };
}
