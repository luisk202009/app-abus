// Layout HTML compartido para todos los correos Albus (blanco/negro minimalista).
export interface LayoutParams {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

export function renderLayout({
  preheader = "",
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  footerNote,
}: LayoutParams): string {
  const year = new Date().getFullYear();
  const cta =
    ctaLabel && ctaUrl
      ? `<tr><td style="padding:8px 0 0;"><a href="${ctaUrl}" style="display:inline-block;background:#000000;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:8px;">${ctaLabel}</a></td></tr>`
      : "";

  const note = footerNote
    ? `<p style="color:#666666;font-size:12px;line-height:18px;margin:24px 0 0;">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Arial,sans-serif;color:#0a0a0a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ececec;">
          <tr>
            <td style="padding:32px 40px 0;text-align:left;">
              <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#000000;">Albus</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 8px;">
              <h1 style="font-size:22px;font-weight:700;color:#000000;margin:0 0 16px;line-height:1.3;">${heading}</h1>
              <div style="font-size:15px;line-height:1.6;color:#333333;">${bodyHtml}</div>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;">${cta}</table>
              ${note}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;border-top:1px solid #ececec;margin-top:24px;">
              <p style="color:#666666;font-size:12px;line-height:1.5;margin:0 0 8px;">
                Albus es una plataforma tecnológica de asistencia migratoria.<br>
                No proporcionamos asesoramiento legal ni somos un despacho de abogados.
              </p>
              <p style="color:#999999;font-size:11px;margin:8px 0 0;">
                © ${year} Albus LLC · <a href="https://albus.com.co" style="color:#999999;text-decoration:underline;">albus.com.co</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
