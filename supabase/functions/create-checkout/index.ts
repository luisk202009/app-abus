import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const isAllowedOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    return (
      url.hostname === "localhost" ||
      url.hostname.endsWith(".lovable.app") ||
      url.hostname.endsWith(".lovableproject.com")
    );
  } catch {
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const priceId = body.priceId;
    const returnUrl = body.returnUrl || req.headers.get("origin") || "https://app-abus.lovable.app";
    const referralCode = body.referralCode;

    // Validate priceId format
    if (priceId && (typeof priceId !== "string" || !priceId.startsWith("price_") || priceId.length > 100)) {
      return new Response(JSON.stringify({ error: "ID de precio inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate returnUrl against allowed origins
    if (returnUrl) {
      if (!isAllowedOrigin(returnUrl)) {
        return new Response(JSON.stringify({ error: "URL de retorno no permitida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate referralCode if provided
    if (referralCode && (typeof referralCode !== "string" || referralCode.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(referralCode))) {
      return new Response(JSON.stringify({ error: "Código de referido inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Stripe with defensive key validation
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    console.log(`[create-checkout] DEBUG: Prefijo de la llave secreta -> ${stripeKey.substring(0, 7)}...`);
    if (!stripeKey) {
      console.error("[create-checkout] STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ error: "Error de configuración del servidor" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!stripeKey.startsWith("sk_")) {
      console.error(`[create-checkout] STRIPE_SECRET_KEY has invalid prefix: ${stripeKey.substring(0, 7)}... Expected sk_live_ or sk_test_`);
      return new Response(JSON.stringify({ error: "Error de configuración del servidor. Contacta al administrador." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Validate auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use getClaims() for JWT validation (works even with expired sessions)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("[create-checkout] Auth error:", claimsError?.message);
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    if (!userId || !userEmail) {
      return new Response(JSON.stringify({ error: "No autorizado: faltan datos del usuario" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
    }

    // Default price ID for Albus Pro subscription
    const checkoutPriceId = priceId || "price_1SwlHBGVNlA5jALg4s8gArUM";

    // Handle referral code discount
    let discounts: { coupon: string }[] | undefined;
    let referralCodeId: string | null = null;

    if (referralCode) {
      try {
        const serviceClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: refCode } = await serviceClient
          .from("referral_codes")
          .select("id, user_id")
          .eq("code", referralCode)
          .single();

        if (refCode && refCode.user_id !== userId) {
          referralCodeId = refCode.id;

          const coupons = await stripe.coupons.list({ limit: 100 });
          let coupon = coupons.data.find((c: any) => c.name === "REFERRAL_5EUR");
          if (!coupon) {
            coupon = await stripe.coupons.create({
              name: "REFERRAL_5EUR",
              amount_off: 500,
              currency: "eur",
              duration: "once",
            });
          }
          discounts = [{ coupon: coupon.id }];
        }
      } catch (refError) {
        console.error("Error procesando referido (no bloqueante):", refError);
        discounts = undefined;
        referralCodeId = null;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: checkoutPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      ...(discounts ? { discounts } : {}),
      success_url: `${returnUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/dashboard`,
      metadata: {
        supabase_user_id: userId,
        referral_code_id: referralCodeId || "",
      },
    });

    // Track the referral (non-blocking)
    if (referralCodeId) {
      try {
        const serviceClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        await serviceClient.from("referrals").insert({
          referrer_id: referralCodeId,
          referred_user_id: userId,
          referred_name: userEmail?.split("@")[0] || null,
          status: "pendiente",
        });
      } catch (refInsertError) {
        console.error("Error registrando referido (no bloqueante):", refInsertError);
      }
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error en checkout:", error);
    console.log("Detalles del error Stripe:", error?.raw || error?.message || error);

    let errorMessage = "Error desconocido en el proceso de pago";
    if (error?.type === "StripeInvalidRequestError") {
      errorMessage = "Error de configuración de Stripe: ID de precio inválido o inexistente";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});