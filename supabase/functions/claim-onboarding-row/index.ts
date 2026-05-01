// Edge function: claim-onboarding-row
// Reclama (asigna user_id a) la fila huérfana de onboarding_submissions
// cuyo email coincida con el del usuario autenticado.
// Usa SERVICE_ROLE para bypassear RLS de forma controlada.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Cliente con anon key sólo para validar el JWT.
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: userData, error: userError } =
      await supabaseAnon.auth.getUser(token);

    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const email = userData.user.email.toLowerCase();

    // Cliente admin para realizar el claim sin restricciones de RLS.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. ¿Ya tiene una fila vinculada por user_id?
    const { data: ownRow } = await supabaseAdmin
      .from("onboarding_submissions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (ownRow) {
      return new Response(
        JSON.stringify({ claimed: false, alreadyLinked: true, id: ownRow.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 2. Buscar fila huérfana por email
    const { data: orphan } = await supabaseAdmin
      .from("onboarding_submissions")
      .select("id")
      .ilike("email", email)
      .is("user_id", null)
      .maybeSingle();

    if (orphan) {
      const { error: claimError } = await supabaseAdmin
        .from("onboarding_submissions")
        .update({ user_id: userId })
        .eq("id", orphan.id);

      if (claimError) {
        console.error("claim-onboarding-row update error:", claimError);
        return new Response(JSON.stringify({ error: claimError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ claimed: true, id: orphan.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 3. No existe fila previa: nada que reclamar.
    return new Response(JSON.stringify({ claimed: false, alreadyLinked: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("claim-onboarding-row error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
