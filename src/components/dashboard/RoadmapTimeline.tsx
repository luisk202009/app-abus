import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
}

const roadmapSteps: RoadmapStep[] = [
  {
    id: 1,
    title: "Preparación",
    description: "Reúne los documentos necesarios y prepara tu solicitud.",
  },
  {
    id: 2,
    title: "Solicitud",
    description: "Presenta tu solicitud en la oficina correspondiente.",
  },
  {
    id: 3,
    title: "Resolución",
    description: "Espera la resolución de tu expediente.",
  },
  {
    id: 4,
    title: "TIE/Residencia",
    description: "Recoge tu Tarjeta de Identidad de Extranjero.",
  },
];

interface RoadmapTimelineProps {
  currentStep: number;
}

export const RoadmapTimeline = ({ currentStep }: RoadmapTimelineProps) => {
  return (
    <div className="bg-background rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold mb-6">Tu Hoja de Ruta</h3>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {roadmapSteps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isFuture = step.id > currentStep;

            return (
              <div key={step.id} className="relative flex gap-4">
                {/* Circle indicator */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 transition-all",
                    isCompleted && "bg-primary border-primary",
                    isCurrent && "bg-primary border-primary",
                    isFuture && "bg-background border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className={cn("pt-1.5 pb-2", isFuture && "opacity-50")}>
                  <h4
                    className={cn(
                      "font-semibold",
                      isCurrent && "text-foreground",
                      isFuture && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {isCurrent && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                      En progreso
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
