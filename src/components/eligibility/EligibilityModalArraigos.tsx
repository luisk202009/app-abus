import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Briefcase } from "lucide-react";
import { EligibilityResult, EligibilityResultType } from "./EligibilityResult";
import { QualificationSuccess, RouteType } from "./QualificationSuccess";

interface EligibilityModalArraigosProps {
  isOpen: boolean;
  onClose: () => void;
  onEligible: (routeType: string) => void;
}

type Step = "q1" | "q2_2years" | "q2_3years" | "result" | "pricing";
type TimeInSpain = "less_than_2" | "2_years" | "3_plus_years";
type TwoYearOption = "trabajo" | "formacion" | "ninguno";
type ThreeYearOption = "insercion" | "contrato" | "ninguno";

export const EligibilityModalArraigos = ({
  isOpen,
  onClose,
  onEligible,
}: EligibilityModalArraigosProps) => {
  const [step, setStep] = useState<Step>("q1");
  const [timeInSpain, setTimeInSpain] = useState<TimeInSpain | null>(null);
  const [twoYearOption, setTwoYearOption] = useState<TwoYearOption | null>(null);
  const [threeYearOption, setThreeYearOption] = useState<ThreeYearOption | null>(null);
  const [result, setResult] = useState<EligibilityResultType | null>(null);
  const [eligibleRouteType, setEligibleRouteType] = useState<RouteType | null>(null);

  const resetModal = () => {
    setStep("q1");
    setTimeInSpain(null);
    setTwoYearOption(null);
    setThreeYearOption(null);
    setResult(null);
    setEligibleRouteType(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleTimeSelect = (time: TimeInSpain) => {
    setTimeInSpain(time);
    
    if (time === "less_than_2") {
      setResult({
        eligible: false,
        reason: "time",
        message: "Debes esperar hasta cumplir al menos 2 años de residencia continuada para solicitar arraigo.",
        subMessage: "Mientras tanto, prepara tu documentación y empadronamiento.",
      });
      setStep("result");
    } else if (time === "2_years") {
      setStep("q2_2years");
    } else {
      setStep("q2_3years");
    }
  };

  const handleTwoYearAnswer = (option: TwoYearOption) => {
    setTwoYearOption(option);
    
    if (option === "trabajo") {
      setEligibleRouteType("arraigo_laboral");
      setStep("pricing");
    } else if (option === "formacion") {
      setEligibleRouteType("arraigo_formativo");
      setStep("pricing");
    } else {
      setResult({
        eligible: false,
        reason: "documents",
        message: "Necesitas una oferta de trabajo o matricularte en formación para acceder al arraigo con 2 años.",
        subMessage: "Si llevas más tiempo, podrías optar al arraigo social con 3 años.",
      });
      setStep("result");
    }
  };

  const handleThreeYearAnswer = (option: ThreeYearOption) => {
    setThreeYearOption(option);
    
    if (option === "ninguno") {
      setResult({
        eligible: false,
        reason: "documents",
        message: "Necesitas informe de inserción social o contrato de trabajo para el arraigo social.",
        subMessage: "Contacta con los servicios sociales de tu ayuntamiento para obtener el informe.",
      });
      setStep("result");
    } else {
      setEligibleRouteType("arraigo_social");
      setStep("pricing");
    }
  };

  const handleContinue = () => {
    if (result?.eligible) {
      localStorage.setItem("onboarding_source", "arraigos");
      handleClose();
      onEligible(result.routeType);
    } else {
      handleClose();
    }
  };

  const getArraigoCopyForRoute = (routeType: string) => {
    switch (routeType) {
      case "arraigo_laboral":
        return "Arraigo Laboral";
      case "arraigo_formativo":
        return "Arraigo Socioformativo";
      case "arraigo_social":
        return "Arraigo Social";
      default:
        return "Arraigo";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={step === "pricing" ? "sm:max-w-2xl" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === "result" ? "Resultado" : step === "pricing" ? "" : "Analizar tu Perfil"}
          </DialogTitle>
        </DialogHeader>

        {step === "q1" && (
          <div className="space-y-6 py-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">
                ¿Cuánto tiempo llevas viviendo en España?
              </p>
              <p className="text-sm text-muted-foreground">
                El tiempo de residencia determina qué tipo de arraigo puedes solicitar.
              </p>
            </div>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleTimeSelect("less_than_2")}
              >
                <span className="text-left">
                  <span className="font-medium">Menos de 2 años</span>
                  <span className="block text-sm text-muted-foreground">
                    Aún no cumplo 2 años de residencia
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleTimeSelect("2_years")}
              >
                <span className="text-left">
                  <span className="font-medium">2 años</span>
                  <span className="block text-sm text-muted-foreground">
                    Llevo aproximadamente 2 años
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleTimeSelect("3_plus_years")}
              >
                <span className="text-left">
                  <span className="font-medium">3 años o más</span>
                  <span className="block text-sm text-muted-foreground">
                    Llevo 3 o más años en España
                  </span>
                </span>
              </Button>
            </div>
          </div>
        )}

        {step === "q2_2years" && (
          <div className="space-y-6 py-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">
                Con 2 años de residencia, ¿cuál es tu situación?
              </p>
              <p className="text-sm text-muted-foreground">
                Puedes acceder al arraigo laboral o socioformativo.
              </p>
            </div>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleTwoYearAnswer("trabajo")}
              >
                <span className="text-left">
                  <span className="font-medium">Tengo oferta de trabajo</span>
                  <span className="block text-sm text-muted-foreground">
                    Contrato de al menos 1 año, jornada completa
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleTwoYearAnswer("formacion")}
              >
                <span className="text-left">
                  <span className="font-medium">Voy a estudiar/formarme</span>
                  <span className="block text-sm text-muted-foreground">
                    Matricularme en un curso acreditado
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleTwoYearAnswer("ninguno")}
              >
                <span className="text-left">
                  <span className="font-medium">Ninguna de las dos</span>
                  <span className="block text-sm text-muted-foreground">
                    No tengo trabajo ni voy a estudiar
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

        {step === "q2_3years" && (
          <div className="space-y-6 py-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">
                Con 3+ años de residencia, ¿qué documentación tienes?
              </p>
              <p className="text-sm text-muted-foreground">
                Puedes acceder al arraigo social tradicional.
              </p>
            </div>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleThreeYearAnswer("insercion")}
              >
                <span className="text-left">
                  <span className="font-medium">Tengo informe de inserción social</span>
                  <span className="block text-sm text-muted-foreground">
                    Emitido por servicios sociales
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleThreeYearAnswer("contrato")}
              >
                <span className="text-left">
                  <span className="font-medium">Tengo contrato de trabajo</span>
                  <span className="block text-sm text-muted-foreground">
                    Oferta laboral de al menos 1 año
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => handleThreeYearAnswer("ninguno")}
              >
                <span className="text-left">
                  <span className="font-medium">Ninguno de los dos</span>
                  <span className="block text-sm text-muted-foreground">
                    Aún no tengo estos documentos
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
          />
        )}

        {step === "pricing" && eligibleRouteType && (
          <QualificationSuccess
            routeType={eligibleRouteType}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
