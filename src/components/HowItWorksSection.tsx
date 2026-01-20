import { ArrowRight, Search, Route, Plane } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Analiza",
    description: "Responde unas preguntas sobre tu situación y nuestro sistema analiza tu perfil migratorio.",
  },
  {
    number: "02",
    icon: Route,
    title: "Planifica",
    description: "Recibe tu hoja de ruta personalizada con todos los pasos y documentos necesarios.",
  },
  {
    number: "03",
    icon: Plane,
    title: "Migra",
    description: "Sigue tu plan paso a paso, genera formularios automáticamente y completa tu mudanza.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cómo funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tres simples pasos para comenzar tu nueva vida en España.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative text-center animate-fade-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border">
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              )}

              {/* Step number */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-background border border-border mb-6 mx-auto group hover:border-primary transition-colors duration-300">
                <step.icon className="w-10 h-10 text-foreground group-hover:text-primary transition-colors duration-300" />
              </div>

              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Paso {step.number}
              </div>

              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
