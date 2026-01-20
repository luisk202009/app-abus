import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onAnalyzeClick: () => void;
}

export const HeroSection = ({ onAnalyzeClick }: HeroSectionProps) => {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("como-funciona");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Abstract background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gray-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-[0.03]">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Asistente Inteligente de Migración</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Tu nueva vida en España,{" "}
            <span className="relative">
              diseñada con precisión
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-gray-300" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0 7 Q50 0, 100 4 T200 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Analizamos tu perfil legal, generamos tu hoja de ruta migratoria y automatizamos tu burocracia.{" "}
            <span className="text-foreground font-medium">Sin estrés, sin errores.</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              variant="hero" 
              size="hero" 
              onClick={onAnalyzeClick}
              className="w-full sm:w-auto group"
            >
              Analizar mi caso gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full sm:w-auto text-muted-foreground"
              onClick={scrollToHowItWorks}
            >
              Ver cómo funciona
            </Button>
          </div>

          {/* Social proof hint */}
          <p className="mt-8 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <span className="font-medium text-foreground">+2,500</span> personas han analizado su caso este mes
          </p>
        </div>
      </div>
    </section>
  );
};
