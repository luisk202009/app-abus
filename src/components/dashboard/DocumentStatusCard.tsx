import { useState, useRef } from "react";
import { FileText, Upload, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import type { DocumentStatus, DocumentType } from "@/lib/documentConfig";

interface DocumentStatusCardProps {
  document: DocumentType;
  status: DocumentStatus;
  fileName?: string | null;
  validationMessage?: string | null;
  onUpload: (file: File) => void;
  onDelete?: () => void;
  isUploading?: boolean;
  isPremium: boolean;
  onPremiumRequired: () => void;
}

export const DocumentStatusCard = ({
  document,
  status,
  fileName,
  validationMessage,
  onUpload,
  onDelete,
  isUploading = false,
  isPremium,
  onPremiumRequired,
}: DocumentStatusCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (!isPremium) {
      onPremiumRequired();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "bg-background border rounded-xl p-5 transition-all duration-200",
        status === "error" && "border-red-200 bg-red-50/30",
        status === "valid" && "border-green-200 bg-green-50/30",
        status === "analyzing" && "border-blue-200 bg-blue-50/30",
        status === "waiting" && "border-border hover:border-primary/30 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            status === "valid" && "bg-green-100",
            status === "error" && "bg-red-100",
            status === "analyzing" && "bg-blue-100",
            status === "waiting" && "bg-secondary"
          )}
        >
          <FileText
            className={cn(
              "w-6 h-6",
              status === "valid" && "text-green-600",
              status === "error" && "text-red-600",
              status === "analyzing" && "text-blue-600",
              status === "waiting" && "text-muted-foreground"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium truncate">{document.name}</h4>
            {document.required && (
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium uppercase tracking-wide">
                Req.
              </span>
            )}
            {document.hasAiValidation && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium uppercase tracking-wide">
                IA
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{document.description}</p>
          
          {/* Status Badge */}
          <StatusBadge status={status} />

          {/* File name if uploaded */}
          {fileName && status !== "waiting" && (
            <p className="text-xs text-muted-foreground truncate">
              📎 {fileName}
            </p>
          )}

          {/* Error message */}
          {status === "error" && validationMessage && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{validationMessage}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {status !== "analyzing" && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleUploadClick}
                disabled={isUploading}
                className={cn(
                  "h-9 w-9",
                  !isPremium && "opacity-70"
                )}
                title={isPremium ? "Subir documento" : "Función Pro"}
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              {fileName && onDelete && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDelete}
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  title="Eliminar documento"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
      />
    </div>
  );
};
