import { useState } from "react";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StepNote } from "@/hooks/useRouteDetail";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface StepNotesProps {
  notes: StepNote[];
  onAddNote: (content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export const StepNotes = ({ notes, onAddNote, onDeleteNote }: StepNotesProps) => {
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    setIsAdding(true);
    await onAddNote(newNote);
    setNewNote("");
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MessageSquare className="w-4 h-4" />
        <span>Notas ({notes.length})</span>
      </div>

      {/* Existing Notes */}
      {notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group relative bg-muted/50 rounded-lg p-3 text-sm"
            >
              <p className="text-foreground whitespace-pre-wrap pr-8">
                {note.content}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Hace{" "}
                {formatDistanceToNow(new Date(note.created_at), {
                  locale: es,
                })}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                onClick={() => onDeleteNote(note.id)}
              >
                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Note */}
      <div className="space-y-2">
        <Textarea
          placeholder="Escribe una nota o recordatorio..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Cmd/Ctrl + Enter para enviar
          </p>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newNote.trim() || isAdding}
            className="gap-1"
          >
            <Send className="w-3 h-3" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};
