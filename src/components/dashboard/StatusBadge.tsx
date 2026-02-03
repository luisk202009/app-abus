import { Clock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/lib/documentConfig";

interface StatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

const statusConfig: Record<
  DocumentStatus,
  {
    icon: React.ElementType;
    text: string;
    bgClass: string;
    textClass: string;
    animate?: boolean;
  }
> = {
  waiting: {
    icon: Clock,
    text: "Esperando archivo",
    bgClass: "bg-orange-100",
    textClass: "text-orange-700",
  },
  analyzing: {
    icon: Loader2,
    text: "Analizando documento...",
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
    animate: true,
  },
  valid: {
    icon: CheckCircle,
    text: "Válido para presentación",
    bgClass: "bg-green-100",
    textClass: "text-green-700",
  },
  error: {
    icon: XCircle,
    text: "Error en documento",
    bgClass: "bg-red-100",
    textClass: "text-red-700",
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", config.animate && "animate-spin")} />
      {config.text}
    </span>
  );
};
