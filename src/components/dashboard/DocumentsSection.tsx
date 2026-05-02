import { useState, useRef, useEffect, useCallback } from "react";
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
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumModal } from "./PremiumModal";
import { Button } from "@/components/ui/button";
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
}

interface UploadedDoc {
  id: string;
  file_name: string | null;
  file_path: string | null; // ruta interna en storage (para signed URL)
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
    },
    {
      id: "criminal_record",
      name: "Certificado de Antecedentes",
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
    {
      id: "financial_proof",
      name: "Prueba de Fondos",
      description: "Extractos bancarios recientes",
      icon: CreditCard,
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
        id: "accommodation",
        name: "Prueba de Alojamiento",
        description: "Contrato o reserva",
        icon: Home,
        required: false,
      },
    ];
  }

  // Default consultation documents (sin Tasa 790)
  return [
    ...baseDocuments,
    {
      id: "photo",
      name: "Fotografías",
      description: "Tamaño carnet, fondo blanco",
      icon: FileText,
      required: true,
    },
  ];
};

const StatusBadge = ({ uploaded }: { uploaded: boolean }) => {
  if (uploaded) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
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
  const { user } = useAuth();
  const { toast } = useToast();
  const documents = getDocumentsByVisaType(visaType);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Mapa: docId -> info del documento subido
  const [uploadedMap, setUploadedMap] = useState<Record<string, UploadedDoc>>({});

  // Carga los documentos persistidos del usuario
  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    const docTypes = documents.map((d) => d.id);
    const { data, error } = await supabase
      .from("user_documents")
      .select("id, document_type, file_name, file_url")
      .eq("user_id", user.id)
      .in("document_type", docTypes);

    if (error) {
      console.error("Error fetching user documents:", error);
      return;
    }
    const map: Record<string, UploadedDoc> = {};
    (data ?? []).forEach((row) => {
      // file_url contiene la ruta interna del storage (no URL pública porque el bucket es privado)
      map[row.document_type] = {
        id: row.id,
        file_name: row.file_name,
        file_path: row.file_url,
      };
    });
    setUploadedMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, visaType]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
    const docId = uploadingDocId;
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${docId}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(path, file);
      if (uploadError) throw uploadError;

      // Buscar registro existente para este document_type
      const { data: existing } = await supabase
        .from("user_documents")
        .select("id, file_url")
        .eq("user_id", user.id)
        .eq("document_type", docId)
        .maybeSingle();

      const record = {
        user_id: user.id,
        category: "identidad" as const,
        document_type: docId,
        file_url: path, // guardamos la ruta interna del storage
        file_name: file.name,
        status: "valid" as const,
        validation_message: null,
        updated_at: new Date().toISOString(),
      };

      let newId = existing?.id;
      if (existing) {
        // Eliminar archivo anterior si cambió la ruta
        if (existing.file_url && existing.file_url !== path) {
          await supabase.storage.from("user-documents").remove([existing.file_url]);
        }
        const { error } = await supabase
          .from("user_documents")
          .update(record)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from("user_documents")
          .insert(record)
          .select("id")
          .single();
        if (error) throw error;
        newId = inserted.id;
      }

      setUploadedMap((prev) => ({
        ...prev,
        [docId]: { id: newId!, file_name: file.name, file_path: path },
      }));

      toast({ title: "Documento subido", description: `${file.name} guardado correctamente.` });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ variant: "destructive", title: "Error al subir", description: "No se pudo subir el archivo. Intenta de nuevo." });
    } finally {
      setIsUploading(false);
      setUploadingDocId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleViewDocument = async (docId: string) => {
    const doc = uploadedMap[docId];
    if (!doc?.file_path) return;
    try {
      const { data, error } = await supabase.storage
        .from("user-documents")
        .createSignedUrl(doc.file_path, 60 * 10); // 10 minutos
      if (error || !data?.signedUrl) throw error || new Error("No se pudo generar URL");
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      console.error("View error:", err);
      toast({ variant: "destructive", title: "Error", description: "No se pudo abrir el documento." });
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    const doc = uploadedMap[docId];
    if (!doc || !user) return;
    try {
      if (doc.file_path) {
        await supabase.storage.from("user-documents").remove([doc.file_path]);
      }
      const { error } = await supabase.from("user_documents").delete().eq("id", doc.id);
      if (error) throw error;
      setUploadedMap((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      toast({ title: "Documento eliminado" });
    } catch (err) {
      console.error("Delete error:", err);
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el documento." });
    }
  };

  const uploadedCount = Object.keys(uploadedMap).length;
  const pendingCount = documents.length - uploadedCount;

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
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">
            {uploadedCount} subidos
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const uploaded = uploadedMap[doc.id];
          const isCurrentUploading = isUploading && uploadingDocId === doc.id;
          return (
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
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <doc.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

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
                    <StatusBadge uploaded={!!uploaded} />
                    {uploaded?.file_name && (
                      <p className="text-xs text-muted-foreground truncate">
                        📎 {uploaded.file_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {uploaded && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleViewDocument(doc.id)}
                        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
                        title="Ver documento"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleUploadClick(doc.id)}
                    disabled={isCurrentUploading}
                    className={cn(
                      "shrink-0 w-9 h-9 rounded-lg border border-border flex items-center justify-center transition-all duration-200",
                      "hover:bg-primary hover:border-primary hover:text-primary-foreground",
                      "text-muted-foreground",
                      isCurrentUploading && "opacity-50 cursor-not-allowed"
                    )}
                    title={isPremium ? (uploaded ? "Reemplazar documento" : "Subir documento") : "Función Pro"}
                  >
                    {isCurrentUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
