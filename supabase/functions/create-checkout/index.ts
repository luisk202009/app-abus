import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, returnUrl, referralCode } = await req.json();

    // Validate priceId format
    if (priceId && (typeof priceId !== "string" || !priceId.startsWith("price_") || priceId.length > 100)) {
      return new Response(JSON.stringify({ error: "Invalid price ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate returnUrl against allowed origins
    const allowedOrigins = [
      "https://app-abus.lovable.app",
      "http://localhost:5173",
      "http://localhost:8080",
    ];
    if (returnUrl) {
      try {
        const url = new URL(returnUrl);
        if (!allowedOrigins.some((o) => url.origin === o)) {
          return new Response(JSON.stringify({ error: "Invalid return URL" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: "Invalid return URL format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate referralCode if provided
    if (referralCode && (typeof referralCode !== "string" || referralCode.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(referralCode))) {
      return new Response(JSON.stringify({ error: "Invalid referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Validate auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use getClaims() for local JWT validation (faster, no network call)
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email;

    if (!userId || !userEmail) {
      return new Response(JSON.stringify({ error: "Unauthorized: missing user claims" }), {
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
        // Use service role client to look up referral code
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

          // Find or create the referral coupon
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
        console.error("Referral processing failed (non-blocking):", refError);
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
        console.error("Referral tracking failed (non-blocking):", refInsertError);
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
    console.error("Checkout error:", error);
    console.log("Stripe Error Details:", error?.raw || error?.message || error);

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
