import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteStep } from "@/hooks/useRoutes";
import { StepNote, StepAttachment } from "@/hooks/useRouteDetail";
import { StepNotes } from "./StepNotes";
import { StepAttachments } from "./StepAttachments";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface StepCardProps {
  step: RouteStep;
  notes: StepNote[];
  attachments: StepAttachment[];
  onToggleComplete: (isCompleted: boolean) => void;
  onAddNote: (content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onAttachDocument: () => void;
  onRemoveAttachment: (attachmentId: string) => Promise<void>;
}

export const StepCard = ({
  step,
  notes,
  attachments,
  onToggleComplete,
  onAddNote,
  onDeleteNote,
  onAttachDocument,
  onRemoveAttachment,
}: StepCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasContent = step.description || notes.length > 0 || attachments.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "border rounded-xl transition-all",
          isOpen ? "bg-card shadow-sm" : "bg-background hover:bg-card/50"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(!step.is_completed);
            }}
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              step.is_completed
                ? "bg-primary border-primary"
                : "border-muted-foreground/40 hover:border-primary"
            )}
          >
            {step.is_completed && <Check className="w-4 h-4 text-primary-foreground" />}
          </button>

          {/* Title & Step Number */}
          <CollapsibleTrigger asChild>
            <button className="flex-1 flex items-center justify-between text-left">
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "font-medium transition-all",
                    step.is_completed && "line-through text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Paso {step.step_order}
                  {notes.length > 0 && ` • ${notes.length} nota${notes.length > 1 ? "s" : ""}`}
                  {attachments.length > 0 &&
                    ` • ${attachments.length} documento${attachments.length > 1 ? "s" : ""}`}
                </p>
              </div>

              {hasContent && (
                <span className="text-muted-foreground">
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </span>
              )}
            </button>
          </CollapsibleTrigger>
        </div>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 space-y-4 border-t mx-4 mt-0 pt-4">
            {/* Description */}
            {step.description && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Descripción
                </p>
                <p className="text-sm text-foreground">{step.description}</p>
              </div>
            )}

            {/* Attachments */}
            <StepAttachments
              attachments={attachments}
              onAttach={onAttachDocument}
              onRemove={onRemoveAttachment}
            />

            {/* Notes */}
            <StepNotes
              notes={notes}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
