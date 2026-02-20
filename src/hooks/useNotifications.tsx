import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Notification {
  id: string;
  type: "retention" | "approval" | "partner_comment";
  message: string;
  icon: "alert" | "success" | "info";
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const check = async () => {
      const notifs: Notification[] = [];

      try {
        // Check for approved application
        const { data: appointment } = await supabase
          .from("user_appointments")
          .select("application_status, updated_at")
          .eq("user_id", user.id)
          .eq("application_status", "aprobada")
          .maybeSingle();

        if (appointment) {
          const updatedAt = new Date(appointment.updated_at);
          const hoursSinceApproval = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceApproval < 72) {
            notifs.push({
              id: "application_approved",
              type: "approval",
              message: "¡Enhorabuena! Tu residencia ha sido concedida. Ve a Gestión de Cita para empezar con tu TIE.",
              icon: "success",
            });
          }
        }
        // Check for validated documents
        const { data: validDocs } = await supabase
          .from("user_documents")
          .select("document_type")
          .eq("user_id", user.id)
          .eq("status", "valid");

        if (validDocs && validDocs.length > 0) {
          notifs.push({
            id: "approval",
            type: "approval",
            message: `¡Documento validado con éxito! (${validDocs.length} documento${validDocs.length > 1 ? "s" : ""} aprobado${validDocs.length > 1 ? "s" : ""})`,
            icon: "success",
          });
        }

        // Retention: check if user is premium, created >48h ago, and missing penales_origen
        const { data: submission } = await supabase
          .from("onboarding_submissions")
          .select("subscription_status, created_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (submission && (submission.subscription_status === "pro" || submission.subscription_status === "premium")) {
          const createdAt = new Date(submission.created_at);
          const hoursSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

          if (hoursSince > 48) {
            const { data: penales } = await supabase
              .from("user_documents")
              .select("id")
              .eq("user_id", user.id)
              .eq("document_type", "penales_origen")
              .limit(1);

            if (!penales || penales.length === 0) {
              notifs.push({
                id: "retention",
                type: "retention",
                message: "Asegura tu plaza: Completa tu documentación para la Regularización 2026.",
                icon: "alert",
              });
            }
          }
        }
        // Check for recent partner comments on user's documents
        const { data: userDocs } = await supabase
          .from("user_documents")
          .select("id")
          .eq("user_id", user.id);

        if (userDocs && userDocs.length > 0) {
          const docIds = userDocs.map((d) => d.id);
          const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
          const { data: recentComments } = await supabase
            .from("document_comments")
            .select("id, author_email")
            .in("document_id", docIds)
            .gte("created_at", cutoff)
            .neq("author_email", user.email || "");

          if (recentComments && recentComments.length > 0) {
            notifs.push({
              id: "partner_comment",
              type: "partner_comment",
              message: `Tu equipo legal ha dejado ${recentComments.length} comentario${recentComments.length > 1 ? "s" : ""} en tus documentos.`,
              icon: "info",
            });
          }
        }
      } catch (err) {
        console.error("Error checking notifications:", err);
      }

      setNotifications(notifs);
      setIsLoading(false);
    };

    check();
  }, [user]);

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, isLoading, dismiss };
};
