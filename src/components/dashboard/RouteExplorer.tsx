import { MapPin, Wallet, PiggyBank, ArrowRight, Check, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteTemplate, ActiveRoute } from "@/hooks/useRoutes";
import { cn } from "@/lib/utils";
import { RouteCardSkeleton } from "./RouteCardSkeleton";

interface RouteExplorerProps {
  templates: RouteTemplate[];
  activeRoutes: ActiveRoute[];
  onStartRoute: (templateId: string) => void;
  isStarting: boolean;
  canAddRoute: boolean;
  onLimitReached: () => void;
  isLoading?: boolean;
}

export const RouteExplorer = ({
  templates,
  activeRoutes,
  onStartRoute,
  isStarting,
  canAddRoute,
  onLimitReached,
  isLoading = false,
}: RouteExplorerProps) => {
  const isRouteActive = (templateId: string) =>
    activeRoutes.some((r) => r.template_id === templateId);

  const handleStartRoute = (templateId: string) => {
    if (!canAddRoute) {
      onLimitReached();
      return;
    }
    onStartRoute(templateId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Explorar Destinos</h2>
        </div>
        <p className="text-muted-foreground">
          Descubre todas las rutas migratorias disponibles para España
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <RouteCardSkeleton count={4} />
        ) : (
          templates.map((template) => {
            const isActive = isRouteActive(template.id);

            return (
              <div
                key={template.id}
                className={cn(
                  "group relative rounded-2xl border p-6 transition-all",
                  "bg-background/80 backdrop-blur-sm",
                  isActive
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:shadow-lg hover:border-primary/30"
                )}
              >
                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Activa
                  </div>
                )}

                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full w-fit">
                    <MapPin className="w-3 h-3" />
                    {template.country}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <PiggyBank className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Solvencia:</span>
                    <span className="font-medium">{template.required_savings}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Costo aprox.:</span>
                    <span className="font-medium">{template.estimated_cost}</span>
                  </div>
                </div>

                {/* Action */}
                {isActive ? (
                  <Button variant="outline" className="w-full mt-4" disabled>
                    Ya está en tu panel
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-4 gap-2"
                    onClick={() => handleStartRoute(template.id)}
                    disabled={isStarting}
                  >
                    Iniciar esta ruta
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
