import { renderLayout } from "./layout.ts";

const visaNames: Record<string, string> = {
  remote_worker: "Visa de Nómada Digital",
  student: "Visa de Estudiante",
  entrepreneur: "Visa de Emprendedor",
  non_lucrative: "Visa No Lucrativa",
};

export interface WelcomeProParams {
  name: string;
  visaType?: string;
  dashboardUrl?: string;
}

export function renderWelcomeProEmail({
  name,
  visaType,
  dashboardUrl = "https://albus.com.co/dashboard",
}: WelcomeProParams): { subject: string; html: string } {
  const firstName = (name || "").split(" ")[0] || "Hola";
  const visa = visaNames[visaType || ""] || "tu hoja de ruta migratoria";

  const html = renderLayout({
    preheader: "Tu plan Pro está activo. Empieza tu ruta a España.",
    heading: `Bienvenido a Albus Pro, ${firstName}`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Gracias por confiar en Albus.</p>
      <p style="margin:0 0 16px;">Ya tienes acceso completo a <strong>${visa}</strong>: subida ilimitada de documentos, generación de tasas oficiales y seguimiento de tu expediente.</p>
      <p style="margin:0;">Entra a tu Dashboard y empieza ahora mismo.</p>
    `,
    ctaLabel: "Ir a mi Dashboard",
    ctaUrl: dashboardUrl,
    footerNote: "¿Dudas? Responde a este correo y te ayudamos.",
  });

  return {
    subject: "Bienvenido a Albus Pro: tu camino a España empieza aquí",
    html,
  };
}
