import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserDocument {
  id: string;
  user_id: string;
  document_type: string;
  category: string;
  status: string | null;
  file_name: string | null;
  file_url: string | null;
  route_type: string | null;
  validation_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_email?: string;
}

const STATUS_OPTIONS = [
  { value: "waiting", label: "Pendiente", color: "bg-muted text-muted-foreground" },
  { value: "analyzing", label: "En Revisión", color: "bg-amber-100 text-amber-800" },
  { value: "valid", label: "Validado", color: "bg-green-100 text-green-800" },
  { value: "error", label: "Error", color: "bg-red-100 text-red-800" },
];

export const AdminDocumentsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentDocId, setCommentDocId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // Fetch all user documents (admin RLS policy allows this)
      const { data: docs, error } = await supabase
        .from("user_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user emails
      const userIds = [...new Set((docs || []).map((d) => d.user_id))];
      const { data: submissions } = await supabase
        .from("onboarding_submissions")
        .select("user_id, email")
        .in("user_id", userIds);

      const emailMap = new Map(
        (submissions || []).map((s) => [s.user_id, s.email])
      );

      setDocuments(
        (docs || []).map((d) => ({
          ...d,
          user_email: emailMap.get(d.user_id) || "—",
        }))
      );
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (docId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("user_documents")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", docId);

      if (error) throw error;

      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d))
      );

      toast({ title: "Estado actualizado" });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error al actualizar" });
    }
  };

  const handleAddComment = async (docId: string) => {
    if (!commentText.trim() || !user?.email) return;
    setIsSending(true);

    try {
      const { error } = await supabase.from("document_comments").insert({
        document_id: docId,
        author_email: user.email,
        content: commentText.trim(),
      });

      if (error) throw error;

      setCommentText("");
      setCommentDocId(null);
      toast({ title: "Comentario añadido" });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error al añadir comentario" });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
    return <Badge className={opt.color}>{opt.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Documentos</CardTitle>
          <CardDescription>
            Revisa, valida y comenta documentos de todos los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="text-sm">{doc.user_email}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {doc.document_type}
                    {doc.file_name && (
                      <span className="block text-xs text-muted-foreground truncate max-w-[120px]">
                        {doc.file_name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.route_type || "—"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={doc.status || "waiting"}
                      onValueChange={(v) => handleStatusChange(doc.id, v)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {doc.created_at
                      ? format(new Date(doc.created_at), "d MMM yyyy", { locale: es })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCommentDocId(commentDocId === doc.id ? null : doc.id)
                      }
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay documentos subidos aún
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Inline Comment Form */}
          {commentDocId && (
            <div className="mt-4 p-4 border border-border rounded-lg bg-muted/30 space-y-3">
              <p className="text-sm font-medium">
                Añadir comentario para documento
              </p>
              <Textarea
                placeholder="Escribe un comentario para el usuario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAddComment(commentDocId)}
                  disabled={!commentText.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Send className="w-4 h-4 mr-1" />
                  )}
                  Enviar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCommentDocId(null);
                    setCommentText("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
