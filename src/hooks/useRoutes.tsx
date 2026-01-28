import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import { useToast } from "@/hooks/use-toast";

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
  canAddRoute: boolean;
  maxRoutes: number;
  getActiveRouteProgress: (routeId: string) => { completed: number; total: number };
}

export const useRoutes = (): UseRoutesReturn => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<ActiveRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingRoute, setIsStartingRoute] = useState(false);

  // Plan limits: free = 1 route, pro = 3 routes
  const maxRoutes = isPremium ? 3 : 1;
  const canAddRoute = activeRoutes.length < maxRoutes;

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
                progress: (progressData || []).map((p) => ({
                  id: p.id,
                  title: p.step_title || "",
                  description: null,
                  step_order: null,
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

      if (!canAddRoute) {
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
        // 1. Create user_active_route
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

        // 3. Clone steps to user_route_progress
        if (templateSteps && templateSteps.length > 0) {
          const progressSteps = templateSteps.map((step) => ({
            user_route_id: newRoute.id,
            step_title: step.title,
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
          progress: (progressData || []).map((p) => ({
            id: p.id,
            title: p.step_title || "",
            description: null,
            step_order: null,
            is_completed: p.is_completed || false,
          })),
        };

        setActiveRoutes((prev) => [newActiveRoute, ...prev]);

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
    canAddRoute,
    maxRoutes,
    getActiveRouteProgress,
  };
};
