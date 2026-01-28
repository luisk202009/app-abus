import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, PiggyBank, BarChart3, ListChecks, ArrowRight } from "lucide-react";
import type { RouteTemplate } from "@/hooks/useRoutes";

interface RouteCardProps {
  template: RouteTemplate;
  stepsCount: number;
  isActive: boolean;
  onViewDetails: () => void;
}

const getDifficulty = (cost: string | null): { label: string; color: string } => {
  if (!cost) return { label: "Media", color: "bg-muted text-muted-foreground" };
  const numMatch = cost.match(/[\d,]+/);
  if (!numMatch) return { label: "Media", color: "bg-muted text-muted-foreground" };
  const amount = parseInt(numMatch[0].replace(/,/g, ""));
  if (amount < 700) return { label: "Baja", color: "bg-green-100 text-green-800" };
  if (amount < 1500) return { label: "Media", color: "bg-yellow-100 text-yellow-800" };
  return { label: "Alta", color: "bg-red-100 text-red-800" };
};

export const RouteCard = ({ template, stepsCount, isActive, onViewDetails }: RouteCardProps) => {
  const difficulty = getDifficulty(template.estimated_cost);

  return (
    <div className="relative bg-background rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow duration-300">
      {/* Active Badge */}
      {isActive && (
        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
          Activa
        </Badge>
      )}

      {/* Header */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground pr-16">
            {template.name}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description || "Ruta migratoria hacia España"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Costo:</span>
            <span className="font-medium text-foreground">{template.estimated_cost || "Variable"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PiggyBank className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Solvencia:</span>
            <span className="font-medium text-foreground">{template.required_savings || "Variable"}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Dificultad:</span>
            <Badge variant="secondary" className={difficulty.color}>
              {difficulty.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ListChecks className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Pasos:</span>
            <span className="font-medium text-foreground">{stepsCount}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="outline"
        className="w-full mt-6 gap-2 group"
        onClick={onViewDetails}
      >
        Ver detalles y requisitos
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};
