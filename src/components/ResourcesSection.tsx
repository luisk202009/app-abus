import { FileText, BookOpen, Video, HelpCircle } from "lucide-react";

const resources = [
  {
    icon: FileText,
    title: "Guías completas",
    description: "Artículos detallados sobre cada tipo de visado y proceso.",
    tag: "Próximamente",
  },
  {
    icon: BookOpen,
    title: "Glosario legal",
    description: "Todos los términos que necesitas entender, explicados.",
    tag: "Próximamente",
  },
  {
    icon: Video,
    title: "Tutoriales",
    description: "Videos paso a paso de cada trámite burocrático.",
    tag: "Próximamente",
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Respuestas a las preguntas más frecuentes.",
    tag: "Próximamente",
  },
];

export const ResourcesSection = () => {
  return (
    <section id="recursos" className="py-24 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Recursos para tu mudanza
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo el conocimiento que necesitas en un solo lugar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <div
              key={resource.title}
              className="group relative p-6 bg-background rounded-xl border border-border hover:border-primary/30 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="absolute top-4 right-4">
                <span className="text-[10px] px-2 py-1 bg-secondary rounded-full text-muted-foreground font-medium">
                  {resource.tag}
                </span>
              </div>

              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <resource.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {resource.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
