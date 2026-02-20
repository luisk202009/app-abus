import { useEffect } from "react";
import { FileText, Scale, Users, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

const articles = [
  {
    icon: FileText,
    title: "Padrón Histórico: Cómo solicitarlo para la Regularización",
    description:
      "Guía paso a paso para obtener tu certificado de empadronamiento histórico, uno de los documentos clave para demostrar tu estancia en España.",
    tag: "Documentación",
  },
  {
    icon: Scale,
    title: "Antecedentes Penales: ¿Qué vigencia deben tener en 2026?",
    description:
      "Todo sobre la validez y apostilla de tus antecedentes penales para el proceso de regularización extraordinaria.",
    tag: "Legal",
  },
  {
    icon: Users,
    title: "Hijos menores: El permiso de 5 años explicado",
    description:
      "Cómo incluir a tus hijos menores en el proceso de regularización y qué tipo de permiso obtienen.",
    tag: "Familia",
  },
];

const Recursos = () => {
  useEffect(() => {
    document.title = "Recursos sobre Regularización España 2026 | Albus";
    const meta = document.querySelector('meta[name="description"]');
    const content =
      "Guías, artículos y recursos gratuitos sobre la Regularización Extraordinaria 2026 en España. Padrón, antecedentes penales y más.";
    if (meta) {
      meta.setAttribute("content", content);
    } else {
      const el = document.createElement("meta");
      el.name = "description";
      el.content = content;
      document.head.appendChild(el);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Centro de Recursos
            </h1>
            <p className="text-muted-foreground text-lg">
              Guías y artículos para preparar tu proceso de regularización en España.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {articles.map((article) => (
              <div
                key={article.title}
                className="group bg-background border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <article.icon className="w-5 h-5 text-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    {article.tag}
                  </Badge>
                </div>
                <h2 className="font-semibold text-sm leading-snug">{article.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {article.description}
                </p>
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <span>Próximamente</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Recursos;
