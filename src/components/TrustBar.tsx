import { Briefcase, GraduationCap, Globe } from "lucide-react";

export const TrustBar = () => {
  const personas = [
    { icon: Globe, label: "Nómadas Digitales" },
    { icon: GraduationCap, label: "Estudiantes" },
    { icon: Briefcase, label: "Emprendedores" },
  ];

  return (
    <section className="py-16 bg-secondary border-y border-border">
      <div className="container mx-auto">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6 tracking-wide uppercase">
            Asistente inteligente para
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {personas.map((persona, index) => (
              <div 
                key={persona.label}
                className="flex items-center gap-3 px-6 py-3 bg-background rounded-lg border border-border shadow-soft animate-fade-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <persona.icon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-foreground">{persona.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
