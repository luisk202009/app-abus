import { AlertTriangle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  routeName: string;
  isDeleting: boolean;
  isPro: boolean;
}

export const DeleteRouteModal = ({
  isOpen,
  onClose,
  onConfirm,
  routeName,
  isDeleting,
  isPro,
}: DeleteRouteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <DialogTitle className="text-xl">¿Eliminar "{routeName}"?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Esta acción es irreversible. Se eliminará todo tu progreso guardado en esta ruta.
          </DialogDescription>
        </DialogHeader>

        {!isPro && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Si estás en el Plan Gratis, no podrás iniciar otra ruta sin suscribirte a Pro.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Eliminando..." : "Eliminar ruta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
