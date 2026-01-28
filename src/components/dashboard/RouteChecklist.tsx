import { Check, Circle } from "lucide-react";
import { RouteStep } from "@/hooks/useRoutes";
import { cn } from "@/lib/utils";

interface RouteChecklistProps {
  steps: RouteStep[];
  onToggleStep: (stepId: string, isCompleted: boolean) => void;
  routeName: string;
}

export const RouteChecklist = ({
  steps,
  onToggleStep,
  routeName,
}: RouteChecklistProps) => {
  const completedCount = steps.filter((s) => s.is_completed).length;
  const progressPercent = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="bg-background rounded-xl border border-border p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{routeName}</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{steps.length} completados
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2 pt-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => onToggleStep(step.id, !step.is_completed)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                "hover:bg-secondary/50",
                step.is_completed && "opacity-60"
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  step.is_completed
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                )}
              >
                {step.is_completed && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "text-sm font-medium",
                    step.is_completed && "line-through text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  Paso {index + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
