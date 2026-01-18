import { useState } from "react";
import {
  FileText,
  Upload,
  Shield,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Home,
  CreditCard,
  CheckCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumModal } from "./PremiumModal";
import isotipoAlbus from "@/assets/isotipo-albus.png";

interface Document {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
  status: "pending" | "uploaded";
}

interface DocumentsSectionProps {
  visaType: string;
  isPremium?: boolean;
}

// Documents based on visa type
const getDocumentsByVisaType = (visaType: string): Document[] => {
  const baseDocuments: Document[] = [
    {
      id: "passport",
      name: "Pasaporte",
      description: "Vigente por al menos 1 año",
      icon: FileText,
      required: true,
      status: "pending",
    },
    {
      id: "criminal_record",
      name: "Certificado de Antecedentes",
      description: "Apostillados del país de origen",
      icon: Shield,
      required: true,
      status: "pending",
    },
    {
      id: "health_insurance",
      name: "Seguro Médico",
      description: "Cobertura mínima en España",
      icon: Stethoscope,
      required: true,
      status: "pending",
    },
    {
      id: "financial_proof",
      name: "Prueba de Fondos",
      description: "Extractos bancarios recientes",
      icon: CreditCard,
      required: true,
      status: "pending",
    },
  ];

  if (visaType === "digital_nomad") {
    return [
      ...baseDocuments,
      {
        id: "work_contract",
        name: "Contrato de Trabajo",
        description: "Con empresa extranjera",
        icon: Briefcase,
        required: true,
        status: "pending",
      },
      {
        id: "accommodation",
        name: "Prueba de Alojamiento",
        description: "Contrato o reserva en España",
        icon: Home,
        required: false,
        status: "pending",
      },
    ];
  }

  if (visaType === "student") {
    return [
      ...baseDocuments,
      {
        id: "acceptance_letter",
        name: "Carta de Aceptación",
        description: "De universidad española",
        icon: GraduationCap,
        required: true,
        status: "pending",
      },
      {
        id: "accommodation",
        name: "Prueba de Alojamiento",
        description: "Contrato o reserva",
        icon: Home,
        required: false,
        status: "pending",
      },
    ];
  }

  // Default consultation documents
  return [
    ...baseDocuments,
    {
      id: "photo",
      name: "Fotografías",
      description: "Tamaño carnet, fondo blanco",
      icon: FileText,
      required: true,
      status: "pending",
    },
    {
      id: "form",
      name: "Formulario Tasa 790",
      description: "Se generará automáticamente",
      icon: FileText,
      required: true,
      status: "pending",
    },
  ];
};

const StatusBadge = ({ status }: { status: "pending" | "uploaded" }) => {
  if (status === "uploaded") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Subido
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
      <Clock className="w-3 h-3" />
      Pendiente
    </span>
  );
};

export const DocumentsSection = ({
  visaType,
  isPremium = false,
}: DocumentsSectionProps) => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const documents = getDocumentsByVisaType(visaType);

  const handleUploadClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
    }
    // Future: Open upload dialog for premium users
  };

  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const uploadedCount = documents.filter((d) => d.status === "uploaded").length;

  return (
    <div className="space-y-6 relative">
      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <img src={isotipoAlbus} alt="" className="w-64 h-64" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Tu Bóveda de Documentos
        </h2>
        <p className="text-muted-foreground">
          Organiza todos los documentos necesarios para tu solicitud.
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-sm text-muted-foreground">
            {pendingCount} pendientes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">
            {uploadedCount} subidos
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={cn(
              "group relative bg-background border border-border rounded-xl p-5 transition-all duration-200",
              "hover:border-primary/30 hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Icon and content */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <doc.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                {/* Content */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{doc.name}</h3>
                    {doc.required && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium uppercase tracking-wide">
                        Req.
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                  <StatusBadge status={doc.status} />
                </div>
              </div>

              {/* Right: Upload button */}
              <button
                onClick={handleUploadClick}
                className={cn(
                  "shrink-0 w-10 h-10 rounded-lg border border-border flex items-center justify-center transition-all duration-200",
                  "hover:bg-primary hover:border-primary hover:text-primary-foreground",
                  "text-muted-foreground"
                )}
                title="Subir documento"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};
