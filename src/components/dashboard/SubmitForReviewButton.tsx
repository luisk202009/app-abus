import { Send, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitForReviewButtonProps {
  allValid: boolean;
  isPremium: boolean;
  onSubmit: () => void;
  onPremiumRequired: () => void;
  isSubmitting?: boolean;
}

export const SubmitForReviewButton = ({
  allValid,
  isPremium,
  onSubmit,
  onPremiumRequired,
  isSubmitting = false,
}: SubmitForReviewButtonProps) => {
  const isDisabled = !allValid || isSubmitting;

  const handleClick = () => {
    if (!isPremium) {
      onPremiumRequired();
      return;
    }
    if (allValid) {
      onSubmit();
    }
  };

  return (
    <div
      className={cn(
        "p-5 rounded-xl border transition-all",
        allValid
          ? "bg-green-50 border-green-200"
          : "bg-muted/30 border-border"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {allValid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
            <h3 className="font-semibold">
              {allValid ? "¡Listo para enviar!" : "Documentos pendientes"}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {allValid
              ? "Todos los documentos han sido validados correctamente."
              : "Completa todos los documentos requeridos para enviar a revisión."}
          </p>
        </div>

        <Button
          onClick={handleClick}
          disabled={isDisabled && isPremium}
          className={cn(
            "gap-2 shrink-0",
            allValid && "bg-green-600 hover:bg-green-700"
          )}
        >
          <Send className="w-4 h-4" />
          Enviar a Revisión
        </Button>
      </div>
    </div>
  );
};
