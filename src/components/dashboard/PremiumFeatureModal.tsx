import { Lock, Shield, FileCheck, Sparkles, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { STRIPE_PRICES } from "@/lib/documentConfig";

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (priceId: string) => void;
  isLoading?: boolean;
  feature?: string;
}

const features = [
  {
    icon: FileCheck,
    title: "Document Vault",
    description: "Almacena y organiza todos tus documentos de forma segura",
  },
  {
    icon: Sparkles,
    title: "Validación IA",
    description: "Análisis automático de documentos para evitar errores",
  },
  {
    icon: Shield,
    title: "Soporte Prioritario",
    description: "Atención preferente para resolver tus dudas",
  },
  {
    icon: Crown,
    title: "Base de Abogados",
    description: "Acceso a nuestra red de abogados especializados (Coming Soon)",
  },
];

export const PremiumFeatureModal = ({
  isOpen,
  onClose,
  onUpgrade,
  isLoading = false,
  feature = "esta función",
}: PremiumFeatureModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Función Premium</DialogTitle>
          <DialogDescription className="text-base">
            Para acceder a {feature}, necesitas el Plan Pro o Premium.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Features */}
          <div className="space-y-3">
            {features.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Options */}
          <div className="grid gap-3">
            {/* Pro Plan */}
            <button
              onClick={() => onUpgrade(STRIPE_PRICES.pro.priceId)}
              disabled={isLoading}
              className="w-full p-4 border border-border rounded-xl hover:border-primary/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{STRIPE_PRICES.pro.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Acceso a rutas premium y Document Vault
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{STRIPE_PRICES.pro.price}€</p>
                  <p className="text-xs text-muted-foreground">/mes</p>
                </div>
              </div>
            </button>

            {/* Premium Plan */}
            <button
              onClick={() => onUpgrade(STRIPE_PRICES.premium.priceId)}
              disabled={isLoading}
              className="w-full p-4 border-2 border-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-all text-left relative"
            >
              <div className="absolute -top-2.5 left-4">
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-400 text-amber-950 rounded-full">
                  Recomendado
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-semibold">{STRIPE_PRICES.premium.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Todo del Pro + revisión humana y pre-check
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    {STRIPE_PRICES.premium.price}€
                  </p>
                  <p className="text-xs text-muted-foreground">/mes</p>
                </div>
              </div>
            </button>
          </div>

          {/* Cancel */}
          <Button variant="ghost" onClick={onClose} className="w-full">
            Ahora no
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
