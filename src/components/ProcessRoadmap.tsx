import { UserCheck, FolderOpen, Scale, Send, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    num: 1,
    icon: UserCheck,
    title: "Valida tu perfil",
    plan: "Gratis",
    planVariant: "outline" as const,
    description: "Analiza tu elegibilidad en minutos",
  },
  {
    num: 2,
    icon: FolderOpen,
    title: "Organiza tus documentos",
    plan: "Pro",
    planVariant: "default" as const,
    description: "Bóveda segura con validación automática",
  },
  {
    num: 3,
    icon: Scale,
    title: "Revisión por experto",
    plan: "Premium",
    planVariant: "default" as const,
    description: "Un abogado revisa todo antes de enviar",
  },
  {
    num: 4,
    icon: Send,
    title: "Presentación oficial",
    plan: "Abril 2026",
    planVariant: "outline" as const,
    description: "Envía tu solicitud con confianza",
  },
];

export const ProcessRoadmap = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Tu camino a la legalidad en 4 pasos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Un proceso claro y guiado desde la verificación hasta la presentación oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0 max-w-5xl mx-auto relative">
          {steps.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center group">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-8 left-[calc(50%+28px)] w-[calc(100%-56px)] items-center z-0">
                  <div className="flex-1 h-px bg-border" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 -ml-1" />
                </div>
              )}

              {/* Step circle */}
              <div
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 relative z-10 animate-fade-up"
                style={{ animationDelay: `${0.15 * (i + 1)}s` }}
              >
                <step.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <div className="animate-fade-up" style={{ animationDelay: `${0.15 * (i + 1) + 0.05}s` }}>
                <Badge variant={step.planVariant} className="mb-2 text-xs">
                  {step.plan}
                </Badge>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                  {step.description}
                </p>
              </div>

              {/* Connector line (mobile) */}
              {i < steps.length - 1 && (
                <div className="md:hidden w-px h-8 bg-border mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
