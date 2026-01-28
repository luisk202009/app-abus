import { MapPin, Wallet, PiggyBank, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteTemplate } from "@/hooks/useRoutes";

interface RouteSelectorProps {
  templates: RouteTemplate[];
  onSelectRoute: (templateId: string) => void;
  isStarting: boolean;
}

export const RouteSelector = ({
  templates,
  onSelectRoute,
  isStarting,
}: RouteSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Selecciona tu Ruta Migratoria</h2>
        <p className="text-muted-foreground">
          Elige el camino que mejor se adapte a tu situación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border p-6 transition-all hover:shadow-lg hover:border-primary/30"
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {template.country}
                </div>
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
            <Button
              className="w-full mt-4 gap-2"
              onClick={() => onSelectRoute(template.id)}
              disabled={isStarting}
            >
              Iniciar esta ruta
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
