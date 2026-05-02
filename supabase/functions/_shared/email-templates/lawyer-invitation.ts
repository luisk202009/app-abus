import { renderLayout } from "./layout.ts";

export function renderLawyerInvitationEmail(params: { confirmUrl: string }) {
  const html = renderLayout({
    preheader: "Has sido invitado al Portal de Abogados de Albus.",
    heading: "Bienvenido al Portal de Abogados",
    bodyHtml: `
      <p style="margin:0 0 16px;">El equipo de Albus te ha invitado a colaborar como abogado en nuestra plataforma.</p>
      <p style="margin:0 0 16px;">Para activar tu cuenta y definir tu contraseña, haz clic en el botón:</p>
    `,
    ctaLabel: "Aceptar invitación",
    ctaUrl: params.confirmUrl,
    footerNote: "Este enlace caduca en 24 horas. Si no esperabas esta invitación, ignora este mensaje.",
  });
  return { subject: "Invitación al Portal de Abogados Albus", html };
}
