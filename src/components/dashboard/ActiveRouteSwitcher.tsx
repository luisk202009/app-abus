import { ChevronDown, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ActiveRoute } from "@/hooks/useRoutes";
import { useMemo } from "react";

interface ActiveRouteSwitcherProps {
  routes: ActiveRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  getProgress: (routeId: string) => { completed: number; total: number };
}

export const ActiveRouteSwitcher = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  getProgress,
}: ActiveRouteSwitcherProps) => {
  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId),
    [routes, selectedRouteId]
  );

  const selectedProgress = useMemo(() => {
    if (!selectedRouteId) return { completed: 0, total: 0 };
    return getProgress(selectedRouteId);
  }, [selectedRouteId, getProgress]);

  const progressPercent =
    selectedProgress.total > 0
      ? (selectedProgress.completed / selectedProgress.total) * 100
      : 0;

  if (routes.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 h-auto py-2 px-4 bg-background border-border"
        >
          <Route className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {selectedRoute?.template?.name || "Seleccionar ruta"}
            </span>
            <div className="flex items-center gap-2">
              <Progress value={progressPercent} className="w-20 h-1.5" />
              <span className="text-xs text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 ml-1 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-background">
        {routes.map((route) => {
          const progress = getProgress(route.id);
          const percent =
            progress.total > 0
              ? (progress.completed / progress.total) * 100
              : 0;
          const isSelected = route.id === selectedRouteId;

          return (
            <DropdownMenuItem
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`flex flex-col items-start gap-1 py-3 cursor-pointer ${
                isSelected ? "bg-secondary" : ""
              }`}
            >
              <span className="font-medium">
                {route.template?.name || "Sin nombre"}
              </span>
              <div className="flex items-center gap-2 w-full">
                <Progress value={percent} className="flex-1 h-1.5" />
                <span className="text-xs text-muted-foreground">
                  {progress.completed}/{progress.total}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
