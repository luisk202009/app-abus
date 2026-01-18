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
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumModal } from "./PremiumModal";

interface Document {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
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
    },
    {
      id: "criminal_record",
      name: "Antecedentes Penales",
      description: "Apostillados del país de origen",
      icon: Shield,
      required: true,
    },
    {
      id: "health_insurance",
      name: "Seguro Médico",
      description: "Cobertura mínima en España",
      icon: Stethoscope,
      required: true,
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
      },
      {
        id: "income_proof",
        name: "Prueba de Ingresos",
        description: "Últimos 3 meses de nóminas",
        icon: CreditCard,
        required: true,
      },
      {
        id: "accommodation",
        name: "Prueba de Alojamiento",
        description: "Contrato o reserva en España",
        icon: Home,
        required: false,
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
      },
      {
        id: "financial_proof",
        name: "Solvencia Económica",
        description: "Extractos bancarios",
        icon: CreditCard,
        required: true,
      },
      {
        id: "accommodation",
        name: "Prueba de Alojamiento",
        description: "Contrato o reserva",
        icon: Home,
        required: false,
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
    },
    {
      id: "form",
      name: "Formulario de Solicitud",
      description: "Se generará automáticamente",
      icon: FileText,
      required: true,
    },
  ];
};

export const DocumentsSection = ({
  visaType,
  isPremium = false,
}: DocumentsSectionProps) => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const documents = getDocumentsByVisaType(visaType);

  const handleDocumentClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
    }
    // Future: Open upload dialog for premium users
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Tu Bóveda de Documentos
        </h2>
        <p className="text-muted-foreground">
          Organiza todos los documentos necesarios para tu solicitud.
        </p>
      </div>

      {/* Info Banner */}
      {!isPremium && (
        <div className="bg-secondary/50 border border-border rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Plan Gratuito</p>
            <p className="text-sm text-muted-foreground">
              Actualiza a Pro para subir y validar documentos automáticamente.
            </p>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={handleDocumentClick}
            className={cn(
              "group relative bg-background border border-border rounded-xl p-5 text-left transition-all duration-200",
              "hover:border-primary/50 hover:shadow-sm",
              !isPremium && "cursor-pointer"
            )}
          >
            {/* Lock indicator for free plan */}
            {!isPremium && (
              <div className="absolute top-3 right-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            )}

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <doc.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{doc.name}</h3>
                {doc.required && (
                  <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                    Requerido
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{doc.description}</p>
            </div>

            {/* Upload indicator */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
              <Upload className="w-4 h-4" />
              <span>Subir documento</span>
            </div>
          </button>
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
