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
import isotipoAlbus from "@/assets/isotipo-albus.png";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  leadId?: string;
  onSuccess?: () => void;
}

export const AuthModal = ({
  isOpen,
  onClose,
  defaultEmail = "",
  leadId,
  onSuccess,
}: AuthModalProps) => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        if (error) throw error;

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={isotipoAlbus} alt="Albus" className="h-10 w-10" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {mode === "signup" ? "Crea tu cuenta" : "Inicia sesión"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Guarda tu progreso y accede a tu hoja de ruta personalizada"
              : "Accede a tu cuenta de Albus"}
          </DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="password">Contraseña</Label>
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
        </form>

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
      </DialogContent>
    </Dialog>
  );
};
