import { useState, useRef } from "react";
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
  Sparkles,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumModal } from "./PremiumModal";
import { Button } from "@/components/ui/button";
import { generateTasa790PDF } from "@/lib/generateTasa790";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  onCheckout?: () => Promise<void>;
  isCheckoutLoading?: boolean;
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
  onCheckout,
  isCheckoutLoading = false,
}: DocumentsSectionProps) => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const documents = getDocumentsByVisaType(visaType);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = (docId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setUploadingDocId(docId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !uploadingDocId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Archivo muy grande", description: "El tamaño máximo es 5 MB." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${uploadingDocId}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("user-documents").upload(path, file);
      if (error) throw error;
      toast({ title: "Documento subido", description: `${file.name} subido correctamente.` });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ variant: "destructive", title: "Error al subir", description: "No se pudo subir el archivo. Intenta de nuevo." });
    } finally {
      setIsUploading(false);
      setUploadingDocId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerateTasa790 = async () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Necesitas iniciar sesión para generar el documento.",
      });
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Fetch user data from onboarding_submissions
      const { data, error } = await supabase
        .from("onboarding_submissions")
        .select("full_name, nationality, current_location, email, professional_profile")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        throw new Error("No se encontraron tus datos");
      }

      // Generate the PDF
      generateTasa790PDF({
        fullName: data.full_name || "",
        nationality: data.nationality || "",
        currentLocation: data.current_location || "",
        email: data.email || user.email || "",
        professionalProfile: data.professional_profile || "",
      });

      toast({
        title: "¡Documento generado!",
        description: "Tu formulario Tasa 790-012 se ha descargado.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el documento. Intenta de nuevo.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
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

      {/* Generate Tasa 790 Card */}
      <div
        className={cn(
          "bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 transition-all duration-200",
          isPremium && "hover:border-primary/40 hover:shadow-md cursor-pointer"
        )}
        onClick={isPremium ? handleGenerateTasa790 : () => setShowPremiumModal(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Generar Tasa 790-012</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded font-semibold uppercase tracking-wide">
                  Pro
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Formulario pre-llenado con tus datos, listo para imprimir
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              if (isPremium) {
                handleGenerateTasa790();
              } else {
                setShowPremiumModal(true);
              }
            }}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
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
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
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
                type="button"
                onClick={handleUploadClick(doc.id)}
                disabled={isUploading && uploadingDocId === doc.id}
                className={cn(
                  "shrink-0 w-10 h-10 rounded-lg border border-border flex items-center justify-center transition-all duration-200",
                  "hover:bg-primary hover:border-primary hover:text-primary-foreground",
                  "text-muted-foreground",
                  isUploading && uploadingDocId === doc.id && "opacity-50 cursor-not-allowed"
                )}
                title={isPremium ? "Subir documento" : "Función Pro"}
              >
                {isUploading && uploadingDocId === doc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileChange}
      />

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onCheckout={onCheckout}
        isCheckoutLoading={isCheckoutLoading}
      />
    </div>
  );
};
