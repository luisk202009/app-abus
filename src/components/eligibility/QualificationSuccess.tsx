import { useState } from "react";
import { CheckCircle, Shield, Sparkles } from "lucide-react";
import { PricingCard } from "./PricingCard";
import { RegistrationModal } from "./RegistrationModal";

export type RouteType = "regularizacion2026" | "arraigo_social" | "arraigo_laboral" | "arraigo_formativo";

interface QualificationSuccessProps {
  routeType: RouteType;
  onClose: () => void;
}

const PLANS = [
  {
    id: "pro" as const,
    name: "Plan Pro",
    price: 9.99,
    priceId: "price_1SwlHBGVNlA5jALg4s8gArUM",
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
    priceId: "price_1SwlHgGVNlA5jALgqLsLJbSD",
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

const ROUTE_TEMPLATE_MAP: Record<RouteType, string> = {
  regularizacion2026: "regularizacion-2026",
  arraigo_social: "arraigo-social",
  arraigo_laboral: "arraigo-laboral",
  arraigo_formativo: "arraigo-formativo",
};

export const QualificationSuccess = ({ routeType, onClose }: QualificationSuccessProps) => {
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[number] | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleSelectPlan = (planId: "pro" | "premium") => {
    const plan = PLANS.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setShowRegistration(true);
    }
  };

  const handleRegistrationClose = () => {
    setShowRegistration(false);
    setSelectedPlan(null);
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
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>

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

      {/* Registration Modal */}
      {selectedPlan && (
        <RegistrationModal
          isOpen={showRegistration}
          onClose={handleRegistrationClose}
          plan={selectedPlan}
          routeType={routeType}
          routeTemplateSlug={ROUTE_TEMPLATE_MAP[routeType]}
        />
      )}
    </>
  );
};
