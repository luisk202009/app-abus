import { Lock, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SlotExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isUpgrading: boolean;
}

export const SlotExhaustedModal = ({
  isOpen,
  onClose,
  onUpgrade,
  isUpgrading,
}: SlotExhaustedModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <DialogTitle className="text-xl">Has agotado tu ruta gratuita</DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-4">
            <p>
              Tu plan Free te permite iniciar <span className="font-semibold text-foreground">1 ruta de por vida</span>.
            </p>
            <p>
              Pásate al <span className="font-semibold text-primary">Plan Pro</span> por solo{" "}
              <span className="font-semibold">€9,99/mes</span> para:
            </p>
            <ul className="text-left space-y-2 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Explorar nuevos destinos migratorios
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Gestionar hasta 3 procesos simultáneamente
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Acceder a recursos premium y documentos
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={onUpgrade} disabled={isUpgrading} className="gap-2">
            <Crown className="w-4 h-4" />
            {isUpgrading ? "Procesando..." : "Mejorar a Pro - €9,99/mes"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
