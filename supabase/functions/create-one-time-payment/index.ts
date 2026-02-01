import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, email, name, routeTemplateSlug, planType } = await req.json();

    if (!priceId || !email || !name) {
      throw new Error("Missing required fields: priceId, email, name");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Initialize Supabase with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          route_template_slug: routeTemplateSlug,
          plan_type: planType,
        },
      });
      customerId = customer.id;
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://app-abus.lovable.app";

    // Create one-time payment checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment", // One-time payment, NOT subscription
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/españa/regularizacion`,
      metadata: {
        plan_type: planType,
        route_template_slug: routeTemplateSlug,
        user_email: email,
        user_name: name,
      },
    });

    console.log("Created checkout session:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
