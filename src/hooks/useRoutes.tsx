import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import { useToast } from "@/hooks/use-toast";
import { REG2026_TEMPLATE_ID } from "@/lib/documentConfig";

export interface RouteTemplate {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  required_savings: string | null;
  estimated_cost: string | null;
}

export interface RouteStep {
  id: string;
  title: string;
  description: string | null;
  step_order: number | null;
  is_completed: boolean;
}

export interface ActiveRoute {
  id: string;
  template_id: string | null;
  status: string | null;
  created_at: string | null;
  template: RouteTemplate | null;
  progress: RouteStep[];
}

interface UseRoutesReturn {
  templates: RouteTemplate[];
  activeRoutes: ActiveRoute[];
  isLoading: boolean;
  isStartingRoute: boolean;
  startRoute: (templateId: string) => Promise<boolean>;
  updateStepProgress: (stepId: string, isCompleted: boolean) => Promise<void>;
  deleteRoute: (routeId: string) => Promise<boolean>;
  canAddRoute: boolean;
  maxRoutes: number;
  getActiveRouteProgress: (routeId: string) => { completed: number; total: number };
  totalRoutesCreated: number;
  slotExhausted: boolean;
}

export const useRoutes = (): UseRoutesReturn => {
  const { user } = useAuth();
  const { isPremium, maxRoutes, subscriptionStatus } = useSubscription();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<ActiveRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingRoute, setIsStartingRoute] = useState(false);
  const [totalRoutesCreated, setTotalRoutesCreated] = useState(0);

  // Reg2026 es un producto de pago aparte: no consume el slot Free.
  // Sólo contamos rutas activas que NO sean Reg2026 al evaluar el límite.
  const nonReg2026ActiveCount = useMemo(
    () => activeRoutes.filter((r) => r.template_id !== REG2026_TEMPLATE_ID).length,
    [activeRoutes]
  );

  // Calculate canAddRoute based on subscription type
  const canAddRoute = useMemo(() => {
    if (!user) return false;

    if (isPremium) {
      // Pro/Premium: limit is based on active routes (Reg2026 incluido)
      return activeRoutes.length < maxRoutes;
    } else {
      // Free: limit is based on lifetime routes created (excluyendo Reg2026)
      const effectiveCount = Math.max(totalRoutesCreated, nonReg2026ActiveCount);
      return effectiveCount < 1;
    }
  }, [user, isPremium, activeRoutes.length, maxRoutes, totalRoutesCreated, nonReg2026ActiveCount]);

  // Slot exhausted = Free user que ya creó 1+ ruta NO Reg2026
  const slotExhausted = useMemo(() => {
    const effectiveCount = Math.max(totalRoutesCreated, nonReg2026ActiveCount);
    return !isPremium && effectiveCount >= 1;
  }, [isPremium, totalRoutesCreated, nonReg2026ActiveCount]);

  // Fetch templates and active routes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch all templates
        const { data: templatesData, error: templatesError } = await supabase
          .from("route_templates")
          .select("*")
          .order("name");

        if (templatesError) throw templatesError;
        setTemplates(templatesData || []);

        // Fetch user's active routes with progress
        if (user) {
          // Fetch total_routes_created from onboarding_submissions
          const { data: submissionData } = await supabase
            .from("onboarding_submissions")
            .select("total_routes_created")
            .eq("user_id", user.id)
            .maybeSingle();
          
          setTotalRoutesCreated(submissionData?.total_routes_created || 0);

          const { data: routesData, error: routesError } = await supabase
            .from("user_active_routes")
            .select(`
              *,
              route_templates (*)
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (routesError) throw routesError;

          // Fetch progress for each route
          const routesWithProgress: ActiveRoute[] = await Promise.all(
            (routesData || []).map(async (route) => {
              const { data: progressData } = await supabase
                .from("user_route_progress")
                .select("*")
                .eq("user_route_id", route.id)
                .order("id");

              return {
                id: route.id,
                template_id: route.template_id,
                status: route.status,
                created_at: route.created_at,
                template: route.route_templates as RouteTemplate | null,
                progress: (progressData || []).map((p, index) => ({
                  id: p.id,
                  title: p.step_title || "",
                  description: p.step_description || null,
                  step_order: index + 1,
                  is_completed: p.is_completed || false,
                })),
              };
            })
          );

          setActiveRoutes(routesWithProgress);
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las rutas.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Start a new route
  const startRoute = useCallback(
    async (templateId: string): Promise<boolean> => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Inicia sesión",
          description: "Necesitas iniciar sesión para activar una ruta.",
        });
        return false;
      }

      // Reg2026 nunca se bloquea por slot Free (es producto de pago aparte).
      const isReg2026 = templateId === REG2026_TEMPLATE_ID;

      if (!isReg2026 && !canAddRoute) {
        return false; // Let the UI handle showing the limit modal
      }

      // Check if already has this route active
      const alreadyActive = activeRoutes.some(
        (r) => r.template_id === templateId
      );
      if (alreadyActive) {
        toast({
          title: "Ruta ya activa",
          description: "Ya tienes esta ruta en tu panel.",
        });
        return false;
      }

      setIsStartingRoute(true);

      try {
        // 1. Create user_active_route (trigger will increment total_routes_created)
        const { data: newRoute, error: routeError } = await supabase
          .from("user_active_routes")
          .insert({ user_id: user.id, template_id: templateId })
          .select()
          .single();

        if (routeError) throw routeError;

        // 2. Get template steps
        const { data: templateSteps, error: stepsError } = await supabase
          .from("route_template_steps")
          .select("*")
          .eq("template_id", templateId)
          .order("step_order");

        if (stepsError) throw stepsError;

        // 3. Clone steps to user_route_progress (including descriptions)
        if (templateSteps && templateSteps.length > 0) {
          const progressSteps = templateSteps.map((step) => ({
            user_route_id: newRoute.id,
            step_title: step.title,
            step_description: step.description,
            is_completed: false,
          }));

          const { error: progressError } = await supabase
            .from("user_route_progress")
            .insert(progressSteps);

          if (progressError) throw progressError;
        }

        // 4. Fetch the complete new route with progress
        const { data: progressData } = await supabase
          .from("user_route_progress")
          .select("*")
          .eq("user_route_id", newRoute.id);

        const template = templates.find((t) => t.id === templateId);
        const newActiveRoute: ActiveRoute = {
          id: newRoute.id,
          template_id: newRoute.template_id,
          status: newRoute.status,
          created_at: newRoute.created_at,
          template: template || null,
          progress: (progressData || []).map((p, index) => ({
            id: p.id,
            title: p.step_title || "",
            description: p.step_description || null,
            step_order: index + 1,
            is_completed: p.is_completed || false,
          })),
        };

        setActiveRoutes((prev) => [newActiveRoute, ...prev]);
        // Update local counter (trigger already updated DB)
        setTotalRoutesCreated((prev) => prev + 1);

        toast({
          title: "¡Ruta activada!",
          description: `Has iniciado la ruta "${template?.name}".`,
        });

        return true;
      } catch (error) {
        console.error("Error starting route:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo iniciar la ruta. Intenta de nuevo.",
        });
        return false;
      } finally {
        setIsStartingRoute(false);
      }
    },
    [user, canAddRoute, activeRoutes, templates, toast]
  );

  // Delete a route
  const deleteRoute = useCallback(
    async (routeId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        // 1. Delete progress steps first (due to FK constraint)
        const { error: progressError } = await supabase
          .from("user_route_progress")
          .delete()
          .eq("user_route_id", routeId);

        if (progressError) throw progressError;

        // 2. Delete the active route
        const { error: routeError } = await supabase
          .from("user_active_routes")
          .delete()
          .eq("id", routeId)
          .eq("user_id", user.id);

        if (routeError) throw routeError;

        // 3. Update local state
        const deletedRoute = activeRoutes.find((r) => r.id === routeId);
        setActiveRoutes((prev) => prev.filter((r) => r.id !== routeId));

        toast({
          title: "Ruta eliminada",
          description: `La ruta "${deletedRoute?.template?.name || ""}" ha sido eliminada.`,
        });

        return true;
      } catch (error) {
        console.error("Error deleting route:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la ruta. Intenta de nuevo.",
        });
        return false;
      }
    },
    [user, activeRoutes, toast]
  );

  // Update step progress
  const updateStepProgress = useCallback(
    async (stepId: string, isCompleted: boolean) => {
      // Optimistic update
      setActiveRoutes((prev) =>
        prev.map((route) => ({
          ...route,
          progress: route.progress.map((step) =>
            step.id === stepId ? { ...step, is_completed: isCompleted } : step
          ),
        }))
      );

      try {
        const { error } = await supabase
          .from("user_route_progress")
          .update({ is_completed: isCompleted })
          .eq("id", stepId);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating progress:", error);
        // Rollback
        setActiveRoutes((prev) =>
          prev.map((route) => ({
            ...route,
            progress: route.progress.map((step) =>
              step.id === stepId ? { ...step, is_completed: !isCompleted } : step
            ),
          }))
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar el progreso.",
        });
      }
    },
    [toast]
  );

  // Get progress for a specific route
  const getActiveRouteProgress = useCallback(
    (routeId: string): { completed: number; total: number } => {
      const route = activeRoutes.find((r) => r.id === routeId);
      if (!route) return { completed: 0, total: 0 };

      const total = route.progress.length;
      const completed = route.progress.filter((s) => s.is_completed).length;
      return { completed, total };
    },
    [activeRoutes]
  );

  return {
    templates,
    activeRoutes,
    isLoading,
    isStartingRoute,
    startRoute,
    updateStepProgress,
    deleteRoute,
    canAddRoute,
    maxRoutes,
    getActiveRouteProgress,
    totalRoutesCreated,
    slotExhausted,
  };
};
