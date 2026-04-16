import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroReg2026Props {
  onStart: () => void;
}

export const HeroReg2026 = ({ onStart }: HeroReg2026Props) => {
  return (
    <section className="pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>REGULARIZACIÓN 2026</span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Regularización Extraordinaria 2026
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Entrada en España antes del 31/12/2025 + 5 meses de estancia = 
              <span className="text-foreground font-medium"> Permiso de trabajo y residencia</span>
            </p>
          </div>

          {/* Key Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <span>⏰</span>
              <span>Plazo hasta 30 de junio 2026</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <span>📋</span>
              <span>Proceso simplificado</span>
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="hero"
            size="lg"
            className="gap-2 text-lg px-8"
            onClick={onStart}
          >
            Analizar mi elegibilidad
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
