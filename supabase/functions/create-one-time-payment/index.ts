import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar autenticación
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData?.user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const user = authData.user;
  // Importante: NO bloqueamos por email no confirmado. La confirmación
  // puede completarse después; el cobro debe poder iniciarse de inmediato.

  let pendingPaymentId: string | null = null;

  try {
    const body = await req.json();
    const { priceId, email, name, routeTemplateSlug, planType, pendingPaymentId: existingPendingId } = body;

    // Validaciones
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!priceId || typeof priceId !== "string" || !priceId.startsWith("price_") || priceId.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid price ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (routeTemplateSlug && (typeof routeTemplateSlug !== "string" || routeTemplateSlug.length > 100)) {
      return new Response(JSON.stringify({ error: "Invalid route template slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (planType && (typeof planType !== "string" || !["free", "pro", "digital", "premium"].includes(planType))) {
      return new Response(JSON.stringify({ error: "Invalid plan type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Crear o reutilizar fila pending_payments
    if (existingPendingId && typeof existingPendingId === "string") {
      // Reintento: validar que pertenezca al usuario
      const { data: existing } = await supabaseAdmin
        .from("pending_payments")
        .select("id, user_id")
        .eq("id", existingPendingId)
        .maybeSingle();

      if (existing && existing.user_id === user.id) {
        pendingPaymentId = existing.id;
        await supabaseAdmin
          .from("pending_payments")
          .update({ status: "pending", error_message: null })
          .eq("id", pendingPaymentId);
      }
    }

    if (!pendingPaymentId) {
      const { data: newPending, error: insertError } = await supabaseAdmin
        .from("pending_payments")
        .insert({
          user_id: user.id,
          email,
          plan_type: planType ?? "pro",
          route_template: routeTemplateSlug ?? null,
          price_id: priceId,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting pending payment:", insertError);
        throw new Error(insertError.message);
      }
      pendingPaymentId = newPending.id;
    }

    // 2) Crear sesión Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          route_template_slug: routeTemplateSlug ?? "",
          plan_type: planType ?? "",
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://www.albus.com.co";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&pending_payment=${pendingPaymentId}`,
      cancel_url: `${origin}/dashboard?pending_payment=${pendingPaymentId}`,
      metadata: {
        plan_type: planType ?? "",
        route_template_slug: routeTemplateSlug ?? "",
        user_email: email,
        user_name: name,
        supabase_user_id: user.id,
        pending_payment_id: pendingPaymentId,
      },
    });

    // 3) Guardar session id
    await supabaseAdmin
      .from("pending_payments")
      .update({ stripe_session_id: session.id })
      .eq("id", pendingPaymentId);

    console.log("Created checkout session:", session.id, "pending:", pendingPaymentId);

    return new Response(
      JSON.stringify({ url: session.url, pending_payment_id: pendingPaymentId }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error creating checkout session:", errorMessage);

    // Marcar pending_payment como failed para que el usuario pueda reintentar desde el dashboard
    if (pendingPaymentId) {
      await supabaseAdmin
        .from("pending_payments")
        .update({ status: "failed", error_message: errorMessage })
        .eq("id", pendingPaymentId);
    }

    return new Response(
      JSON.stringify({ error: errorMessage, pending_payment_id: pendingPaymentId }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
