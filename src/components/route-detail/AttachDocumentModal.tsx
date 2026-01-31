import { useState } from "react";
import { FileText, Check, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Document types available in the vault
const DOCUMENT_TYPES = [
  { id: "passport", name: "Pasaporte", icon: "🛂" },
  { id: "antecedentes", name: "Antecedentes Penales", icon: "📋" },
  { id: "titulo", name: "Título Universitario", icon: "🎓" },
  { id: "contrato", name: "Contrato Laboral", icon: "📝" },
  { id: "seguro", name: "Seguro Médico", icon: "🏥" },
  { id: "bancario", name: "Certificado Bancario", icon: "🏦" },
  { id: "matrimonio", name: "Certificado de Matrimonio", icon: "💍" },
  { id: "nacimiento", name: "Certificado de Nacimiento", icon: "👶" },
  { id: "residencia", name: "Comprobante de Residencia", icon: "🏠" },
  { id: "foto", name: "Fotografías", icon: "📷" },
];

interface AttachDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (documentType: string) => void;
  alreadyAttached: string[];
}

export const AttachDocumentModal = ({
  isOpen,
  onClose,
  onAttach,
  alreadyAttached,
}: AttachDocumentModalProps) => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleAttach = () => {
    if (selectedDoc) {
      const doc = DOCUMENT_TYPES.find((d) => d.id === selectedDoc);
      if (doc) {
        onAttach(doc.name);
        setSelectedDoc(null);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjuntar documento</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Selecciona un documento de tu bóveda para vincularlo a este paso.
        </p>

        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-2">
            {DOCUMENT_TYPES.map((doc) => {
              const isAttached = alreadyAttached.includes(doc.name);
              const isSelected = selectedDoc === doc.id;

              return (
                <button
                  key={doc.id}
                  onClick={() => !isAttached && setSelectedDoc(doc.id)}
                  disabled={isAttached}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isAttached
                      ? "bg-muted/50 border-border opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "bg-primary/5 border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{doc.icon}</span>
                    <span className="font-medium text-sm">{doc.name}</span>
                  </div>
                  {isAttached ? (
                    <span className="text-xs text-muted-foreground">
                      Ya adjunto
                    </span>
                  ) : isSelected ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAttach} disabled={!selectedDoc}>
            Adjuntar documento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
