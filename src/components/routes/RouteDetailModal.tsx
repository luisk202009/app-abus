import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CheckCircle2, DollarSign, PiggyBank, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { RouteTemplate } from "@/hooks/useRoutes";

interface TemplateStep {
  id: string;
  title: string;
  description: string | null;
  step_order: number | null;
}

interface RouteDetailModalProps {
  template: RouteTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onStartRoute: (templateId: string) => Promise<void>;
  isStarting: boolean;
  isActive: boolean;
  activeRoutesCount: number;
  maxRoutes: number;
  canAddRoute?: boolean;
  slotExhausted?: boolean;
}

export const RouteDetailModal = ({
  template,
  isOpen,
  onClose,
  onStartRoute,
  isStarting,
  isActive,
  activeRoutesCount,
  maxRoutes,
  canAddRoute = true,
  slotExhausted = false,
}: RouteDetailModalProps) => {
  const [steps, setSteps] = useState<TemplateStep[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);

  useEffect(() => {
    const fetchSteps = async () => {
      if (!template) {
        setSteps([]);
        return;
      }

      setIsLoadingSteps(true);
      try {
        const { data, error } = await supabase
          .from("route_template_steps")
          .select("*")
          .eq("template_id", template.id)
          .order("step_order");

        if (error) throw error;
        setSteps(data || []);
      } catch (error) {
        console.error("Error fetching steps:", error);
        setSteps([]);
      } finally {
        setIsLoadingSteps(false);
      }
    };

    if (isOpen && template) {
      fetchSteps();
    }
  }, [isOpen, template]);

  if (!template) return null;

  const handleStart = async () => {
    await onStartRoute(template.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{template.name}</DialogTitle>
        </DialogHeader>

        {/* Description */}
        <p className="text-muted-foreground">
          {template.description || "Ruta migratoria hacia España"}
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 py-4 border-y border-border">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Costo estimado:</span>
            <span className="font-semibold">{template.estimated_cost || "Variable"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PiggyBank className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Solvencia requerida:</span>
            <span className="font-semibold">{template.required_savings || "Variable"}</span>
          </div>
        </div>

        {/* Steps Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Requisitos y Pasos
          </h4>

          {isLoadingSteps ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step.id} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{step.title}</p>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border space-y-3">
          {isActive ? (
            <Button disabled className="w-full gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Ya tienes esta ruta activa
            </Button>
          ) : !canAddRoute && slotExhausted ? (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" disabled>
                Límite alcanzado
              </Button>
              <p className="text-xs text-center text-amber-600">
                Límite de ruta gratuita alcanzado. Mejora a Pro para gestionar múltiples procesos.
              </p>
            </div>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={handleStart}
              disabled={isStarting}
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  Iniciar esta ruta
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Tienes {activeRoutesCount} de {maxRoutes === 999 ? "∞" : maxRoutes} rutas activas
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
