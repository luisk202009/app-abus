import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export type SubscriptionStatus = "free" | "pro";

interface UseSubscriptionReturn {
  subscriptionStatus: SubscriptionStatus;
  isLoading: boolean;
  isPremium: boolean;
  handleCheckout: () => Promise<void>;
  isCheckoutLoading: boolean;
  maxRoutes: number;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) {
        setSubscriptionStatus("free");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("onboarding_submissions")
          .select("subscription_status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching subscription:", error);
          setSubscriptionStatus("free");
        } else {
          setSubscriptionStatus((data?.subscription_status as SubscriptionStatus) || "free");
        }
      } catch (error) {
        console.error("Error:", error);
        setSubscriptionStatus("free");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para suscribirte.",
      });
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        "https://uidwcgxbybjpbteowrnh.supabase.co/functions/v1/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            returnUrl: window.location.origin,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el proceso de pago. Intenta de nuevo.",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const isPremium = subscriptionStatus === "pro";

  return {
    subscriptionStatus,
    isLoading,
    isPremium,
    handleCheckout,
    isCheckoutLoading,
    maxRoutes: isPremium ? 3 : 1,
  };
};
