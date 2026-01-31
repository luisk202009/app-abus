import { useState } from "react";
import { Scale, GraduationCap, RefreshCw, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroRegularizacion } from "@/components/regularizacion/HeroRegularizacion";
import { PillarCard } from "@/components/regularizacion/PillarCard";
import { DocumentChecklist } from "@/components/regularizacion/DocumentChecklist";
import { AnalysisModal } from "@/components/AnalysisModal";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Scale,
    title: "Arraigo Social",
    subtitle: "2 años de residencia (antes eran 3)",
    requirements: [
      "Empadronamiento histórico",
      "Antecedentes penales limpios",
      "Contrato de trabajo o medios económicos",
    ],
  },
  {
    icon: GraduationCap,
    title: "Arraigo para la Formación",
    subtitle: "Formación + empleo sin experiencia previa",
    requirements: [
      "Curso acreditado en España",
      "Compromiso de contrato post-formación",
      "Seguro médico vigente",
    ],
  },
  {
    icon: RefreshCw,
    title: "Segunda Oportunidad",
    subtitle: "Vías irregulares previas reconocidas",
    requirements: [
      "Buen historial demostrable",
      "Sin antecedentes delictivos",
      "Integración social acreditada",
    ],
  },
];

const Regularizacion = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartProcess = () => {
    // Store source in localStorage for auto-routing
    localStorage.setItem("onboarding_source", "regularizacion");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <HeroRegularizacion onStart={handleStartProcess} />

      {/* Pillars Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Los 3 Pilares de la Nueva Ley
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              La reforma de extranjería 2026 abre nuevas vías de regularización 
              para quienes ya residen en España.
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
              ¿Listo para regularizar tu situación?
            </h2>
            <p className="text-muted-foreground">
              Te guiamos paso a paso en todo el proceso. Análisis gratuito, 
              sin compromisos, con toda la información que necesitas.
            </p>
            <Button
              variant="hero"
              size="lg"
              className="gap-2 text-lg px-8"
              onClick={handleStartProcess}
            >
              Comenzar mi proceso de regularización
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Onboarding Modal with source parameter */}
      <AnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="regularizacion"
      />
    </div>
  );
};

export default Regularizacion;
