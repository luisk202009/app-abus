import { Paperclip, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StepAttachment } from "@/hooks/useRouteDetail";

interface StepAttachmentsProps {
  attachments: StepAttachment[];
  onAttach: () => void;
  onRemove: (attachmentId: string) => Promise<void>;
}

export const StepAttachments = ({
  attachments,
  onAttach,
  onRemove,
}: StepAttachmentsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Paperclip className="w-4 h-4" />
        <span>Documentos adjuntos ({attachments.length})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {attachments.map((att) => (
          <Badge
            key={att.id}
            variant="secondary"
            className="gap-1 pr-1 text-sm font-normal"
          >
            <span>{att.document_type}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 hover:bg-destructive/20 rounded-full"
              onClick={() => onRemove(att.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={onAttach}
          className="gap-1 h-6 text-xs"
        >
          <Plus className="w-3 h-3" />
          Adjuntar
        </Button>
      </div>
    </div>
  );
};
