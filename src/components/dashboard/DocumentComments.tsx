import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Comment {
  id: string;
  author_email: string;
  content: string;
  created_at: string;
}

interface DocumentCommentsProps {
  documentId: string;
}

export const DocumentComments = ({ documentId }: DocumentCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("document_comments")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: true });

      if (data) setComments(data);
    };
    fetch();
  }, [documentId]);

  if (comments.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageSquare className="w-3 h-3" />
        <span>Comentarios del equipo legal</span>
      </div>
      {comments.map((c) => (
        <div
          key={c.id}
          className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm"
        >
          <p className="text-foreground">{c.content}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(c.created_at), "d MMM yyyy, HH:mm", { locale: es })}
          </p>
        </div>
      ))}
    </div>
  );
};
