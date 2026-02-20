import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const experts = [
  { name: "Dra. Laura Martínez", initials: "LM", specialization: "Experta en Regularización 2026" },
  { name: "Dr. Carlos Fernández", initials: "CF", specialization: "Experto en Arraigo Social y Laboral" },
  { name: "Dra. Sofía Navarro", initials: "SN", specialization: "Experta en Derecho Migratorio" },
];

export const ExpertNetworkPreview = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Red Verificada
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Expertos que respaldan tu proceso
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Abogados especializados en extranjería listos para revisar tu documentación.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {experts.map((expert, i) => (
            <div
              key={expert.name}
              className="flex flex-col items-center text-center p-8 rounded-xl border border-border bg-card hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: `${0.15 * (i + 1)}s` }}
            >
              <Avatar className="w-20 h-20 mb-4 border-2 border-border">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {expert.initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-foreground mb-1">{expert.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{expert.specialization}</p>
              <Badge className="gap-1.5 text-xs">
                <ShieldCheck className="w-3 h-3" />
                Verificado por Albus
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
