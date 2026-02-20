import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroArraigos } from "@/components/espana/HeroArraigos";
import { PillarCard } from "@/components/regularizacion/PillarCard";
import { DocumentChecklist } from "@/components/regularizacion/DocumentChecklist";
import { EligibilityModalArraigos } from "@/components/eligibility/EligibilityModalArraigos";
import { AnalysisModal } from "@/components/AnalysisModal";
import { Button } from "@/components/ui/button";
import { TrustBadgesBar } from "@/components/TrustBadgesBar";

const pillars = [
  {
    icon: Scale,
    title: "Arraigo Social",
    subtitle: "3 años + informe de inserción o contrato",
    requirements: [
      "Empadronamiento histórico (3 años)",
      "Antecedentes penales limpios",
      "Informe de inserción social o contrato",
    ],
  },
  {
    icon: Briefcase,
    title: "Arraigo Laboral",
    subtitle: "2 años + contrato de trabajo",
    requirements: [
      "Empadronamiento histórico (2 años)",
      "Antecedentes penales limpios",
      "Oferta laboral de al menos 1 año",
    ],
  },
  {
    icon: GraduationCap,
    title: "Arraigo Socioformativo",
    subtitle: "2 años + formación acreditada",
    requirements: [
      "Empadronamiento histórico (2 años)",
      "Antecedentes penales limpios",
      "Curso de formación acreditado",
    ],
  },
];

const Arraigos = () => {
  const navigate = useNavigate();
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [selectedRouteType, setSelectedRouteType] = useState<string>("");

  const handleStartCheck = () => {
    setIsEligibilityModalOpen(true);
  };

  const handleEligible = (routeType: string) => {
    setSelectedRouteType(routeType);
    // User passed eligibility, now show full onboarding
    setIsOnboardingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <HeroArraigos onStart={handleStartCheck} />

      <TrustBadgesBar />

      {/* Pillars Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Los 3 Tipos de Arraigo
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dependiendo de tu tiempo de residencia y situación, puedes acceder 
              a diferentes vías de regularización.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pillars.map((pillar) => (
              <PillarCard
                key={pillar.title}
                icon={pillar.icon}
                title={pillar.title}
                subtitle={pillar.subtitle}
                requirements={pillar.requirements}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Document Checklist */}
      <DocumentChecklist />

      {/* Final CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              ¿Cuál es tu vía de arraigo?
            </h2>
            <p className="text-muted-foreground">
              Responde unas preguntas simples y te indicamos qué tipo de arraigo 
              puedes solicitar según tu situación actual.
            </p>
            <Button
              variant="hero"
              size="lg"
              className="gap-2 text-lg px-8"
              onClick={handleStartCheck}
            >
              Analizar mi perfil
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Eligibility Check Modal */}
      <EligibilityModalArraigos
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        onEligible={handleEligible}
      />

      {/* Full Onboarding Modal (after eligibility passes) */}
      <AnalysisModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        source="arraigos"
      />
    </div>
  );
};

export default Arraigos;
