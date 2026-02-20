import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Award, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CountdownBanner } from "@/components/CountdownBanner";
import { EligibilityCalculator } from "@/components/eligibility/EligibilityCalculator";
import { HeroReg2026 } from "@/components/espana/HeroReg2026";
import { RequirementCard } from "@/components/espana/RequirementCard";
import { EligibilityModalReg2026 } from "@/components/eligibility/EligibilityModalReg2026";
import { AnalysisModal } from "@/components/AnalysisModal";
import { Button } from "@/components/ui/button";
import { TrustBadgesBar } from "@/components/TrustBadgesBar";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";

const requirements = [
  {
    icon: Calendar,
    title: "Fecha de Entrada",
    description: "Haber ingresado a España antes del 31 de diciembre de 2025",
  },
  {
    icon: Clock,
    title: "Tiempo Mínimo",
    description: "5 meses de estancia acreditada mediante empadronamiento o recibos",
  },
  {
    icon: Award,
    title: "Resultado",
    description: "Permiso de trabajo en 15 días hábiles tras presentar la solicitud",
  },
];

const Regularizacion2026 = () => {
  const navigate = useNavigate();
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const handleStartCheck = () => {
    setIsEligibilityModalOpen(true);
  };

  const handleEligible = () => {
    // User passed eligibility, now show full onboarding
    setIsOnboardingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CountdownBanner />

      {/* Hero Section */}
      <HeroReg2026 onStart={handleStartCheck} />

      <TrustBadgesBar />

      {/* Requirements Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Requisitos Clave
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cumple estos tres requisitos para acceder a la Regularización Extraordinaria 2026.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {requirements.map((req) => (
              <RequirementCard
                key={req.title}
                icon={req.icon}
                title={req.title}
                description={req.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Deadline Alert Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>Plazo límite: 30 de junio de 2026</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              No dejes pasar esta oportunidad
            </h2>
            <p className="text-muted-foreground">
              La Regularización Extraordinaria 2026 tiene un plazo limitado. 
              Verifica ahora si cumples los requisitos y comienza tu proceso.
            </p>
            
            <Button
              variant="hero"
              size="lg"
              className="gap-2 text-lg px-8"
              onClick={handleStartCheck}
            >
              Verificar si califico
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Eligibility Calculator */}
      <EligibilityCalculator onStartProcess={handleStartCheck} />

      <TestimonialsCarousel />

      <Footer />

      {/* Eligibility Check Modal */}
      <EligibilityModalReg2026
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        onEligible={handleEligible}
      />

      {/* Full Onboarding Modal (after eligibility passes) */}
      <AnalysisModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        source="reg2026"
      />
    </div>
  );
};

export default Regularizacion2026;
