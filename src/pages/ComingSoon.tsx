import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WaitlistModal } from "@/components/WaitlistModal";
import { Button } from "@/components/ui/button";
import { Bell, ArrowLeft, MapPin, Briefcase, Sun, Building2 } from "lucide-react";
import { CountryFlag } from "@/components/CountryFlag";

const countryData: Record<string, { name: string; code: string; description: string; highlights: string[] }> = {
  malta: {
    name: "Malta",
    code: "mt",
    description: "Isla mediterránea con un ecosistema startup vibrante y beneficios fiscales atractivos para nómadas digitales.",
    highlights: ["Visa de Nómada Digital", "Inglés oficial", "Clima mediterráneo", "Hub cripto europeo"],
  },
  dubai: {
    name: "Dubái",
    code: "ae",
    description: "Centro de negocios global con 0% impuesto sobre la renta y una calidad de vida excepcional.",
    highlights: ["Visa de Freelancer", "0% impuestos", "Infraestructura de clase mundial", "Hub de innovación"],
  },
  usa: {
    name: "USA",
    code: "us",
    description: "El mercado más grande del mundo con oportunidades ilimitadas para emprendedores y profesionales.",
    highlights: ["Visa O-1", "Visa EB-1", "Mercado tech líder", "Networking global"],
  },
  canada: {
    name: "Canadá",
    code: "ca",
    description: "Calidad de vida excepcional con programas de inmigración muy accesibles para profesionales cualificados.",
    highlights: ["Express Entry", "Startup Visa", "Alta calidad de vida", "Sistema de salud público"],
  },
};

const iconMap: Record<string, React.ReactNode> = {
  "Visa de Nómada Digital": <Briefcase className="w-5 h-5" />,
  "Inglés oficial": <Building2 className="w-5 h-5" />,
  "Clima mediterráneo": <Sun className="w-5 h-5" />,
  "Hub cripto europeo": <MapPin className="w-5 h-5" />,
  "Visa de Freelancer": <Briefcase className="w-5 h-5" />,
  "0% impuestos": <Building2 className="w-5 h-5" />,
  "Infraestructura de clase mundial": <MapPin className="w-5 h-5" />,
  "Hub de innovación": <Sun className="w-5 h-5" />,
  "Visa O-1": <Briefcase className="w-5 h-5" />,
  "Visa EB-1": <Briefcase className="w-5 h-5" />,
  "Mercado tech líder": <Building2 className="w-5 h-5" />,
  "Networking global": <MapPin className="w-5 h-5" />,
  "Express Entry": <Briefcase className="w-5 h-5" />,
  "Startup Visa": <Briefcase className="w-5 h-5" />,
  "Alta calidad de vida": <Sun className="w-5 h-5" />,
  "Sistema de salud público": <Building2 className="w-5 h-5" />,
};

const ComingSoon = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const [showWaitlist, setShowWaitlist] = useState(true);

  const country = countryId ? countryData[countryId] : null;

  if (!country) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto py-16">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>

          {/* Hero with blur overlay */}
          <div className="relative rounded-3xl overflow-hidden bg-secondary p-12 md:p-20">
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10" />
            
            {/* Content */}
            <div className="relative z-20 text-center">
              <CountryFlag code={country.code} size="lg" className="mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {country.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {country.description}
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                {country.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-2 justify-center p-3 bg-background/80 rounded-xl border border-border"
                  >
                    {iconMap[highlight] || <MapPin className="w-5 h-5" />}
                    <span className="text-sm font-medium">{highlight}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={() => setShowWaitlist(true)}
                className="px-8"
              >
                <Bell className="w-4 h-4 mr-2" />
                Unirme a la lista de espera
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        country={{ id: countryId || "", name: country.name, code: country.code }}
      />
    </div>
  );
};

export default ComingSoon;
