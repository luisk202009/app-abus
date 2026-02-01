import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, FileCheck } from "lucide-react";
import { EligibilityResult, EligibilityResultType } from "./EligibilityResult";
import { QualificationSuccess } from "./QualificationSuccess";

interface EligibilityModalReg2026Props {
  isOpen: boolean;
  onClose: () => void;
  onEligible: () => void;
}

type Step = "q1" | "q2" | "result" | "pricing";

export const EligibilityModalReg2026 = ({
  isOpen,
  onClose,
  onEligible,
}: EligibilityModalReg2026Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("q1");
  const [enteredBeforeDeadline, setEnteredBeforeDeadline] = useState<boolean | null>(null);
  const [hasFiveMonthsProof, setHasFiveMonthsProof] = useState<boolean | null>(null);
  const [result, setResult] = useState<EligibilityResultType | null>(null);

  const resetModal = () => {
    setStep("q1");
    setEnteredBeforeDeadline(null);
    setHasFiveMonthsProof(null);
    setResult(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const evaluateEligibility = (): EligibilityResultType => {
    if (enteredBeforeDeadline === false) {
      return {
        eligible: false,
        reason: "date",
        message: "Para la Regularización 2026 debes haber entrado a España antes del 31 de diciembre de 2025.",
        subMessage: "Te recomendamos explorar las vías de arraigo tradicionales.",
        redirect: "/españa/arraigos",
      };
    }

    if (hasFiveMonthsProof === false) {
      return {
        eligible: false,
        reason: "time",
        message: "Debes esperar hasta completar 5 meses de estancia documentada antes del 30 de junio de 2026.",
        subMessage: "Una vez cumplas este requisito, podrás iniciar el proceso.",
      };
    }

    return {
      eligible: true,
      routeType: "regularizacion2026",
      message: "Podrás trabajar legalmente en 15 días tras tu solicitud.",
      subMessage: "Te guiaremos paso a paso en todo el proceso.",
    };
  };

  const handleQ1Answer = (answer: boolean) => {
    setEnteredBeforeDeadline(answer);
    if (!answer) {
      // Directly show result if not eligible
      setResult({
        eligible: false,
        reason: "date",
        message: "Para la Regularización 2026 debes haber entrado a España antes del 31 de diciembre de 2025.",
        subMessage: "Te recomendamos explorar las vías de arraigo tradicionales.",
        redirect: "/españa/arraigos",
      });
      setStep("result");
    } else {
      setStep("q2");
    }
  };

  const handleQ2Answer = (answer: boolean) => {
    setHasFiveMonthsProof(answer);
    // Since Q1 was true, evaluate based on Q2
    if (!answer) {
      setResult({
        eligible: false,
        reason: "time",
        message: "Debes esperar hasta completar 5 meses de estancia documentada antes del 30 de junio de 2026.",
        subMessage: "Una vez cumplas este requisito, podrás iniciar el proceso.",
      });
      setStep("result");
    } else {
      // User is eligible - show pricing screen
      setStep("pricing");
    }
  };

  const handleContinue = () => {
    if (result?.eligible) {
      // Store source and redirect to dashboard
      localStorage.setItem("onboarding_source", "reg2026");
      handleClose();
      onEligible();
    } else {
      handleClose();
    }
  };

  const handleRedirect = () => {
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={step === "pricing" ? "sm:max-w-2xl" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === "result" ? "Resultado" : step === "pricing" ? "" : "Verificar Elegibilidad"}
          </DialogTitle>
        </DialogHeader>

        {step === "q1" && (
          <div className="space-y-6 py-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">
                ¿Ingresaste a España antes del 31 de diciembre de 2025?
              </p>
              <p className="text-sm text-muted-foreground">
                Este es un requisito obligatorio para la Regularización Extraordinaria 2026.
              </p>
            </div>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleQ1Answer(true)}
              >
                <span className="text-left">
                  <span className="font-medium">Sí, antes de esa fecha</span>
                  <span className="block text-sm text-muted-foreground">
                    Entré a España antes del 31/12/2025
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleQ1Answer(false)}
              >
                <span className="text-left">
                  <span className="font-medium">No, después de esa fecha</span>
                  <span className="block text-sm text-muted-foreground">
                    Entré a España en 2026
                  </span>
                </span>
              </Button>
            </div>
          </div>
        )}

        {step === "q2" && (
          <div className="space-y-6 py-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">
                ¿Puedes acreditar 5 meses de estancia mediante empadronamiento o recibos?
              </p>
              <p className="text-sm text-muted-foreground">
                Necesitas documentar tu permanencia en España.
              </p>
            </div>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleQ2Answer(true)}
              >
                <span className="text-left">
                  <span className="font-medium">Sí, tengo documentación</span>
                  <span className="block text-sm text-muted-foreground">
                    Empadronamiento, recibos, contratos, etc.
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleQ2Answer(false)}
              >
                <span className="text-left">
                  <span className="font-medium">No, aún no llego a 5 meses</span>
                  <span className="block text-sm text-muted-foreground">
                    Necesito esperar más tiempo
                  </span>
                </span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2"
              onClick={() => setStep("q1")}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
        )}

        {step === "result" && result && (
          <EligibilityResult
            result={result}
            onContinue={handleContinue}
            onRedirect={handleRedirect}
          />
        )}

        {step === "pricing" && (
          <QualificationSuccess
            routeType="regularizacion2026"
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
