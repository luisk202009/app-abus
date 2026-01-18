import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CountrySelect } from "@/components/onboarding/CountrySelect";
import { RadioCard } from "@/components/onboarding/RadioCard";
import { IncomeSlider } from "@/components/onboarding/IncomeSlider";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import isotipoAlbus from "@/assets/isotipo-albus.png";

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

interface AIRecommendation {
  visa_type: string;
  title: string;
  description: string;
  confidence: number;
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

// Map activity IDs to readable labels for database
const activityLabels: Record<string, string> = {
  remote: "Trabajo remoto para empresa extranjera",
  student: "Soy estudiante",
  entrepreneur: "Quiero emprender",
  employment: "Busco empleo en España",
};

// Map situation IDs to readable labels for database
const situationLabels: Record<string, string> = {
  origin: "En mi país de origen",
  tourist: "En España como turista",
  student: "En España con estudios",
};

// Map savings IDs to database values
const savingsLabels: Record<string, string> = {
  low: "<10k",
  medium: "10k-30k",
  high: ">30k",
};

// AI Recommendation Logic
const generateRecommendation = (formData: FormData): AIRecommendation => {
  // Rule 1: Remote worker with income > 2646
  if (formData.activity === "remote" && formData.monthlyIncome > 2646) {
    return {
      visa_type: "digital_nomad",
      title: "Visado de Nómada Digital",
      description: "Con tus ingresos de trabajo remoto, calificas perfectamente para el visado de nómada digital en España. Este visado te permite residir legalmente mientras trabajas para empresas extranjeras.",
      confidence: 95,
    };
  }

  // Rule 2: Student with savings > 10k
  if (formData.activity === "student" && (formData.savings === "medium" || formData.savings === "high")) {
    return {
      visa_type: "student",
      title: "Estancia por Estudios",
      description: "Tu perfil de estudiante con ahorros demostrables te posiciona bien para obtener una estancia por estudios en España. Este visado te permite estudiar y trabajar a tiempo parcial.",
      confidence: 90,
    };
  }

  // Rule 3: Default - personalized consultation
  return {
    visa_type: "consultation",
    title: "Consulta Inicial Personalizada",
    description: "Tu situación requiere un análisis más detallado. Te recomendamos una consulta personalizada con nuestros expertos para explorar las mejores opciones migratorias para tu perfil.",
    confidence: 75,
  };
};

export const AnalysisModal = ({ isOpen, onClose }: AnalysisModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
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
      // Start analyzing and submitting
      setIsAnalyzing(true);
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Generate AI recommendation
    const aiRecommendation = generateRecommendation(formData);
    setRecommendation(aiRecommendation);

    // Prepare data for Supabase
    const submissionData = {
      full_name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      nationality: formData.nationality,
      current_location: situationLabels[formData.currentSituation],
      professional_profile: activityLabels[formData.activity],
      monthly_income: formData.monthlyIncome,
      savings_range: savingsLabels[formData.savings],
      ai_recommendation: JSON.parse(JSON.stringify(aiRecommendation)) as Json,
    };

    // Wait at least 3 seconds for the loading animation
    const minWait = new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const [_, dbResult] = await Promise.all([
        minWait,
        supabase.from("onboarding_submissions").insert([submissionData])
      ]);

      if (dbResult.error) {
        throw dbResult.error;
      }

      // Success - show success screen
      setIsAnalyzing(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar tus datos",
        description: "Por favor, intenta de nuevo más tarde.",
      });
      setIsAnalyzing(false);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form after closing
    setTimeout(() => {
      setCurrentStep(1);
      setIsAnalyzing(false);
      setIsSubmitting(false);
      setShowSuccess(false);
      setRecommendation(null);
      setFormData({
        nationality: "",
        currentSituation: "",
        activity: "",
        monthlyIncome: 3000,
        savings: "",
        name: "",
        email: "",
      });
    }, 300);
  };

  const handleViewRoadmap = () => {
    // Navigate to dashboard with user data
    navigate("/dashboard", {
      state: {
        name: formData.name.trim(),
        visaType: recommendation?.visa_type || "consultation",
        visaTitle: recommendation?.title || "Consulta Inicial Personalizada",
      },
    });
    handleClose();
  };

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
        return formData.name.trim().length > 0 && formData.email.trim().length > 0 && isValidEmail(formData.email);
      default:
        return false;
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!isOpen) return null;

  // Success Screen
  if (showSuccess && recommendation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-xl bg-background rounded-2xl shadow-float animate-scale-in overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              Análisis Completado
            </h2>
            <p className="text-muted-foreground mb-8">
              Hemos analizado tu perfil y encontramos la mejor opción para ti.
            </p>

            {/* Recommendation Card */}
            <div className="bg-secondary/50 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-center gap-2 mb-3">
                <img src={isotipoAlbus} alt="" className="w-5 h-5" />
                <span className="text-sm font-medium text-muted-foreground">
                  Tu mejor opción
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {recommendation.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {recommendation.description}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${recommendation.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {recommendation.confidence}% match
                </span>
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full gap-2"
              onClick={handleViewRoadmap}
            >
              Ver mi hoja de ruta completa
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-background rounded-2xl shadow-float animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex-1">
            <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
          </div>
          <button
            onClick={handleClose}
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
                <img 
                  src={isotipoAlbus} 
                  alt="Albus" 
                  className="w-16 h-16 animate-pulse"
                />
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
            onClick={currentStep === 1 ? handleClose : handleBack}
            className="gap-2"
            disabled={isAnalyzing}
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Cancelar" : "Atrás"}
          </Button>
          
          {isAnalyzing ? (
            <Button variant="hero" disabled className="gap-2 min-w-[140px]">
              <img src={isotipoAlbus} alt="" className="w-4 h-4 animate-spin" />
              Analizando...
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 min-w-[140px]"
            >
              {currentStep === 5 ? "Finalizar" : "Continuar"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
