import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePushNotifications(userId?: string) {
  const subscribed = useRef(false);

  const isSupported = typeof window !== "undefined" && "Notification" in window;

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }, [isSupported]);

  const sendLocalNotification = useCallback(
    (title: string, body: string) => {
      if (!isSupported || Notification.permission !== "granted") return;
      try {
        new Notification(title, {
          body,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
        });
      } catch {
        // SW notification fallback
        navigator.serviceWorker?.ready.then((reg) =>
          reg.showNotification(title, { body, icon: "/pwa-192x192.png" })
        );
      }
    },
    [isSupported]
  );

  // Deadline countdown notification (once per session)
  useEffect(() => {
    if (!isSupported || Notification.permission !== "granted") return;
    const deadline = new Date("2026-06-30");
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const shown = sessionStorage.getItem("albus_deadline_notif");

    if (daysLeft > 0 && daysLeft <= 30 && !shown) {
      sessionStorage.setItem("albus_deadline_notif", "1");
      setTimeout(() => {
        sendLocalNotification(
          "⏰ Albus - Fecha límite",
          `Faltan ${daysLeft} días para el cierre del proceso de regularización (30 de Junio).`
        );
      }, 3000);
    }
  }, [isSupported, sendLocalNotification]);

  // Real-time subscriptions
  useEffect(() => {
    if (!userId || subscribed.current || !isSupported || Notification.permission !== "granted") return;
    subscribed.current = true;

    const channel = supabase
      .channel("push-notifications")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_documents", filter: `user_id=eq.${userId}` },
        (payload: any) => {
          if (payload.new?.status !== payload.old?.status) {
            sendLocalNotification("Albus", "¡Tu expediente ha sido revisado! Revisa el estado de tus documentos.");
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "document_comments" },
        () => {
          sendLocalNotification("Albus", "Nuevo comentario de tu equipo legal. Revisa tu expediente.");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      subscribed.current = false;
    };
  }, [userId, isSupported, sendLocalNotification]);

  return { isSupported, requestPermission, sendLocalNotification };
}
