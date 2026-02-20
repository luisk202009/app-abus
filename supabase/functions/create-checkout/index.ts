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

    // Track the referral
    if (referralCodeId) {
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
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
