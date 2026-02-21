import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "./useSubscription";

export interface PlanFeatures {
  maxRoutes: number;
  hasDocuments: boolean;
  hasFiscalSimulator: boolean;
  hasAppointments: boolean;
  hasLifeInSpain: boolean;
  hasBusiness: boolean;
  hasReferrals: boolean;
  isLoading: boolean;
}

const DEFAULT_FEATURES: Omit<PlanFeatures, "isLoading"> = {
  maxRoutes: 1,
  hasDocuments: false,
  hasFiscalSimulator: false,
  hasAppointments: false,
  hasLifeInSpain: false,
  hasBusiness: false,
  hasReferrals: false,
};

export const usePlanFeatures = (): PlanFeatures => {
  const { subscriptionStatus, isLoading: subLoading } = useSubscription();
  const [features, setFeatures] = useState<Omit<PlanFeatures, "isLoading">>(DEFAULT_FEATURES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (subLoading) return;

    const fetchPlan = async () => {
      setIsLoading(true);
      try {
        const slug = subscriptionStatus || "free";
        const { data } = await supabase
          .from("plans")
          .select("max_routes, has_documents, has_fiscal_simulator, has_appointments, has_life_in_spain, has_business, has_referrals")
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (data) {
          setFeatures({
            maxRoutes: data.max_routes,
            hasDocuments: data.has_documents,
            hasFiscalSimulator: data.has_fiscal_simulator,
            hasAppointments: data.has_appointments,
            hasLifeInSpain: data.has_life_in_spain,
            hasBusiness: data.has_business,
            hasReferrals: data.has_referrals,
          });
        } else {
          setFeatures(DEFAULT_FEATURES);
        }
      } catch (error) {
        console.error("Error fetching plan features:", error);
        setFeatures(DEFAULT_FEATURES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [subscriptionStatus, subLoading]);

  return { ...features, isLoading };
};
