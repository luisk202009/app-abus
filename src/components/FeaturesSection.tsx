import { FileCheck, Clock, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Documentación automática",
    description: "Generamos todos los formularios necesarios pre-rellenados con tus datos.",
  },
  {
    icon: Clock,
    title: "Ahorra semanas",
    description: "Lo que antes tomaba meses de investigación, ahora en minutos.",
  },
  {
    icon: Shield,
    title: "100% legal",
    description: "Información verificada y actualizada con la normativa vigente.",
  },
  {
    icon: Zap,
    title: "IA especializada",
    description: "Respuestas precisas a tus dudas migratorias en tiempo real.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todo lo que necesitas para tu mudanza
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simplificamos cada paso del proceso migratorio con tecnología inteligente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-secondary/50 rounded-xl border border-border hover:border-gray-300 hover:bg-secondary transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
