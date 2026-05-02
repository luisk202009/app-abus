import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import albusLogo from "@/assets/albus-logo.png";

/**
 * Página de aterrizaje para enlaces de invitación / recuperación.
 * Maneja: type=invite, type=recovery, type=magiclink, type=signup.
 * Si el enlace incluye token de invitación, exige definir contraseña antes
 * de redirigir al portal correspondiente (abogado o dashboard).
 */
const AcceptInvitation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sessionReady, setSessionReady] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Detectar tipo del hash del enlace
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    const errorDescription = params.get("error_description");

    if (errorDescription) {
      setHasError(decodeURIComponent(errorDescription).replace(/\+/g, " "));
    }

    // magic link / signup → no requiere contraseña, solo redirigir
    if (type === "magiclink" || type === "signup") {
      setNeedsPassword(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSessionReady(true);
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Si no requiere contraseña y la sesión está lista → redirigir directo
  useEffect(() => {
    if (sessionReady && !needsPassword && !success) {
      redirectByRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady, needsPassword]);

  const redirectByRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/", { replace: true });
        return;
      }
      const { data: lawyer } = await supabase
        .from("lawyers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (lawyer) {
        navigate("/portal-abogado", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 8 caracteres.", variant: "destructive" });
      return;
    }
    if (!sessionReady) {
      toast({ title: "Espera un momento", description: "Estamos validando tu invitación...", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "¡Cuenta activada!", description: "Tu contraseña ha sido configurada." });
      setTimeout(() => redirectByRole(), 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo configurar la contraseña.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <img src={albusLogo} alt="Albus" className="h-8 w-auto mx-auto" />
          <h1 className="text-xl font-semibold">Enlace inválido o expirado</h1>
          <p className="text-muted-foreground text-sm">{hasError}</p>
          <p className="text-muted-foreground text-sm">
            Solicita una nueva invitación al administrador en{" "}
            <a href="mailto:l@albus.com.co" className="underline">l@albus.com.co</a>.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">Volver al inicio</Button>
        </div>
      </div>
    );
  }

  if (!needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-7 w-7 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Iniciando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src={albusLogo} alt="Albus" className="h-8 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-bold tracking-tight">
            {success ? "¡Bienvenido!" : "Configura tu contraseña"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {success
              ? "Tu cuenta está lista. Redirigiéndote..."
              : "Define una contraseña segura para acceder a tu cuenta de Albus."}
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!sessionReady && (
              <div className="text-xs text-muted-foreground text-center">
                Validando enlace de invitación...
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !sessionReady}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activando cuenta...
                </>
              ) : (
                "Activar cuenta"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitation;
