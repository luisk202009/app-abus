import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationBanner = () => {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
            notif.type === "approval"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notif.type === "approval" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notif.message}</span>
          </div>
          <button
            onClick={() => dismiss(notif.id)}
            className="shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
