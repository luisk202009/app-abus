import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Globe, Shield, BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CountdownBanner } from "@/components/CountdownBanner";
import { EligibilityCalculator } from "@/components/eligibility/EligibilityCalculator";
import { AnalysisModal } from "@/components/AnalysisModal";
import { Button } from "@/components/ui/button";

interface PaisData {
  name: string;
  gentilicio: string;
  gentilicioPlural: string;
  code: string;
  requisito: string;
  detalle: string;
  documentos: { icon: typeof FileText; titulo: string; descripcion: string }[];
}

const paisesData: Record<string, PaisData> = {
  venezuela: {
    name: "Venezuela",
    gentilicio: "Venezolano",
    gentilicioPlural: "Venezolanos",
    code: "ve",
    requisito: "Legalización vía SAREN para documentos civiles",
    detalle:
      "Los documentos venezolanos (actas de nacimiento, antecedentes penales, títulos universitarios) deben ser legalizados a través del SAREN antes de su apostilla. Este proceso puede realizarse desde España a través de un apoderado o gestor en Venezuela.",
    documentos: [
      { icon: FileText, titulo: "Legalización SAREN", descripcion: "Todos los documentos civiles deben pasar por el SAREN antes de apostillar." },
      { icon: Shield, titulo: "Antecedentes Penales", descripcion: "Solicitar vía web del MPPRIJP con vigencia no mayor a 3 meses." },
      { icon: Globe, titulo: "Apostilla de La Haya", descripcion: "Realizar la apostilla en el MPPRE tras la legalización SAREN." },
    ],
  },
  colombia: {
    name: "Colombia",
    gentilicio: "Colombiano",
    gentilicioPlural: "Colombianos",
    code: "co",
    requisito: "Apostilla digital disponible vía cancilleria.gov.co",
    detalle:
      "Colombia ofrece un sistema de apostilla 100% digital a través de la Cancillería. Los documentos se pueden apostillar en línea en cancilleria.gov.co sin necesidad de desplazarse presencialmente.",
    documentos: [
      { icon: Globe, titulo: "Apostilla Digital", descripcion: "Realiza la apostilla de tus documentos en línea desde cancilleria.gov.co." },
      { icon: Shield, titulo: "Antecedentes Penales", descripcion: "Descargar el certificado desde la Policía Nacional de Colombia (en línea)." },
      { icon: FileText, titulo: "Registro Civil", descripcion: "Solicitar copia auténtica del registro civil de nacimiento en la Registraduría." },
    ],
  },
  honduras: {
    name: "Honduras",
    gentilicio: "Hondureño",
    gentilicioPlural: "Hondureños",
    code: "hn",
    requisito: "Apostilla presencial en Tegucigalpa o consulado",
    detalle:
      "Honduras requiere apostilla presencial en la Corte Suprema de Justicia en Tegucigalpa o a través del consulado más cercano. Es recomendable iniciar el proceso con tiempo debido a los plazos de gestión.",
    documentos: [
      { icon: Globe, titulo: "Apostilla Presencial", descripcion: "Acudir a la Corte Suprema de Justicia en Tegucigalpa o al consulado." },
      { icon: Shield, titulo: "Antecedentes Penales", descripcion: "Solicitar en la Dirección de Investigación Criminal (DIC)." },
      { icon: BookOpen, titulo: "Partida de Nacimiento", descripcion: "Obtener copia certificada en el Registro Nacional de las Personas." },
    ],
  },
  peru: {
    name: "Perú",
    gentilicio: "Peruano",
    gentilicioPlural: "Peruanos",
    code: "pe",
    requisito: "Legalización vía RREE y apostilla en cancillería",
    detalle:
      "Los documentos peruanos deben ser legalizados en el Ministerio de Relaciones Exteriores (RREE) y luego apostillados. Este trámite puede hacerse de forma presencial o a través de un representante.",
    documentos: [
      { icon: Globe, titulo: "Legalización RREE", descripcion: "Legalizar documentos en el Ministerio de Relaciones Exteriores del Perú." },
      { icon: Shield, titulo: "Antecedentes Penales", descripcion: "Solicitar el certificado de antecedentes en la PNP o vía web." },
      { icon: FileText, titulo: "Apostilla", descripcion: "Apostillar los documentos legalizados en la cancillería peruana." },
    ],
  },
  marruecos: {
    name: "Marruecos",
    gentilicio: "Marroquí",
    gentilicioPlural: "Marroquíes",
    code: "ma",
    requisito: "Traducción jurada obligatoria de documentos en árabe",
    detalle:
      "Todos los documentos marroquíes en árabe o francés deben ser traducidos por un traductor jurado reconocido en España. Además, deben ser legalizados por el Ministerio de Asuntos Exteriores de Marruecos.",
    documentos: [
      { icon: BookOpen, titulo: "Traducción Jurada", descripcion: "Todos los documentos deben ser traducidos al español por un traductor jurado." },
      { icon: Globe, titulo: "Legalización Consular", descripcion: "Legalizar documentos en el Ministerio de Asuntos Exteriores de Marruecos." },
      { icon: Shield, titulo: "Antecedentes Penales", descripcion: "Solicitar el extracto del registro penal (bulletin n°3) en Marruecos." },
    ],
  },
};

const RegularizacionPais = () => {
  const { paisId } = useParams<{ paisId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pais = paisId ? paisesData[paisId] : null;

  useEffect(() => {
    if (!pais) return;
    document.title = `Regularización 2026 para ${pais.gentilicioPlural} en España | Albus`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const content = `Guía completa para ${pais.gentilicioPlural.toLowerCase()} que quieren regularizarse en España en 2026. Requisitos, documentos y plazos.`;
    if (metaDesc) {
      metaDesc.setAttribute("content", content);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = content;
      document.head.appendChild(meta);
    }
  }, [pais]);

  if (!pais) {
    navigate("/españa/regularizacion", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CountdownBanner />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
              <span className="uppercase">{pais.code}</span>
              <span>•</span>
              <span>Regularización 2026</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Regularización 2026 para {pais.gentilicioPlural} en España: Guía Paso a Paso
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas saber como {pais.gentilicio.toLowerCase()} para presentar tu solicitud de regularización antes del 30 de junio de 2026.
            </p>

            <Button variant="hero" size="lg" className="gap-2" onClick={() => setIsModalOpen(true)}>
              Comenzar mi proceso
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Country-specific requirements */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-center">
              Requisitos Específicos para {pais.gentilicioPlural}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {pais.requisito}
            </p>

            <div className="bg-background border border-border rounded-xl p-6 mb-8">
              <p className="text-sm text-muted-foreground leading-relaxed">{pais.detalle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {pais.documentos.map((doc) => (
                <div key={doc.titulo} className="bg-background border border-border rounded-xl p-5 space-y-3">
                  <doc.icon className="w-5 h-5 text-foreground" />
                  <h3 className="font-semibold text-sm">{doc.titulo}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{doc.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Calculator */}
      <EligibilityCalculator onStartProcess={() => setIsModalOpen(true)} />

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              No pierdas tu oportunidad
            </h2>
            <p className="text-muted-foreground">
              Miles de {pais.gentilicioPlural.toLowerCase()} ya están preparando su documentación. Comienza hoy con Albus.
            </p>
            <Button variant="hero" size="lg" className="gap-2 text-lg px-8" onClick={() => setIsModalOpen(true)}>
              Empezar ahora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <AnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} source="reg2026" />
    </div>
  );
};

export default RegularizacionPais;
