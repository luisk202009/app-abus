import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { ActiveRoute, RouteStep } from "./useRoutes";

export interface StepNote {
  id: string;
  step_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface StepAttachment {
  id: string;
  step_id: string;
  document_type: string;
  file_url: string | null;
  created_at: string;
}

interface UseRouteDetailReturn {
  route: ActiveRoute | null;
  isLoading: boolean;
  notes: Record<string, StepNote[]>;
  attachments: Record<string, StepAttachment[]>;
  updateStepProgress: (stepId: string, isCompleted: boolean) => Promise<void>;
  addNote: (stepId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string, stepId: string) => Promise<void>;
  attachDocument: (stepId: string, documentType: string, fileUrl?: string) => Promise<void>;
  removeAttachment: (attachmentId: string, stepId: string) => Promise<void>;
}

export const useRouteDetail = (): UseRouteDetailReturn => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [route, setRoute] = useState<ActiveRoute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, StepNote[]>>({});
  const [attachments, setAttachments] = useState<Record<string, StepAttachment[]>>({});

  // Fetch route data
  useEffect(() => {
    const fetchRouteDetail = async () => {
      if (!user || !routeId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch route with template
        const { data: routeData, error: routeError } = await supabase
          .from("user_active_routes")
          .select(`*, route_templates (*)`)
          .eq("id", routeId)
          .eq("user_id", user.id)
          .single();

        if (routeError) throw routeError;

        // Fetch progress steps
        const { data: progressData, error: progressError } = await supabase
          .from("user_route_progress")
          .select("*")
          .eq("user_route_id", routeId)
          .order("id");

        if (progressError) throw progressError;

        const steps: RouteStep[] = (progressData || []).map((p, index) => ({
          id: p.id,
          title: p.step_title || "",
          description: p.step_description || null,
          step_order: index + 1,
          is_completed: p.is_completed || false,
        }));

        setRoute({
          id: routeData.id,
          template_id: routeData.template_id,
          status: routeData.status,
          created_at: routeData.created_at,
          template: routeData.route_templates,
          progress: steps,
        });

        // Fetch notes for all steps
        const stepIds = steps.map((s) => s.id);
        if (stepIds.length > 0) {
          const { data: notesData } = await supabase
            .from("step_notes")
            .select("*")
            .in("step_id", stepIds)
            .order("created_at", { ascending: true });

          const notesByStep: Record<string, StepNote[]> = {};
          (notesData || []).forEach((note) => {
            if (!notesByStep[note.step_id]) notesByStep[note.step_id] = [];
            notesByStep[note.step_id].push(note);
          });
          setNotes(notesByStep);

          // Fetch attachments for all steps
          const { data: attachmentsData } = await supabase
            .from("step_attachments")
            .select("*")
            .in("step_id", stepIds)
            .order("created_at", { ascending: true });

          const attachmentsByStep: Record<string, StepAttachment[]> = {};
          (attachmentsData || []).forEach((att) => {
            if (!attachmentsByStep[att.step_id]) attachmentsByStep[att.step_id] = [];
            attachmentsByStep[att.step_id].push(att);
          });
          setAttachments(attachmentsByStep);
        }
      } catch (error) {
        console.error("Error fetching route detail:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la ruta.",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteDetail();
  }, [user, routeId, navigate, toast]);

  // Update step progress
  const updateStepProgress = useCallback(
    async (stepId: string, isCompleted: boolean) => {
      if (!route) return;

      // Optimistic update
      setRoute((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          progress: prev.progress.map((step) =>
            step.id === stepId ? { ...step, is_completed: isCompleted } : step
          ),
        };
      });

      try {
        const { error } = await supabase
          .from("user_route_progress")
          .update({ is_completed: isCompleted })
          .eq("id", stepId);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating progress:", error);
        // Rollback
        setRoute((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            progress: prev.progress.map((step) =>
              step.id === stepId ? { ...step, is_completed: !isCompleted } : step
            ),
          };
        });
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar el progreso.",
        });
      }
    },
    [route, toast]
  );

  // Add a note
  const addNote = useCallback(
    async (stepId: string, content: string) => {
      if (!user || !content.trim()) return;

      try {
        const { data, error } = await supabase
          .from("step_notes")
          .insert({
            step_id: stepId,
            user_id: user.id,
            content: content.trim(),
          })
          .select()
          .single();

        if (error) throw error;

        setNotes((prev) => ({
          ...prev,
          [stepId]: [...(prev[stepId] || []), data],
        }));

        toast({
          title: "Nota agregada",
          description: "Tu nota ha sido guardada.",
        });
      } catch (error) {
        console.error("Error adding note:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo agregar la nota.",
        });
      }
    },
    [user, toast]
  );

  // Delete a note
  const deleteNote = useCallback(
    async (noteId: string, stepId: string) => {
      try {
        const { error } = await supabase
          .from("step_notes")
          .delete()
          .eq("id", noteId);

        if (error) throw error;

        setNotes((prev) => ({
          ...prev,
          [stepId]: (prev[stepId] || []).filter((n) => n.id !== noteId),
        }));
      } catch (error) {
        console.error("Error deleting note:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la nota.",
        });
      }
    },
    [toast]
  );

  // Attach a document
  const attachDocument = useCallback(
    async (stepId: string, documentType: string, fileUrl?: string) => {
      try {
        const { data, error } = await supabase
          .from("step_attachments")
          .insert({
            step_id: stepId,
            document_type: documentType,
            file_url: fileUrl || null,
          })
          .select()
          .single();

        if (error) throw error;

        setAttachments((prev) => ({
          ...prev,
          [stepId]: [...(prev[stepId] || []), data],
        }));

        toast({
          title: "Documento adjuntado",
          description: `${documentType} vinculado a este paso.`,
        });
      } catch (error) {
        console.error("Error attaching document:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo adjuntar el documento.",
        });
      }
    },
    [toast]
  );

  // Remove an attachment
  const removeAttachment = useCallback(
    async (attachmentId: string, stepId: string) => {
      try {
        const { error } = await supabase
          .from("step_attachments")
          .delete()
          .eq("id", attachmentId);

        if (error) throw error;

        setAttachments((prev) => ({
          ...prev,
          [stepId]: (prev[stepId] || []).filter((a) => a.id !== attachmentId),
        }));
      } catch (error) {
        console.error("Error removing attachment:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el documento.",
        });
      }
    },
    [toast]
  );

  return {
    route,
    isLoading,
    notes,
    attachments,
    updateStepProgress,
    addNote,
    deleteNote,
    attachDocument,
    removeAttachment,
  };
};
