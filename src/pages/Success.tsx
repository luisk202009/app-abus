import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import albusLogo from "@/assets/albus-logo.png";

const Success = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isProcessing, setIsProcessing] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        setIsProcessing(false);
        return;
      }

      try {
        // Get pending registration data
        const pendingData = localStorage.getItem("pending_registration");
        
        if (pendingData) {
          const { name, email, planType, routeTemplateSlug } = JSON.parse(pendingData);
          setPlanType(planType);

          // Check if user exists with this email
          const { data: existingUser } = await supabase
            .from("onboarding_submissions")
            .select("id, user_id")
            .eq("email", email)
            .maybeSingle();

          if (!existingUser) {
            // Create new onboarding submission for this purchase
            const { error: insertError } = await supabase
              .from("onboarding_submissions")
              .insert({
                email,
                full_name: name,
                subscription_status: planType === "premium" ? "premium" : "digital",
              });

            if (insertError) {
              console.error("Error creating submission:", insertError);
            }
          } else {
            // Update existing submission
            await supabase
              .from("onboarding_submissions")
              .update({
                subscription_status: planType === "premium" ? "premium" : "digital",
              })
              .eq("email", email);
          }

          // Clear pending registration
          localStorage.removeItem("pending_registration");
          
          // Store success info for dashboard
          localStorage.setItem("payment_success", JSON.stringify({
            planType,
            routeTemplateSlug,
            timestamp: Date.now(),
          }));
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
  }, [sessionId, toast]);

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
            {isPremium ? "Premium" : "Digital"}
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
            ¡Gracias por tu compra!
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {isPremium 
              ? "Tu Plan Premium está activo. Tienes acceso completo a todas las funcionalidades."
              : "Tu Plan Digital está activo. Ya puedes comenzar tu trámite."}
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
              Generador de Tasa 790-052
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              Checklist de documentos personalizado
            </li>
            {isPremium && (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  Revisión humana de documentos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  Carga en plataforma Mercurio
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
