import { useState, useEffect } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import albusLogo from "@/assets/albus-logo.png";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  leadId?: string;
  onSuccess?: () => void;
  defaultMode?: "signup" | "login";
}

export const AuthModal = ({
  isOpen,
  onClose,
  defaultEmail = "",
  leadId,
  onSuccess,
  defaultMode = "signup",
}: AuthModalProps) => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"signup" | "login" | "forgot" | "magiclink">(defaultMode);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Sync mode with defaultMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailNotConfirmed, setShowEmailNotConfirmed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Reset email when defaultEmail changes
  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password);
        
        // Check for duplicate email error
        if (error) {
          const errorMessage = error.message?.toLowerCase() || "";
          
          if (
            errorMessage.includes("already registered") ||
            errorMessage.includes("already exists") ||
            errorMessage.includes("user already registered")
          ) {
            toast({
              title: "Ya tienes una cuenta",
              description: "Redirigiéndote al inicio de sesión...",
            });
            
            // Switch to login mode after a short delay
            setTimeout(() => {
              setMode("login");
              setPassword("");
            }, 1500);
            
            setIsLoading(false);
            return;
          }
          
          throw error;
        }

        // Link the lead to the new user if leadId exists
        if (leadId) {
          // Wait a moment for the auth to complete
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("onboarding_submissions")
              .update({ user_id: user.id })
              .eq("id", leadId);
          }
        }

        toast({
          title: "¡Registro completado con éxito!",
          description: "Tus datos han sido guardados. Revisa tu email para confirmar tu cuenta.",
        });

        onSuccess?.();
        onClose();
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          const errorMessage = error.message?.toLowerCase() || "";
          
          // Handle email not confirmed error
          if (errorMessage.includes("email not confirmed")) {
            setShowEmailNotConfirmed(true);
            setIsLoading(false);
            return;
          }
          
          throw error;
        }

        toast({
          title: "¡Bienvenido de vuelta!",
          description: "Has iniciado sesión correctamente.",
        });

        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.",
      });
      setShowEmailNotConfirmed(false);
    } catch (error: any) {
      console.error("Resend error:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el email. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el enlace.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={albusLogo} alt="Albus" className="h-8 w-auto" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {mode === "signup" ? "Crea tu cuenta" : mode === "login" ? "Inicia sesión" : mode === "forgot" ? "Recuperar contraseña" : "Acceso sin contraseña"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Guarda tu progreso y accede a tu hoja de ruta personalizada"
              : mode === "login"
              ? "Accede a tu cuenta de Albus"
              : mode === "forgot"
              ? "Te enviaremos un enlace para restablecer tu contraseña"
              : "Te enviaremos un enlace mágico a tu email para iniciar sesión"}
          </DialogDescription>
        </DialogHeader>

        {showEmailNotConfirmed ? (
          <div className="space-y-4 mt-4 text-center">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <Mail className="h-10 w-10 mx-auto text-amber-600 dark:text-amber-400 mb-3" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Email no confirmado
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                Revisa tu bandeja de entrada en <strong>{email}</strong> y haz clic en el enlace de confirmación para activar tu cuenta.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleResendConfirmation} 
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Reenviar email de confirmación"
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowEmailNotConfirmed(false)}
                  className="w-full"
                >
                  Volver a intentar
                </Button>
              </div>
            </div>
          </div>
        ) : mode === "magiclink" ? (
          magicLinkSent ? (
            <div className="space-y-4 mt-4 text-center">
              <div className="p-4 bg-muted border border-border rounded-lg">
                <Mail className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">¡Enlace enviado!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Revisa tu bandeja de entrada en <strong>{email}</strong> y haz clic en el enlace para acceder.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setMode("login"); setMagicLinkSent(false); }}
                >
                  Volver a iniciar sesión
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace mágico"
                )}
              </Button>
            </form>
          )
        ) : mode === "forgot" ? (
          forgotSent ? (
            <div className="space-y-4 mt-4 text-center">
              <div className="p-4 bg-muted border border-border rounded-lg">
                <Mail className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">¡Email enviado!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Revisa tu bandeja de entrada en <strong>{email}</strong> y haz clic en el enlace para restablecer tu contraseña.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setMode("login"); setForgotSent(false); }}
                >
                  Volver a iniciar sesión
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </Button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "signup" ? "Creando cuenta..." : "Iniciando sesión..."}
                </>
              ) : mode === "signup" ? (
                "Crear cuenta"
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            {mode === "login" && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setMode("magiclink")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Acceder con enlace mágico
              </Button>
            )}
          </form>
        )}

        {mode !== "forgot" && mode !== "magiclink" && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-medium text-foreground hover:underline"
                >
                  Inicia sesión
                </button>
              </>
            ) : (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-medium text-foreground hover:underline"
                >
                  Regístrate
                </button>
              </>
            )}
          </div>
        )}
        {(mode === "forgot" && !forgotSent) || (mode === "magiclink" && !magicLinkSent) ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-medium text-foreground hover:underline"
            >
              Volver a iniciar sesión
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
