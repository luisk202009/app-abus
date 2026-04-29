import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Shield, Sparkles, Loader2 } from "lucide-react";
import { PricingCard } from "./PricingCard";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PRICES } from "@/lib/documentConfig";

export type RouteType = "regularizacion2026" | "arraigo_social" | "arraigo_laboral" | "arraigo_formativo";

interface QualificationSuccessProps {
  routeType: RouteType;
  onClose: () => void;
}

const PLANS_SUBSCRIPTION = [
  {
    id: "pro" as const,
    name: "Plan Pro",
    price: 9.99,
    priceId: STRIPE_PRICES.pro.priceId,
    features: [
      "Acceso a rutas Regularización 2026 y Arraigos",
      "Document Vault (La Bóveda)",
      "Soporte Prioritario",
      "Base de datos de abogados (Coming Soon)",
    ],
    highlighted: false,
    isSubscription: true,
  },
  {
    id: "premium" as const,
    name: "Plan Premium",
    price: 19.99,
    priceId: STRIPE_PRICES.premium.priceId,
    features: [
      "Todo del Plan Pro",
      "Revisión humana de documentos",
      "Pre-check antes de presentar solicitud",
      "Asistente IA personalizado",
    ],
    highlighted: true,
    badge: "Recomendado",
    isSubscription: true,
  },
];

const PLANS_REG2026 = [
  {
    id: "pro" as const,
    name: "Regularización Pro",
    price: 9.99,
    priceId: STRIPE_PRICES.regularizacion2026.pro.priceId,
    features: [
      "Guía paso a paso Regularización 2026",
      "Document Vault (La Bóveda)",
      "Soporte Prioritario",
      "Base de datos de abogados (Coming Soon)",
    ],
    highlighted: false,
    isSubscription: false,
    contextLine: "Acceso hasta julio 2026 · Sin renovación automática",
  },
  {
    id: "premium" as const,
    name: "Regularización Premium",
    price: 19.99,
    priceId: STRIPE_PRICES.regularizacion2026.premium.priceId,
    features: [
      "Todo del Plan Pro",
      "Revisión humana de documentos",
      "Pre-check antes de presentar solicitud",
      "Asistente IA personalizado",
    ],
    highlighted: true,
    badge: "Recomendado",
    isSubscription: false,
    contextLine: "Acceso hasta julio 2026 · Sin renovación automática",
  },
];

const ROUTE_SOURCE_MAP: Record<RouteType, string> = {
  regularizacion2026: "reg2026",
  arraigo_social: "arraigos",
  arraigo_laboral: "arraigos",
  arraigo_formativo: "arraigos",
};

export const QualificationSuccess = ({ routeType, onClose }: QualificationSuccessProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isReg2026 = routeType === "regularizacion2026";
  const plans = isReg2026 ? PLANS_REG2026 : PLANS_SUBSCRIPTION;

  const [selectedPlan, setSelectedPlan] = useState<typeof plans[number] | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  // Bandera: cuando volvamos de signup, esperamos a que useAuth tenga user para disparar checkout
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);

  const handleSelectPlan = (planId: "pro" | "premium") => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setSelectedPlan(plan);

    if (user) {
      initiateCheckout(plan);
    } else {
      setShowAuthModal(true);
    }
  };

  // Cuando el usuario se autentica tras el modal, dispara el checkout automáticamente
  useEffect(() => {
    if (pendingCheckoutAfterAuth && user && selectedPlan) {
      setPendingCheckoutAfterAuth(false);
      initiateCheckout(selectedPlan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCheckoutAfterAuth, user]);

  const initiateCheckout = async (plan: typeof plans[number]) => {
    setIsCheckoutLoading(true);

    const source = ROUTE_SOURCE_MAP[routeType];
    localStorage.setItem("onboarding_source", source);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast({
          title: "Sesión expirada",
          description: "Por favor inicia sesión de nuevo.",
          variant: "destructive",
        });
        setIsCheckoutLoading(false);
        return;
      }

      const endpoint = isReg2026 ? "create-one-time-payment" : "create-checkout";

      const response = await fetch(
        `https://uidwcgxbybjpbteowrnh.supabase.co/functions/v1/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(
            isReg2026
              ? {
                  priceId: plan.priceId,
                  email: user!.email,
                  name: user!.user_metadata?.full_name || user!.email,
                  routeTemplateSlug: "regularizacion-2026",
                  planType: plan.id,
                }
              : {
                  returnUrl: window.location.origin,
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        // Si tenemos pending_payment_id devuelto, llevar al dashboard con alerta
        if (isReg2026 && data.pending_payment_id) {
          toast({
            title: "No pudimos iniciar el pago",
            description:
              "Tu cuenta está creada. Te llevamos al panel para reintentar el pago.",
            variant: "destructive",
          });
          navigate(`/dashboard?pending_payment=${data.pending_payment_id}&payment_error=1`);
          onClose();
          return;
        }
        throw new Error(data.error || "Error desconocido");
      }

      if (data.url) {
        window.open(data.url, "_blank");
        // Para Reg2026: además llevar al dashboard con alerta de pago pendiente
        if (isReg2026 && data.pending_payment_id) {
          navigate(`/dashboard?pending_payment=${data.pending_payment_id}`);
          onClose();
        }
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Error de pago",
        description: error.message || "No se pudo iniciar el checkout.",
        variant: "destructive",
      });
      // Llevar al dashboard si la cuenta ya existe
      if (isReg2026 && user) {
        navigate(`/dashboard?payment_error=1`);
        onClose();
      }
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Esperar a que useAuth refleje el usuario antes de iniciar checkout
    setPendingCheckoutAfterAuth(true);
  };

  return (
    <>
      <div className="space-y-8 py-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">¡Perfil Validado!</h2>
            <p className="text-muted-foreground">
              Tienes el <span className="font-semibold text-foreground">95% de éxito</span> para obtener tu residencia en España.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>

        {(isCheckoutLoading || pendingCheckoutAfterAuth) && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Iniciando checkout...</span>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Pago seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Garantía 7 días</span>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedPlan(null);
          setPendingCheckoutAfterAuth(false);
        }}
        onSuccess={handleAuthSuccess}
        allowUnconfirmed
      />
    </>
  );
};
