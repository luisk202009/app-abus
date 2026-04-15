import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { validateDocument } from "@/lib/mockDocumentValidation";
import type { DocumentStatus, RouteType, DocumentCategory } from "@/lib/documentConfig";

export interface UserDocument {
  id: string;
  user_id: string;
  category: DocumentCategory;
  document_type: string;
  file_url: string | null;
  file_name: string | null;
  status: DocumentStatus;
  validation_message: string | null;
  route_type: RouteType;
  created_at: string;
  updated_at: string;
}

interface UseDocumentVaultReturn {
  documents: UserDocument[];
  isLoading: boolean;
  isUploading: boolean;
  uploadDocument: (category: DocumentCategory, documentType: string, file: File) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  getDocumentsByCategory: (category: DocumentCategory) => UserDocument[];
  allRequiredValid: boolean;
  refreshDocuments: () => Promise<void>;
}

export const useDocumentVault = (routeType: RouteType | null): UseDocumentVaultReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    if (!user || !routeType) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("route_type", routeType);

      if (error) throw error;

      setDocuments((data as UserDocument[]) || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los documentos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, routeType, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Upload document
  const uploadDocument = useCallback(
    async (category: DocumentCategory, documentType: string, file: File) => {
      if (!user || !routeType) return;

      setIsUploading(true);

      try {
        // Upload file to storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${routeType}/${documentType}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("user-documents")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("user-documents")
          .getPublicUrl(fileName);

        // Check if document record already exists
        const { data: existing } = await supabase
          .from("user_documents")
          .select("id")
          .eq("user_id", user.id)
          .eq("route_type", routeType)
          .eq("document_type", documentType)
          .maybeSingle();

        const documentRecord = {
          user_id: user.id,
          category,
          document_type: documentType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          status: "valid" as DocumentStatus,
          route_type: routeType,
          validation_message: null,
          updated_at: new Date().toISOString(),
        };

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from("user_documents")
            .update(documentRecord)
            .eq("id", existing.id);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from("user_documents")
            .insert(documentRecord);

          if (error) throw error;
        }

        // Refresh to get updated record
        await fetchDocuments();

        toast({
          title: "¡Documento subido!",
          description: "El documento se guardó correctamente.",
        });
      } catch (error) {
        console.error("Error uploading document:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo subir el documento. Intenta de nuevo.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [user, routeType, fetchDocuments, toast]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (documentId: string) => {
      if (!user) return;

      try {
        // Get document to find file URL
        const doc = documents.find((d) => d.id === documentId);
        
        if (doc?.file_url) {
          // Extract file path from URL
          const urlParts = doc.file_url.split("/user-documents/");
          if (urlParts[1]) {
            await supabase.storage
              .from("user-documents")
              .remove([urlParts[1]]);
          }
        }

        // Delete record
        const { error } = await supabase
          .from("user_documents")
          .delete()
          .eq("id", documentId);

        if (error) throw error;

        // Refresh
        await fetchDocuments();

        toast({
          title: "Documento eliminado",
          description: "El documento ha sido eliminado.",
        });
      } catch (error) {
        console.error("Error deleting document:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el documento.",
        });
      }
    },
    [user, documents, fetchDocuments, toast]
  );

  // Get documents by category
  const getDocumentsByCategory = useCallback(
    (category: DocumentCategory): UserDocument[] => {
      return documents.filter((d) => d.category === category);
    },
    [documents]
  );

  // Check if all required documents are valid
  // This is a simplified check - in production, compare against required docs config
  const allRequiredValid = documents.length > 0 && 
    documents.every((d) => d.status === "valid");

  return {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    getDocumentsByCategory,
    allRequiredValid,
    refreshDocuments: fetchDocuments,
  };
};
