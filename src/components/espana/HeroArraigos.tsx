import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroArraigosProps {
  onStart: () => void;
}

export const HeroArraigos = ({ onStart }: HeroArraigosProps) => {
  return (
    <section className="pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Vías de Arraigo en España
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Regularízate a través de tu tiempo de residencia, vínculos laborales o formación profesional.
            </p>
          </div>

          {/* Key Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <span>📅</span>
              <span>Desde 2 años de residencia</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <span>📄</span>
              <span>Múltiples opciones</span>
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="hero"
            size="lg"
            className="gap-2 text-lg px-8"
            onClick={onStart}
          >
            Analizar mi perfil
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
