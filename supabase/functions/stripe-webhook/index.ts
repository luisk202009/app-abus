import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature) {
    console.error("No stripe-signature header");
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For testing without webhook secret - parse directly
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook Error: ${errMessage}`, { status: 400 });
  }

  // Initialize Supabase client with service role
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  console.log("Processing webhook event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const customerId = session.customer as string;

        console.log("Checkout completed for user:", userId);

        if (userId) {
          // Update subscription status to 'pro'
          const { data: updatedUser, error } = await supabaseAdmin
            .from("onboarding_submissions")
            .update({ 
              subscription_status: "pro",
              stripe_customer_id: customerId 
            })
            .eq("user_id", userId)
            .select("full_name, email, professional_profile")
            .maybeSingle();

          if (error) {
            console.error("Error updating subscription status:", error);
          } else {
            console.log("Successfully updated user to pro status");
            
            // Send welcome email
            if (updatedUser?.email) {
              try {
                const emailResponse = await fetch(
                  `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-welcome-email`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                    },
                    body: JSON.stringify({
                      name: updatedUser.full_name || "Usuario",
                      email: updatedUser.email,
                      visaType: updatedUser.professional_profile,
                    }),
                  }
                );
                const emailResult = await emailResponse.json();
                console.log("Welcome email sent:", emailResult);
              } catch (emailError) {
                console.error("Error sending welcome email:", emailError);
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer to find user
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;

        if (email) {
          // Find user by email in submissions
          const { data: submissions } = await supabaseAdmin
            .from("onboarding_submissions")
            .select("id")
            .eq("email", email);

          if (submissions && submissions.length > 0) {
            const status = subscription.status === "active" ? "pro" : "free";
            
            await supabaseAdmin
              .from("onboarding_submissions")
              .update({ subscription_status: status })
              .eq("email", email);

            console.log(`Updated subscription status to ${status} for ${email}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;

        if (email) {
          await supabaseAdmin
            .from("onboarding_submissions")
            .update({ subscription_status: "free" })
            .eq("email", email);

          console.log(`Subscription cancelled for ${email}`);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
