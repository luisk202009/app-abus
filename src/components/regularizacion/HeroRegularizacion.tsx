import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroRegularizacionProps {
  onStart: () => void;
}

export const HeroRegularizacion = ({ onStart }: HeroRegularizacionProps) => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--secondary))_0%,transparent_50%)]" />
      
      <div className="container px-4 md:px-6 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge 
            variant="outline" 
            className="gap-2 px-4 py-2 text-sm font-medium border-foreground/20 bg-background"
          >
            <Sparkles className="w-4 h-4" />
            Nuevo 2026
          </Badge>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Nueva Reforma de{" "}
            <span className="relative">
              Extranjería 2026
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C50 4 150 2 298 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Regularízate en España con las nuevas leyes que entran en vigor este año. 
            Arraigo social reducido a <strong className="text-foreground">2 años</strong>, 
            nuevas vías de formación y segunda oportunidad.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              variant="hero"
              size="lg"
              className="gap-2 text-lg px-8"
              onClick={onStart}
            >
              Iniciar mi proceso
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Trust indicator */}
          <p className="text-sm text-muted-foreground">
            Sin compromiso · Análisis gratuito · Guía paso a paso
          </p>
        </div>
      </div>
    </section>
  );
};
