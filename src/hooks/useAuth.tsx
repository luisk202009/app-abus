import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SignUpOptions {
  /** Si true, intenta iniciar sesión inmediatamente tras el signup
   *  para no depender de la confirmación de email (usado en flujo de pago). */
  autoLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isPartner: boolean;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPartner, setIsPartner] = useState(false);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) {
        supabase.from("partners").select("id").eq("user_id", session.user.id).maybeSingle()
          .then(({ data }) => setIsPartner(!!data));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    options?: SignUpOptions
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });

    if (error) return { error };

    // Si no hay sesión activa (email confirmation requerida) y nos pidieron
    // autoLogin, intentamos iniciar sesión con la contraseña recién creada.
    // Esto permite continuar al checkout sin esperar al correo.
    if (options?.autoLogin && !data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      // Ignoramos "email not confirmed": en ese caso devolvemos null para que
      // el flujo siga (el llamador decide cómo manejarlo).
      if (signInError && !signInError.message?.toLowerCase().includes("email not confirmed")) {
        return { error: signInError };
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Error during signOut:", error);
    }
    // Force clear state regardless
    setUser(null);
    setSession(null);
    setIsPartner(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isPartner, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
