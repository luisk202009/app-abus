import { Lock, Crown, Check, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlotExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Recibe el plan elegido por el usuario ("pro" o "premium"). */
  onUpgrade: (planType: "pro" | "premium") => void | Promise<void>;
  isUpgrading: boolean;
}

interface PlanCard {
  id: "pro" | "premium";
  name: string;
  price: string;
  badge?: string;
  highlighted?: boolean;
  features: string[];
}

const PLANS: PlanCard[] = [
  {
    id: "pro",
    name: "Plan Pro",
    price: "€9,99/mes",
    features: [
      "Hasta 3 procesos simultáneos",
      "Document Vault (La Bóveda)",
      "Soporte prioritario",
      "Acceso a recursos premium",
    ],
  },
  {
    id: "premium",
    name: "Plan Premium",
    price: "€19,99/mes",
    badge: "Recomendado",
    highlighted: true,
    features: [
      "Todo del Plan Pro",
      "Revisión humana de documentos",
      "Pre-check antes de presentar",
      "Asistente IA personalizado",
    ],
  },
];

export const SlotExhaustedModal = ({
  isOpen,
  onClose,
  onUpgrade,
  isUpgrading,
}: SlotExhaustedModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <DialogTitle className="text-xl">Has agotado tu ruta gratuita</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Tu plan Free permite iniciar{" "}
            <span className="font-semibold text-foreground">1 ruta de por vida</span>.
            Elige un plan para gestionar más procesos:
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border p-5 flex flex-col gap-4 transition",
                plan.highlighted
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  {plan.badge && (
                    <span className="text-[10px] uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold">{plan.price}</p>
              </div>

              <ul className="space-y-2 text-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => onUpgrade(plan.id)}
                disabled={isUpgrading}
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full gap-2"
              >
                {plan.highlighted ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <Crown className="w-4 h-4" />
                )}
                {isUpgrading ? "Procesando..." : `Elegir ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-2">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
            Entendido, seguir como Free
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
