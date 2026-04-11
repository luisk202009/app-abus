import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type TestMode = "admin" | "free" | "pro";

const ADMIN_MODE_KEY = "albus_admin_test_mode";

interface AdminModeContextType {
  isAdmin: boolean;
  testMode: TestMode;
  setTestMode: (mode: TestMode) => void;
  effectiveIsPremium: boolean;
  effectiveMaxRoutes: number;
  isTestingAsUser: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export const AdminModeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const [testMode, setTestModeState] = useState<TestMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(ADMIN_MODE_KEY);
      if (saved === "free" || saved === "pro" || saved === "admin") {
        return saved;
      }
    }
    return "admin";
  });

  // Persist to localStorage
  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem(ADMIN_MODE_KEY, testMode);
    }
  }, [testMode, isAdmin]);

  const setTestMode = (mode: TestMode) => {
    if (isAdmin) {
      setTestModeState(mode);
    }
  };

  // Calculate effective values based on test mode
  const isTestingAsUser = isAdmin && testMode !== "admin";
  const effectiveIsPremium = isAdmin
    ? testMode === "admin" || testMode === "pro"
    : false; // For non-admin, this will be overridden by actual subscription
  const effectiveMaxRoutes = isAdmin
    ? testMode === "admin"
      ? 999 // Unlimited for admin mode
      : testMode === "pro"
      ? 3
      : 1
    : 1; // For non-admin, this will be overridden by actual subscription

  return (
    <AdminModeContext.Provider
      value={{
        isAdmin,
        testMode,
        setTestMode,
        effectiveIsPremium,
        effectiveMaxRoutes,
        isTestingAsUser,
      }}
    >
      {children}
    </AdminModeContext.Provider>
  );
};

export const useAdminMode = (): AdminModeContextType => {
  const context = useContext(AdminModeContext);
  if (context === undefined) {
    throw new Error("useAdminMode must be used within an AdminModeProvider");
  }
  return context;
};
