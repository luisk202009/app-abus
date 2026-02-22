import { useState } from "react";
import { FolderLock, Sparkles } from "lucide-react";
import { DocumentCategory } from "./DocumentCategory";
import { SubmitForReviewButton } from "./SubmitForReviewButton";
import { PremiumFeatureModal } from "./PremiumFeatureModal";
import { useDocumentVault } from "@/hooks/useDocumentVault";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENT_CATEGORIES, STRIPE_PRICES } from "@/lib/documentConfig";
import type { RouteType, DocumentCategory as CategoryType } from "@/lib/documentConfig";
import isotipoAlbus from "@/assets/isotipo-albus.png";
import { supabase } from "@/integrations/supabase/client";

interface DocumentVaultProps {
  routeType: RouteType;
  isPremium: boolean;
}

export const DocumentVault = ({ routeType, isPremium }: DocumentVaultProps) => {
  const { toast } = useToast();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    getDocumentsByCategory,
    allRequiredValid,
  } = useDocumentVault(routeType);

  const config = DOCUMENT_CATEGORIES[routeType];

  const handleUpgrade = async (priceId: string) => {
    setIsUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          variant: "destructive",
          title: "Inicia sesión",
          description: "Necesitas iniciar sesión para suscribirte.",
        });
        return;
      }

      const response = await fetch(
        "https://uidwcgxbybjpbteowrnh.supabase.co/functions/v1/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            priceId,
            returnUrl: window.location.origin,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error("Checkout server error:", data);
        throw new Error(data.error);
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el proceso de pago.",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleSubmitForReview = () => {
    toast({
      title: "Documentos enviados",
      description: "Tu expediente ha sido enviado para revisión. Te contactaremos pronto.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <img src={isotipoAlbus} alt="" className="w-10 h-10 opacity-50" />
          <p className="text-sm text-muted-foreground">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  const categories: CategoryType[] = ["identidad", "residencia", "antecedentes", "identidad_permanente"];

  return (
    <div className="space-y-8 relative">
      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
        <img src={isotipoAlbus} alt="" className="w-72 h-72" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <FolderLock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Tu Bóveda de Documentos
            </h2>
            <p className="text-sm text-muted-foreground">
              Organiza y valida tus documentos para la solicitud
            </p>
          </div>
        </div>
      </div>

      {/* AI Badge */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <p className="text-sm text-blue-700">
          <span className="font-medium">Validación IA:</span> Los documentos marcados con{" "}
          <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
            IA
          </span>{" "}
          serán analizados automáticamente.
        </p>
      </div>

      {/* Document Categories */}
      <div className="space-y-8">
        {categories.map((category) => (
          <DocumentCategory
            key={category}
            category={category}
            title={config[category].title}
            documents={config[category].documents}
            userDocuments={getDocumentsByCategory(category)}
            onUpload={(docType, file) => uploadDocument(category, docType, file)}
            onDelete={deleteDocument}
            isUploading={isUploading}
            isPremium={isPremium}
            onPremiumRequired={() => setShowPremiumModal(true)}
          />
        ))}
      </div>

      {/* Submit Button */}
      <SubmitForReviewButton
        allValid={allRequiredValid}
        isPremium={isPremium}
        onSubmit={handleSubmitForReview}
        onPremiumRequired={() => setShowPremiumModal(true)}
      />

      {/* Premium Modal */}
      <PremiumFeatureModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
        isLoading={isUpgrading}
        feature="la Bóveda de Documentos"
      />
    </div>
  );
};
