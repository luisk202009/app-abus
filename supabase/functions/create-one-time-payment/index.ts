import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let pendingPaymentId: string | null = null;

  try {
    const body = await req.json();
    const {
      priceId,
      email,
      name,
      routeTemplateSlug,
      planType,
      pendingPaymentId: existingPendingId,
    } = body;

    // Validaciones de input
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

    // Resolver user_id: 1) por Authorization header si existe, 2) si no, por email vía service role
    // Esto permite iniciar el checkout inmediatamente tras signUp sin esperar a la confirmación de email.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: authData } = await supabaseAdmin.auth.getUser(token);
      if (authData?.user?.id) {
        userId = authData.user.id;
      }
    }

    if (!userId) {
      // Buscar usuario por email (recién creado pero sin email confirmado)
      const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (listError) {
        console.error("Error listing users:", listError);
      }
      const found = userList?.users?.find(
        (u) => (u.email || "").toLowerCase() === email.toLowerCase()
      );
      if (found?.id) {
        userId = found.id;
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado. Crea la cuenta antes de iniciar el pago." }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1) Crear o reutilizar fila pending_payments
    if (existingPendingId && typeof existingPendingId === "string") {
      const { data: existing } = await supabaseAdmin
        .from("pending_payments")
        .select("id, user_id")
        .eq("id", existingPendingId)
        .maybeSingle();

      if (existing && existing.user_id === userId) {
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
          user_id: userId,
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
          supabase_user_id: userId,
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
        supabase_user_id: userId,
        pending_payment_id: pendingPaymentId,
      },
    });

    await supabaseAdmin
      .from("pending_payments")
      .update({ stripe_session_id: session.id })
      .eq("id", pendingPaymentId);

    console.log("Created checkout session:", session.id, "pending:", pendingPaymentId, "user:", userId);

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
