import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Referral {
  id: string;
  referred_name: string | null;
  status: string;
  reward_amount: number;
  created_at: string;
}

interface UseReferralReturn {
  code: string | null;
  referrals: Referral[];
  totalInvited: number;
  totalEarned: number;
  isLoading: boolean;
  generateCode: () => Promise<void>;
}

function createCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const useReferral = (): UseReferralReturn => {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch existing code
      const { data: codeData } = await supabase
        .from("referral_codes" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (codeData) {
        setCode((codeData as any).code);

        // Fetch referrals
        const { data: refData } = await supabase
          .from("referrals" as any)
          .select("*")
          .eq("referrer_id", (codeData as any).id)
          .order("created_at", { ascending: false });

        if (refData) {
          setReferrals(refData as any[]);
        }
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateCode = useCallback(async () => {
    if (!user) return;

    const newCode = createCode();

    try {
      const { data, error } = await supabase
        .from("referral_codes" as any)
        .insert({ user_id: user.id, code: newCode } as any)
        .select()
        .single();

      if (error) {
        // If unique constraint violation, retry
        if (error.code === "23505") {
          return generateCode();
        }
        throw error;
      }

      setCode((data as any).code);
    } catch (error) {
      console.error("Error generating referral code:", error);
    }
  }, [user]);

  const totalInvited = referrals.length;
  const totalEarned = referrals
    .filter((r) => r.status === "completado")
    .reduce((sum, r) => sum + r.reward_amount, 0);

  return {
    code,
    referrals,
    totalInvited,
    totalEarned,
    isLoading,
    generateCode,
  };
};
