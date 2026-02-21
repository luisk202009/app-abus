import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAdminMode } from "@/contexts/AdminModeContext";

export type SubscriptionStatus = "free" | "pro" | "digital" | "premium";

interface UseSubscriptionReturn {
  subscriptionStatus: SubscriptionStatus;
  isLoading: boolean;
  isPremium: boolean;
  handleCheckout: () => Promise<void>;
  isCheckoutLoading: boolean;
  maxRoutes: number;
}

// Helper to check if status grants premium features
const isPremiumStatus = (status: SubscriptionStatus): boolean => {
  return status === "pro" || status === "digital" || status === "premium";
};

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin, testMode, effectiveIsPremium, effectiveMaxRoutes, isTestingAsUser } = useAdminMode();
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

  const handleCheckout = async (referralCode?: string) => {
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
            ...(referralCode ? { referralCode } : {}),
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error("Checkout server response:", data);
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      const rawMessage = error?.message || "Error desconocido";
      console.error("Error en checkout:", rawMessage, error);
      toast({
        variant: "destructive",
        title: "Error de pago",
        description: rawMessage,
      });
    } finally {
    setIsCheckoutLoading(false);
    }
  };

  // If admin, always use effective values from context (for testing different modes)
  const realIsPremium = isPremiumStatus(subscriptionStatus);
  const isPremium = isAdmin ? effectiveIsPremium : realIsPremium;
  const maxRoutes = isAdmin ? effectiveMaxRoutes : (realIsPremium ? 3 : 1);

  return {
    subscriptionStatus: isTestingAsUser ? (testMode === "pro" ? "pro" : "free") : subscriptionStatus,
    isLoading,
    isPremium,
    handleCheckout,
    isCheckoutLoading,
    maxRoutes,
  };
};
