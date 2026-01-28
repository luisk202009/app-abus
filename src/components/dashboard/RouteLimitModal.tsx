import { Crown, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RouteLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimit: number;
  onUpgrade: () => void;
  isUpgrading: boolean;
}

export const RouteLimitModal = ({
  isOpen,
  onClose,
  currentLimit,
  onUpgrade,
  isUpgrading,
}: RouteLimitModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Límite de rutas alcanzado</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Tu plan actual solo permite{" "}
            <span className="font-semibold text-foreground">
              {currentLimit} ruta{currentLimit > 1 ? "s" : ""} activa
              {currentLimit > 1 ? "s" : ""}
            </span>
            .
            <br />
            <br />
            Mejora a <span className="font-semibold text-primary">Pro</span> para
            gestionar hasta <span className="font-semibold">3 rutas simultáneas</span>{" "}
            y acceder a todas las funciones premium.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={onUpgrade} disabled={isUpgrading} className="gap-2">
            <Crown className="w-4 h-4" />
            {isUpgrading ? "Procesando..." : "Mejorar a Pro"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
