import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

type EligibleResult = { 
  eligible: true; 
  routeType: "regularizacion2026" | "arraigo_social" | "arraigo_laboral" | "arraigo_formativo"; 
  message: string; 
  subMessage?: string;
};

type NotEligibleResult = { 
  eligible: false; 
  reason: "date" | "time" | "documents"; 
  message: string; 
  subMessage?: string; 
  redirect?: string;
};

export type EligibilityResultType = EligibleResult | NotEligibleResult;

interface EligibilityResultProps {
  result: EligibilityResultType;
  onContinue: () => void;
  onRedirect?: () => void;
}

export const EligibilityResult = ({ result, onContinue, onRedirect }: EligibilityResultProps) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (result.eligible === false && result.redirect) {
      navigate(result.redirect);
    }
    onRedirect?.();
  };

  if (result.eligible === true) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">¡Apto para Regularización!</h3>
          <p className="text-muted-foreground">{result.message}</p>
          {result.subMessage && (
            <p className="text-sm text-muted-foreground">{result.subMessage}</p>
          )}
        </div>

        <Button 
          variant="hero" 
          size="lg" 
          className="gap-2"
          onClick={onContinue}
        >
          Continuar al proceso completo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // TypeScript now knows result.eligible === false
  const Icon = result.reason === "time" ? Clock : XCircle;
  
  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {result.reason === "time" ? "Aún no cumples los requisitos" : "No aplica para esta vía"}
        </h3>
        <p className="text-muted-foreground">{result.message}</p>
        {result.subMessage && (
          <p className="text-sm text-muted-foreground">{result.subMessage}</p>
        )}
      </div>

      {result.redirect ? (
        <Button 
          variant="outline" 
          size="lg" 
          className="gap-2"
          onClick={handleRedirect}
        >
          Explorar otras vías
          <ExternalLink className="w-4 h-4" />
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="lg"
          onClick={onContinue}
        >
          Entendido
        </Button>
      )}
    </div>
  );
};
