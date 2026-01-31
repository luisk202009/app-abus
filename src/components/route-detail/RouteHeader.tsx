import { ArrowLeft, Settings, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ActiveRoute } from "@/hooks/useRoutes";
import { RouteActionsMenu } from "@/components/dashboard/RouteActionsMenu";

interface RouteHeaderProps {
  route: ActiveRoute;
  onDelete: () => void;
}

export const RouteHeader = ({ route, onDelete }: RouteHeaderProps) => {
  const navigate = useNavigate();

  const completedSteps = route.progress.filter((s) => s.is_completed).length;
  const totalSteps = route.progress.length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard")}
        className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis rutas
      </Button>

      {/* Route Card Header */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {route.template?.name || "Mi Ruta"}
            </h1>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{route.template?.country || "España"}</span>
            </div>
          </div>

          <RouteActionsMenu
            onViewDetails={() => {}}
            onDelete={onDelete}
          />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">
              {completedSteps}/{totalSteps} pasos completados
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progressPercent.toFixed(0)}% completado
          </p>
        </div>
      </div>
    </div>
  );
};
