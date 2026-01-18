import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CountrySelect } from "@/components/onboarding/CountrySelect";
import { RadioCard } from "@/components/onboarding/RadioCard";
import { IncomeSlider } from "@/components/onboarding/IncomeSlider";
import { StepProgress } from "@/components/onboarding/StepProgress";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nationality: string;
  currentSituation: string;
  activity: string;
  monthlyIncome: number;
  savings: string;
  name: string;
  email: string;
}

const situationOptions = [
  { id: "origin", label: "En mi país de origen" },
  { id: "tourist", label: "En España como turista" },
  { id: "student", label: "En España con estudios" },
];

const activityOptions = [
  { id: "remote", label: "Trabajo remoto para empresa extranjera" },
  { id: "student", label: "Soy estudiante" },
  { id: "entrepreneur", label: "Quiero emprender" },
  { id: "employment", label: "Busco empleo en España" },
];

const savingsOptions = [
  { id: "low", label: "Menos de 10.000€" },
  { id: "medium", label: "Entre 10.000€ y 30.000€" },
  { id: "high", label: "Más de 30.000€" },
];

export const AnalysisModal = ({ isOpen, onClose }: AnalysisModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nationality: "",
    currentSituation: "",
    activity: "",
    monthlyIncome: 3000,
    savings: "",
    name: "",
    email: "",
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps && !isAnalyzing) {
      // Start analyzing
      setIsAnalyzing(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Here you would submit the data
    console.log("Form submitted:", formData);
    onClose();
    // Reset form
    setCurrentStep(1);
    setIsAnalyzing(false);
    setFormData({
      nationality: "",
      currentSituation: "",
      activity: "",
      monthlyIncome: 3000,
      savings: "",
      name: "",
      email: "",
    });
  };

  // Auto-finish after 3 seconds of analyzing
  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.nationality.length > 0;
      case 2:
        return formData.currentSituation.length > 0;
      case 3:
        return formData.activity.length > 0;
      case 4:
        return formData.savings.length > 0;
      case 5:
        return formData.name.trim().length > 0 && formData.email.trim().length > 0;
      default:
        return false;
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getButtonText = () => {
    if (currentStep === 5) {
      if (isAnalyzing) {
        return "Analizando...";
      }
      return "Finalizar";
    }
    return "Continuar";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-background rounded-2xl shadow-float animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex-1">
            <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 min-h-[380px]">
          {/* Step 1: Nacionalidad */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Identidad</h2>
                <p className="text-muted-foreground mt-2">
                  Tu nacionalidad determina qué visados puedes solicitar.
                </p>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Nacionalidad
                </label>
                <CountrySelect
                  value={formData.nationality}
                  onChange={(value) => setFormData({ ...formData, nationality: value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Situación */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Situación</h2>
                <p className="text-muted-foreground mt-2">
                  ¿Dónde te encuentras ahora mismo?
                </p>
              </div>
              <div className="space-y-3">
                {situationOptions.map((option) => (
                  <RadioCard
                    key={option.id}
                    label={option.label}
                    selected={formData.currentSituation === option.id}
                    onClick={() => setFormData({ ...formData, currentSituation: option.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Actividad */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Actividad</h2>
                <p className="text-muted-foreground mt-2">
                  ¿A qué te dedicas o piensas dedicarte?
                </p>
              </div>
              <div className="space-y-3">
                {activityOptions.map((option) => (
                  <RadioCard
                    key={option.id}
                    label={option.label}
                    selected={formData.activity === option.id}
                    onClick={() => setFormData({ ...formData, activity: option.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Economía */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Economía</h2>
                <p className="text-muted-foreground mt-2">
                  Estos datos nos ayudan a determinar qué visados son viables para ti.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Ingresos mensuales aproximados
                </label>
                <IncomeSlider
                  value={formData.monthlyIncome}
                  onChange={(value) => setFormData({ ...formData, monthlyIncome: value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Ahorros demostrables
                </label>
                {savingsOptions.map((option) => (
                  <RadioCard
                    key={option.id}
                    label={option.label}
                    selected={formData.savings === option.id}
                    onClick={() => setFormData({ ...formData, savings: option.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Contacto */}
          {currentStep === 5 && !isAnalyzing && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Contacto</h2>
                <p className="text-muted-foreground mt-2">
                  Te enviaremos tu análisis personalizado por email.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors text-base placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={cn(
                      "w-full px-4 py-4 rounded-xl border-2 bg-background focus:outline-none transition-colors text-base placeholder:text-muted-foreground/60",
                      formData.email && !isValidEmail(formData.email)
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary"
                    )}
                  />
                  {formData.email && !isValidEmail(formData.email) && (
                    <p className="text-sm text-destructive">
                      Por favor, introduce un email válido
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analyzing State */}
          {currentStep === 5 && isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[300px] animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-secondary" />
                <Loader2 className="absolute inset-0 w-16 h-16 text-primary animate-spin" />
              </div>
              <p className="mt-6 text-lg font-medium text-center">
                Albus está analizando tu perfil legal...
              </p>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Evaluando opciones de visado para {formData.nationality}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-border bg-secondary/30">
          <Button
            variant="ghost"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="gap-2"
            disabled={isAnalyzing}
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Cancelar" : "Atrás"}
          </Button>
          
          {isAnalyzing ? (
            <Button variant="hero" disabled className="gap-2 min-w-[140px]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando...
            </Button>
          ) : currentStep === 5 && !isAnalyzing ? (
            <Button
              variant="hero"
              onClick={handleFinish}
              disabled={!canProceed() || !isValidEmail(formData.email)}
              className="gap-2 min-w-[140px]"
            >
              Finalizar
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 min-w-[140px]"
            >
              {getButtonText()}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
