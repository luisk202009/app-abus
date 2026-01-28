import { useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { RouteStep } from "@/hooks/useRoutes";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const completedCount = steps.filter((s) => s.is_completed).length;
  const progressPercent =
    steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  const toggleExpand = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleCheckboxClick = (
    e: React.MouseEvent,
    stepId: string,
    isCompleted: boolean
  ) => {
    e.stopPropagation();
    onToggleStep(stepId, isCompleted);
  };

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
        <div className="space-y-1 pt-2">
          {steps.map((step, index) => {
            const hasDescription = !!step.description;
            const isExpanded = expandedSteps.has(step.id);

            return (
              <Collapsible
                key={step.id}
                open={isExpanded}
                onOpenChange={() => hasDescription && toggleExpand(step.id)}
              >
                <div
                  className={cn(
                    "rounded-lg transition-all",
                    step.is_completed && "opacity-60"
                  )}
                >
                  {/* Step Row */}
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      hasDescription && "cursor-pointer hover:bg-secondary/50"
                    )}
                    onClick={() => hasDescription && toggleExpand(step.id)}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) =>
                        handleCheckboxClick(e, step.id, !step.is_completed)
                      }
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        step.is_completed
                          ? "bg-primary border-primary"
                          : "border-muted-foreground hover:border-primary"
                      )}
                    >
                      {step.is_completed && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          step.is_completed &&
                            "line-through text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        Paso {index + 1}
                      </span>
                    </div>

                    {/* Expand Icon */}
                    {hasDescription && (
                      <CollapsibleTrigger asChild>
                        <button
                          className="p-1 hover:bg-secondary rounded transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                    )}
                  </div>

                  {/* Expandable Description */}
                  {hasDescription && (
                    <CollapsibleContent className="animate-accordion-down">
                      <div className="px-11 pb-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </CollapsibleContent>
                  )}
                </div>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
};
