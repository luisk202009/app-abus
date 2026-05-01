import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1. Validar que el llamador sea admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json(401, { error: "No autenticado" });

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(
      token
    );
    if (userErr || !userData.user) {
      return json(401, { error: "Token inválido" });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleData, error: roleErr } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr || !roleData) {
      return json(403, { error: "Solo administradores pueden invitar abogados" });
    }

    // 2. Validar payload
    const body = await req.json().catch(() => ({}));
    const { lawyer_id, email, redirect_to } = body as {
      lawyer_id?: string;
      email?: string;
      redirect_to?: string;
    };
    if (!lawyer_id || !email) {
      return json(400, { error: "lawyer_id y email son obligatorios" });
    }

    // 3. Verificar que la fila lawyer existe y coincide email
    const { data: lawyerRow, error: lawyerErr } = await admin
      .from("lawyers")
      .select("id, email, user_id")
      .eq("id", lawyer_id)
      .maybeSingle();
    if (lawyerErr || !lawyerRow) {
      return json(404, { error: "Abogado no encontrado" });
    }

    // 4. Intentar invitar
    let authUserId: string | null = null;
    let mode: "invited" | "linked_existing" = "invited";

    const { data: invited, error: inviteErr } =
      await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirect_to,
      });

    if (inviteErr) {
      const msg = (inviteErr.message || "").toLowerCase();
      const isDuplicate =
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("exists");
      if (!isDuplicate) {
        return json(500, { error: `Error al invitar: ${inviteErr.message}` });
      }
      // Fallback: el usuario ya existe, lo buscamos
      const { data: list, error: listErr } =
        await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (listErr) {
        return json(500, { error: `No se pudo localizar usuario: ${listErr.message}` });
      }
      const existing = list.users.find(
        (u) => (u.email || "").toLowerCase() === email.toLowerCase()
      );
      if (!existing) {
        return json(500, { error: "Usuario duplicado pero no localizable" });
      }
      authUserId = existing.id;
      mode = "linked_existing";
    } else {
      authUserId = invited.user?.id ?? null;
    }

    if (!authUserId) {
      return json(500, { error: "No se obtuvo el ID del usuario" });
    }

    // 5. Vincular lawyers.user_id
    const { error: updErr } = await admin
      .from("lawyers")
      .update({ user_id: authUserId })
      .eq("id", lawyer_id);
    if (updErr) {
      return json(500, { error: `Error al vincular: ${updErr.message}` });
    }

    return json(200, {
      success: true,
      mode,
      user_id: authUserId,
      message:
        mode === "invited"
          ? "Invitación enviada por email"
          : "Usuario ya existía, vinculado correctamente",
    });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
});
