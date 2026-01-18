import { useState } from "react";
import { X, ArrowRight, ArrowLeft, Check, User, MapPin, Briefcase, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProfileType = "nomada" | "estudiante" | "emprendedor" | "empleado" | null;

interface FormData {
  profileType: ProfileType;
  currentCountry: string;
  timeline: string;
  hasIncome: boolean | null;
}

const steps = [
  { id: 1, title: "Tu perfil", icon: User },
  { id: 2, title: "Ubicación", icon: MapPin },
  { id: 3, title: "Situación", icon: Briefcase },
  { id: 4, title: "Timeline", icon: Calendar },
];

const profileOptions = [
  { id: "nomada", label: "Nómada Digital", description: "Trabajo remoto desde cualquier lugar" },
  { id: "estudiante", label: "Estudiante", description: "Estudios en España" },
  { id: "emprendedor", label: "Emprendedor", description: "Montar un negocio" },
  { id: "empleado", label: "Empleado", description: "Oferta de trabajo en España" },
];

const timelineOptions = [
  { id: "urgente", label: "Lo antes posible", description: "En los próximos 1-2 meses" },
  { id: "pronto", label: "Este año", description: "En los próximos 3-6 meses" },
  { id: "planificando", label: "Planificando", description: "Todavía sin fecha definida" },
];

export const AnalysisModal = ({ isOpen, onClose }: AnalysisModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    profileType: null,
    currentCountry: "",
    timeline: "",
    hasIncome: null,
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProfileSelect = (profile: ProfileType) => {
    setFormData({ ...formData, profileType: profile });
  };

  const handleTimelineSelect = (timeline: string) => {
    setFormData({ ...formData, timeline });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.profileType !== null;
      case 2:
        return formData.currentCountry.length > 0;
      case 3:
        return formData.hasIncome !== null;
      case 4:
        return formData.timeline.length > 0;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-background rounded-xl shadow-float animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Análisis de tu caso</h2>
            <p className="text-sm text-muted-foreground mt-1">Paso {currentStep} de 4</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center gap-2">
                <div
                  className={cn(
                    "w-full h-1.5 rounded-full transition-colors duration-300",
                    currentStep >= step.id ? "bg-primary" : "bg-gray-200"
                  )}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[280px]">
          {currentStep === 1 && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-semibold text-lg mb-4">¿Cuál es tu situación?</h3>
              <div className="grid gap-3">
                {profileOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleProfileSelect(option.id as ProfileType)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all",
                      formData.profileType === option.id
                        ? "border-primary bg-secondary"
                        : "border-border hover:border-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors",
                      formData.profileType === option.id
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    )}>
                      {formData.profileType === option.id && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-semibold text-lg mb-4">¿Dónde vives actualmente?</h3>
              <input
                type="text"
                placeholder="Escribe tu país"
                value={formData.currentCountry}
                onChange={(e) => setFormData({ ...formData, currentCountry: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors text-base"
              />
              <p className="text-sm text-muted-foreground">
                Tu nacionalidad afecta directamente los visados disponibles para ti.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-semibold text-lg mb-4">¿Tienes ingresos demostrables?</h3>
              <div className="grid gap-3">
                {[
                  { value: true, label: "Sí", description: "Ingresos regulares de al menos €2,500/mes" },
                  { value: false, label: "No o no estoy seguro", description: "Menos de €2,500/mes o ingresos irregulares" },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => setFormData({ ...formData, hasIncome: option.value })}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all",
                      formData.hasIncome === option.value
                        ? "border-primary bg-secondary"
                        : "border-border hover:border-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors",
                      formData.hasIncome === option.value
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    )}>
                      {formData.hasIncome === option.value && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-semibold text-lg mb-4">¿Cuándo planeas mudarte?</h3>
              <div className="grid gap-3">
                {timelineOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleTimelineSelect(option.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all",
                      formData.timeline === option.id
                        ? "border-primary bg-secondary"
                        : "border-border hover:border-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors",
                      formData.timeline === option.id
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    )}>
                      {formData.timeline === option.id && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-secondary/50">
          <Button
            variant="ghost"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Cancelar" : "Atrás"}
          </Button>
          <Button
            variant="hero"
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            {currentStep === 4 ? "Ver mi análisis" : "Continuar"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
