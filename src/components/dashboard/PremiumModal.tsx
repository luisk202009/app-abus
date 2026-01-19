import { Crown, Shield, Sparkles, FileCheck, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import isotipoAlbus from "@/assets/isotipo-albus.png";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => Promise<void>;
  isCheckoutLoading?: boolean;
}

const premiumFeatures = [
  { icon: Shield, label: "Almacenamiento seguro de documentos" },
  { icon: FileCheck, label: "Revisión automática de documentos" },
  { icon: FileText, label: "Genera tus formularios de tasa 790 listos para imprimir" },
  { icon: Sparkles, label: "Asistente IA personalizado" },
];

export const PremiumModal = ({ 
  isOpen, 
  onClose, 
  onCheckout,
  isCheckoutLoading = false 
}: PremiumModalProps) => {
  const handleViewPlans = async () => {
    if (onCheckout) {
      await onCheckout();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img src={isotipoAlbus} alt="Albus" className="h-12 w-12" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold">
            Desbloquea el Almacenamiento Seguro
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Con Albus Pro, puedes organizar tus documentos, recibir revisiones automáticas y generar tus formularios de tasa 790 listos para imprimir.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {premiumFeatures.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Button
            className="w-full gap-2 h-12 text-base"
            onClick={handleViewPlans}
            disabled={isCheckoutLoading}
          >
            {isCheckoutLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Ver planes Pro"
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onClose}
            disabled={isCheckoutLoading}
          >
            Quizás más tarde
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
