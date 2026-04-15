import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import albusLogo from "@/assets/albus-logo.png";

const Success = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isProcessing, setIsProcessing] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [isRegularizacion, setIsRegularizacion] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        setIsProcessing(false);
        return;
      }

      try {
        // Get pending registration data (from old one-time flow)
        const pendingData = localStorage.getItem("pending_registration");
        
        if (pendingData) {
          const { name, email, planType: pt, routeTemplateSlug } = JSON.parse(pendingData);
          setPlanType(pt);
          if (routeTemplateSlug === "regularizacion-2026") {
            setIsRegularizacion(true);
          }

          // Check if user exists with this email
          const { data: existingUser } = await supabase
            .from("onboarding_submissions")
            .select("id, user_id")
            .eq("email", email)
            .maybeSingle();

          if (!existingUser) {
            await supabase
              .from("onboarding_submissions")
              .insert({
                email,
                full_name: name,
                subscription_status: pt === "premium" ? "premium" : "pro",
                ...(user ? { user_id: user.id } : {}),
              });
          } else {
            await supabase
              .from("onboarding_submissions")
              .update({
                subscription_status: pt === "premium" ? "premium" : "pro",
                ...(user && !existingUser.user_id ? { user_id: user.id } : {}),
              })
              .eq("id", existingUser.id);
          }

          localStorage.removeItem("pending_registration");
          
          // Store source for dashboard auto-activation
          if (routeTemplateSlug) {
            const sourceMap: Record<string, string> = {
              "regularizacion-2026": "reg2026",
              "arraigo-social": "arraigos",
              "arraigo-laboral": "arraigos",
              "arraigo-formativo": "arraigos",
            };
            const source = sourceMap[routeTemplateSlug];
            if (source) {
              localStorage.setItem("onboarding_source", source);
            }
          }
        } else if (user) {
          // Subscription flow (create-checkout) - user is already authenticated
          // Update their onboarding_submissions with new status
          const { data: submission } = await supabase
            .from("onboarding_submissions")
            .select("id, subscription_status")
            .eq("user_id", user.id)
            .maybeSingle();

          if (submission) {
            await supabase
              .from("onboarding_submissions")
              .update({ subscription_status: "pro" })
              .eq("id", submission.id);
            setPlanType("pro");
          } else {
            // Create submission if none exists
            await supabase
              .from("onboarding_submissions")
              .insert({
                user_id: user.id,
                email: user.email,
                subscription_status: "pro",
              });
            setPlanType("pro");
          }
        }

        console.log("Payment successful, session:", sessionId);
      } catch (error) {
        console.error("Error processing payment:", error);
        toast({
          title: "Error al procesar",
          description: "Hubo un problema, pero tu pago fue recibido. Contacta soporte.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [sessionId, toast, user]);

  const isPremium = planType === "premium";

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Procesando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo and Badge */}
        <div className="flex flex-col items-center gap-4">
          <img src={albusLogo} alt="Albus" className="h-10" />
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isPremium 
              ? "bg-amber-400 text-amber-950" 
              : "bg-primary text-primary-foreground"
          }`}>
            <Crown className="w-4 h-4" />
            {isPremium ? "Premium" : "Pro"}
          </div>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            ¡Bienvenido a Albus {isPremium ? "Premium" : "Pro"}!
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {isPremium 
              ? "Tu Plan Premium está activo. Tienes acceso completo a todas las funcionalidades."
              : "Tu Plan Pro está activo. Ya puedes comenzar tu trámite."}
          </p>
        </div>

        {/* Features List */}
        <div className="bg-secondary/50 rounded-xl p-6 text-left space-y-3">
          <p className="text-sm font-medium text-foreground">Tu plan incluye:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              Guía paso a paso completa
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              Bóveda de documentos segura
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              Rutas de Regularización y Arraigos
            </li>
            {isPremium && (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  Revisión humana de documentos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  Soporte prioritario
                </li>
              </>
            )}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold gap-2"
          onClick={() => navigate("/dashboard")}
        >
          Empezar mi trámite ahora
        </Button>

        {/* Help text */}
        <p className="text-xs text-muted-foreground">
          ¿Tienes alguna pregunta? Contacta con{" "}
          <a href="mailto:soporte@albus.com" className="underline hover:text-foreground">
            soporte@albus.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default Success;
