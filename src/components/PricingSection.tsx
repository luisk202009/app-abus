import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingSectionProps {
  onStartFree?: () => void;
}

const freeFeatures = [
  "Análisis de perfil migratorio",
  "Hoja de ruta personalizada",
  "Checklist de tareas",
  "Soporte por email",
];

const proFeatures = [
  "Todo del plan gratuito",
  "Bóveda de documentos segura",
  "Generación automática de formularios",
  "Tasa 790 pre-rellenada",
  "Soporte prioritario",
];

export const PricingSection = ({ onStartFree }: PricingSectionProps) => {
  return (
    <section id="precios" className="py-24 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Precios simples y transparentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empieza gratis y actualiza cuando necesites más funcionalidades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-background border border-border rounded-2xl p-8 animate-fade-up">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Gratis</h3>
              <p className="text-muted-foreground text-sm">
                Perfecto para empezar
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">0€</span>
              <span className="text-muted-foreground">/mes</span>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full"
              onClick={onStartFree}
            >
              Empezar gratis
            </Button>
          </div>

          {/* Pro Plan */}
          <div 
            className="relative bg-primary text-primary-foreground rounded-2xl p-8 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-background text-foreground text-xs font-semibold rounded-full border border-border shadow-sm">
                <Sparkles className="w-3 h-3" />
                Popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Pro</h3>
              <p className="text-primary-foreground/70 text-sm">
                Para quienes van en serio
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">9,99€</span>
              <span className="text-primary-foreground/70">/mes</span>
            </div>

            <ul className="space-y-3 mb-8">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="secondary"
              className="w-full bg-background text-foreground hover:bg-background/90"
              onClick={onStartFree}
            >
              Empezar con Pro
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
