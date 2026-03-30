import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  visaType?: string;
}

const getVisaDisplayName = (visaType?: string): string => {
  const visaNames: Record<string, string> = {
    remote_worker: "Visa de Nómada Digital",
    student: "Visa de Estudiante",
    entrepreneur: "Visa de Emprendedor",
    non_lucrative: "Visa No Lucrativa",
  };
  return visaNames[visaType || ""] || "visado";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { name, email, visaType }: WelcomeEmailRequest = await req.json();

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!name || name.trim().length === 0 || name.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const validVisaTypes = ["remote_worker", "student", "entrepreneur", "non_lucrative"];
    if (visaType && !validVisaTypes.includes(visaType)) {
      return new Response(JSON.stringify({ error: "Invalid visa type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const visaDisplayName = getVisaDisplayName(visaType);
    const firstName = name?.split(" ")[0] || "Usuario";

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="text-align: center; padding-bottom: 40px;">
        <h1 style="color: #000000; font-size: 32px; font-weight: 700; margin: 0;">Albus</h1>
      </td>
    </tr>
    <tr>
      <td style="background-color: #000000; padding: 48px 40px; border-radius: 8px;">
        <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 24px 0;">
          Hola ${firstName},
        </h2>
        <p style="color: #e5e5e5; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
          Gracias por confiar en Albus.
        </p>
        <p style="color: #e5e5e5; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
          Tu hoja de ruta para el <strong style="color: #ffffff;">${visaDisplayName}</strong> ya está desbloqueada. Puedes empezar a subir tus documentos y generar tus tasas oficiales ahora mismo.
        </p>
        <a href="<a href="https://www.albus.com.co/dashboard" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 6px; margin-top: 16px;">" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 6px; margin-top: 16px;">
          Ir a mi Dashboard →
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding-top: 40px; text-align: center;">
        <p style="color: #666666; font-size: 12px; line-height: 20px; margin: 0;">
          Albus es una plataforma tecnológica de asistencia.<br>
          No proporcionamos asesoramiento legal ni somos un despacho de abogados.
        </p>
        <p style="color: #999999; font-size: 11px; margin-top: 20px;">
          © ${new Date().getFullYear()} Albus. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Albus <onboarding@resend.dev>",
        to: [email],
        subject: "Bienvenido a Albus Pro: Tu camino a España empieza aquí",
        html: htmlContent,
      }),
    });

    const data = await emailResponse.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-welcome-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
