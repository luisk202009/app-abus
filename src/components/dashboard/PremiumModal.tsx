import { Crown, X, Check, Shield, Sparkles, FileCheck } from "lucide-react";
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
}

const premiumFeatures = [
  { icon: Shield, label: "Almacenamiento seguro de documentos" },
  { icon: FileCheck, label: "Revisión automática de documentos" },
  { icon: Sparkles, label: "Asistente IA personalizado" },
];

export const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  const handleViewPlans = () => {
    // Future: Navigate to pricing page or open Stripe checkout
    onClose();
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
            Función Premium
          </DialogTitle>
          <DialogDescription className="text-base">
            Organiza y valida tus documentos con Albus Pro. Suscríbete para
            desbloquear el almacenamiento seguro y la revisión automática.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {premiumFeatures.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Button
            className="w-full gap-2"
            onClick={handleViewPlans}
          >
            <Crown className="w-4 h-4" />
            Ver Planes Pro
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={onClose}
          >
            Quizás más tarde
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
