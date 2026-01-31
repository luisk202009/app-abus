import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { TaskList } from "@/components/dashboard/TaskList";
import { AuthBanner } from "@/components/dashboard/AuthBanner";
import { AuthModal } from "@/components/auth/AuthModal";
import { DocumentsSection } from "@/components/dashboard/DocumentsSection";
import { ResourcesSection } from "@/components/dashboard/ResourcesSection";
import { SupportModal } from "@/components/dashboard/SupportModal";
import { RouteSelector } from "@/components/dashboard/RouteSelector";
import { RouteExplorer } from "@/components/dashboard/RouteExplorer";
import { RouteLimitModal } from "@/components/dashboard/RouteLimitModal";
import { SlotExhaustedModal } from "@/components/dashboard/SlotExhaustedModal";
import { DeleteRouteModal } from "@/components/dashboard/DeleteRouteModal";
import { ActiveRouteCard } from "@/components/dashboard/ActiveRouteCard";
import { SuccessConfetti } from "@/components/dashboard/SuccessConfetti";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRoutes, ActiveRoute } from "@/hooks/useRoutes";
import isotipoAlbus from "@/assets/isotipo-albus.png";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  visaType: string;
  visaTitle: string;
  leadId?: string;
}

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

const Dashboard = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { isPremium, handleCheckout, isCheckoutLoading } = useSubscription();
  const {
    templates,
    activeRoutes,
    isLoading: routesLoading,
    isStartingRoute,
    startRoute,
    deleteRoute,
    canAddRoute,
    maxRoutes,
    getActiveRouteProgress,
    slotExhausted,
  } = useRoutes();

  const [activeNavItem, setActiveNavItem] = useState("roadmap");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSlotExhaustedModal, setShowSlotExhaustedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<ActiveRoute | null>(null);
  const [isDeletingRoute, setIsDeletingRoute] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: "Usuario",
    email: "",
    visaType: "consultation",
    visaTitle: "Consulta Inicial Personalizada",
  });

  useEffect(() => {
    // Get data from location state (passed from onboarding)
    const state = location.state as {
      name?: string;
      email?: string;
      visaType?: string;
      visaTitle?: string;
      leadId?: string;
    } | null;

    if (state?.name) {
      setUserData({
        name: state.name,
        email: state.email || "",
        visaType: state.visaType || "consultation",
        visaTitle: state.visaTitle || "Consulta Inicial Personalizada",
        leadId: state.leadId,
      });
    }

    // Wait for auth to be ready
    if (authLoading) return;

    const loadData = async () => {
      if (user) {
        // Fetch user data from their linked submission
        const { data: submission } = await supabase
          .from("onboarding_submissions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (submission) {
          const recommendation = submission.ai_recommendation as {
            type?: string;
            title?: string;
            visa_type?: string;
          } | null;
          setUserData({
            name:
              submission.full_name || user.email?.split("@")[0] || "Usuario",
            email: submission.email || user.email || "",
            visaType:
              recommendation?.visa_type || recommendation?.type || "consultation",
            visaTitle: recommendation?.title || "Consulta Inicial Personalizada",
            leadId: submission.id,
          });
        }

        // Fetch tasks from Supabase
        await fetchTasks(user.id);
      }

      setIsLoading(false);
    };

    loadData();
  }, [location.state, user, authLoading]);

  const fetchTasks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setTasks(
          data.map((task) => ({
            id: task.id,
            title: task.title,
            category: task.category || "General",
            completed: task.status === "completed",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    const task = tasks.find((t) => t.id === taskId);
    const newStatus = task?.completed ? false : true;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: newStatus } : t))
    );

    // If logged in, persist to Supabase
    if (user && task) {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("user_tasks")
          .update({ status: newStatus ? "completed" : "pending" })
          .eq("id", taskId);

        if (error) {
          // Rollback on error
          setTasks(previousTasks);
          toast({
            variant: "destructive",
            title: "Error al actualizar",
            description: "No se pudo guardar el cambio. Intenta de nuevo.",
          });
        }
      } catch (error) {
        console.error("Error updating task:", error);
        setTasks(previousTasks);
        toast({
          variant: "destructive",
          title: "Error al actualizar",
          description: "No se pudo guardar el cambio. Intenta de nuevo.",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRegister = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    toast({
      title: "¡Bienvenido!",
      description: "Tu progreso ahora está guardado.",
    });
  };

  const handleNavItemClick = (id: string) => {
    setActiveNavItem(id);

    if (id === "support") {
      setShowSupportModal(true);
      return;
    }

    if (id === "profile") {
      toast({
        title: "Próximamente",
        description: "Esta sección estará disponible pronto.",
      });
    }
  };

  const handleStartRoute = useCallback(
    async (templateId: string) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      // Check which modal to show based on subscription type
      if (!canAddRoute) {
        if (slotExhausted) {
          setShowSlotExhaustedModal(true);
        } else {
          setShowLimitModal(true);
        }
        return;
      }

      const success = await startRoute(templateId);
      if (success) {
        // Trigger confetti celebration
        setShowConfetti(true);
        // Switch to roadmap view to see the new route
        setActiveNavItem("roadmap");
      }
    },
    [user, canAddRoute, slotExhausted, startRoute]
  );

  const handleDeleteRouteClick = useCallback((route: ActiveRoute) => {
    setRouteToDelete(route);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!routeToDelete) return;
    
    setIsDeletingRoute(true);
    const success = await deleteRoute(routeToDelete.id);
    setIsDeletingRoute(false);
    
    if (success) {
      setShowDeleteModal(false);
      setRouteToDelete(null);
    }
  }, [routeToDelete, deleteRoute, activeRoutes]);

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  // Render the active section content
  const renderContent = () => {
    switch (activeNavItem) {
      case "documents":
        return (
          <DocumentsSection
            visaType={userData.visaType}
            isPremium={isPremium}
            onCheckout={handleCheckout}
            isCheckoutLoading={isCheckoutLoading}
          />
        );
      case "resources":
        return (
          <ResourcesSection
            isPremium={isPremium}
            onCheckout={handleCheckout}
            isCheckoutLoading={isCheckoutLoading}
          />
        );
      case "explorer":
        return (
          <RouteExplorer
            templates={templates}
            activeRoutes={activeRoutes}
            onStartRoute={handleStartRoute}
            isStarting={isStartingRoute}
            canAddRoute={canAddRoute}
            onLimitReached={() => {
              if (slotExhausted) {
                setShowSlotExhaustedModal(true);
              } else {
                setShowLimitModal(true);
              }
            }}
          />
        );
      case "roadmap":
      default:
        // Show route selector if no active routes
        if (activeRoutes.length === 0) {
          return (
            <RouteSelector
              templates={templates}
              onSelectRoute={handleStartRoute}
              isStarting={isStartingRoute}
            />
          );
        }

        // Show active routes list - clicking navigates to route detail
        return (
          <div className="space-y-6">
            {/* Active Routes List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Mis Rutas Activas</h3>
                {canAddRoute && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveNavItem("explorer")}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir ruta
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Haz clic en una ruta para ver los pasos, agregar notas y adjuntar documentos.
              </p>

              <div className="grid gap-3">
                {activeRoutes.map((route) => (
                  <ActiveRouteCard
                    key={route.id}
                    route={route}
                    progress={getActiveRouteProgress(route.id)}
                    onDelete={() => handleDeleteRouteClick(route)}
                  />
                ))}
              </div>
            </div>

            {/* Legacy Task List (if any tasks exist) */}
            {tasks.length > 0 && (
              <TaskList
                tasks={tasks}
                onTaskToggle={handleTaskToggle}
                isSaving={isSaving}
              />
            )}
          </div>
        );
    }
  };

  if (isLoading || authLoading || routesLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src={isotipoAlbus}
            alt="Albus"
            className="w-12 h-12 animate-pulse"
          />
          <p className="text-muted-foreground">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar */}
      <DashboardSidebar
        activeItem={activeNavItem}
        onItemClick={handleNavItemClick}
        onRegister={handleRegister}
        isLoggedIn={!!user}
        isPremium={isPremium}
        userName={userData.name}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Auth Banner - hide for logged in users AND premium users */}
          {!user && !isPremium && <AuthBanner onRegister={handleRegister} />}

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Hola, {userData.name}!
            </h1>
            <p className="text-muted-foreground">
              {activeRoutes.length > 0
                ? `Tienes ${activeRoutes.length} ruta${
                    activeRoutes.length > 1 ? "s" : ""
                  } activa${activeRoutes.length > 1 ? "s" : ""}`
                : "Selecciona una ruta migratoria para comenzar"}
            </p>
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultEmail={userData.email}
        leadId={userData.leadId}
        onSuccess={handleAuthSuccess}
      />

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        userEmail={userData.email}
      />

      {/* Route Limit Modal (for Pro users hitting active route limit) */}
      <RouteLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        currentLimit={maxRoutes}
        onUpgrade={handleCheckout}
        isUpgrading={isCheckoutLoading}
      />

      {/* Slot Exhausted Modal (for Free users who used their lifetime slot) */}
      <SlotExhaustedModal
        isOpen={showSlotExhaustedModal}
        onClose={() => setShowSlotExhaustedModal(false)}
        onUpgrade={handleCheckout}
        isUpgrading={isCheckoutLoading}
      />

      {/* Delete Route Modal */}
      <DeleteRouteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRouteToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        routeName={routeToDelete?.template?.name || "esta ruta"}
        isDeleting={isDeletingRoute}
        isPro={isPremium}
      />

      {/* Success Confetti */}
      <SuccessConfetti trigger={showConfetti} onComplete={handleConfettiComplete} />
    </div>
  );
};

export default Dashboard;
