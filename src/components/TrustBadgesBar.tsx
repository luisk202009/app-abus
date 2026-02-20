import { Shield, RefreshCw, Clock } from "lucide-react";

const badges = [
  { icon: Shield, text: "Protección de Datos Nivel Bancario" },
  { icon: RefreshCw, text: "Contenido Actualizado Enero 2026" },
  { icon: Clock, text: "Respuesta en < 24h" },
];

export const TrustBadgesBar = () => {
  return (
    <section className="py-10 bg-secondary border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {badges.map((badge, i) => (
            <div
              key={badge.text}
              className="flex items-center gap-3 px-5 py-3 bg-background rounded-lg border border-border shadow-sm animate-fade-up"
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <badge.icon className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
