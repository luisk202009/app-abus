import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2, CheckCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StepFileUploadProps {
  stepId: string;
  existingFiles: Array<{
    id: string;
    document_type: string;
    file_url: string | null;
  }>;
  onUploadComplete: () => void;
  isPremium: boolean;
}

export const StepFileUpload = ({
  stepId,
  existingFiles,
  onUploadComplete,
  isPremium,
}: StepFileUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPremium) {
      toast({
        title: "Función Premium",
        description: "Actualiza a Premium para subir documentos.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${stepId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("user-documents")
        .getPublicUrl(fileName);

      // Save attachment record
      const { error: dbError } = await supabase
        .from("step_attachments")
        .insert({
          step_id: stepId,
          document_type: file.name,
          file_url: publicUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Documento subido",
        description: "Tu archivo se ha guardado correctamente.",
      });

      onUploadComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error al subir",
        description: error.message || "No se pudo subir el archivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteFile = async (attachmentId: string) => {
    try {
      const { error } = await supabase
        .from("step_attachments")
        .delete()
        .eq("id", attachmentId);

      if (error) throw error;

      toast({
        title: "Documento eliminado",
      });

      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{file.document_type}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDeleteFile(file.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Scanner buttons */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*"
        capture="environment"
      />

      <div className={cn("flex gap-2", isMobile ? "flex-col" : "")}>
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full gap-2", !isPremium && "opacity-50")}
            onClick={() => cameraInputRef.current?.click()}
            disabled={isUploading || !isPremium}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Escanear Documento
              </>
            )}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className={cn("w-full gap-2", !isPremium && "opacity-50")}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !isPremium}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {isPremium ? "Subir documento" : "Subir (Premium)"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
