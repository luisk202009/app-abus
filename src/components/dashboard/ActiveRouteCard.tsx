import { Check, MapPin, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ActiveRoute } from "@/hooks/useRoutes";
import { cn } from "@/lib/utils";

interface ActiveRouteCardProps {
  route: ActiveRoute;
  progress: { completed: number; total: number };
  onClick: () => void;
  isSelected?: boolean;
}

export const ActiveRouteCard = ({
  route,
  progress,
  onClick,
  isSelected,
}: ActiveRouteCardProps) => {
  const progressPercent =
    progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  const isCompleted = progressPercent === 100;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-background rounded-xl border p-4 transition-all hover:shadow-md",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">
              {route.template?.name || "Ruta sin nombre"}
            </h4>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                <Check className="w-3 h-3" />
                Completada
              </span>
            )}
          </div>

          {/* Country */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {route.template?.country}
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">
                {progress.completed}/{progress.total} pasos
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
      </div>
    </button>
  );
};
