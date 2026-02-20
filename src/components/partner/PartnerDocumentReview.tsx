import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PartnerDocument, PartnerComment } from "@/hooks/usePartnerData";

interface Props {
  userId: string;
  clientName: string | null;
  fetchDocuments: (userId: string) => Promise<PartnerDocument[]>;
  fetchComments: (docId: string) => Promise<PartnerComment[]>;
  addComment: (docId: string, content: string) => Promise<{ error: any }>;
  updateDocStatus: (docId: string, status: string) => Promise<{ error: any }>;
  onBack: () => void;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  waiting: { label: "Esperando", className: "bg-orange-100 text-orange-800" },
  analyzing: { label: "Analizando", className: "bg-blue-100 text-blue-800" },
  valid: { label: "Válido", className: "bg-green-100 text-green-800" },
  error: { label: "Error", className: "bg-red-100 text-red-800" },
};

export const PartnerDocumentReview = ({
  userId, clientName, fetchDocuments, fetchComments, addComment, updateDocStatus, onBack,
}: Props) => {
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [comments, setComments] = useState<PartnerComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDocuments(userId).then(setDocuments);
  }, [userId]);

  useEffect(() => {
    if (selectedDoc) fetchComments(selectedDoc).then(setComments);
  }, [selectedDoc]);

  const handleStatusChange = async (docId: string, status: string) => {
    const { error } = await updateDocStatus(docId, status);
    if (error) toast.error("Error al actualizar estado");
    else {
      toast.success("Estado actualizado");
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, status } : d));
    }
  };

  const handleAddComment = async () => {
    if (!selectedDoc || !newComment.trim()) return;
    setIsSubmitting(true);
    const { error } = await addComment(selectedDoc, newComment.trim());
    if (error) toast.error("Error al agregar comentario");
    else {
      toast.success("Comentario agregado");
      setNewComment("");
      fetchComments(selectedDoc).then(setComments);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver
        </Button>
        <h3 className="font-semibold">Documentos de {clientName || "cliente"}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Document list */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Documentos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {documents.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Sin documentos</p>
            )}
            {documents.map((doc) => {
              const st = statusLabels[doc.status || "waiting"] || statusLabels.waiting;
              return (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedDoc === doc.id ? "border-primary bg-muted/50" : "hover:bg-muted/30"}`}
                  onClick={() => setSelectedDoc(doc.id)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.document_type}</p>
                      <p className="text-xs text-muted-foreground">{doc.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={doc.status || "waiting"}
                      onValueChange={(val) => handleStatusChange(doc.id, val)}
                    >
                      <SelectTrigger className="w-[130px] h-7 text-xs">
                        <SelectValue>
                          <Badge className={st.className}>{st.label}</Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waiting">Esperando</SelectItem>
                        <SelectItem value="analyzing">Analizando</SelectItem>
                        <SelectItem value="valid">Válido</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Comments panel */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Comentarios</CardTitle></CardHeader>
          <CardContent>
            {!selectedDoc ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Selecciona un documento</p>
            ) : (
              <div className="space-y-3">
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {comments.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Sin comentarios</p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="p-2 rounded bg-muted/50 text-sm">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-medium">{c.author_email}</span>
                        <span>{format(new Date(c.created_at), "d MMM HH:mm", { locale: es })}</span>
                      </div>
                      <p>{c.content}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Agregar comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={isSubmitting || !newComment.trim()}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
