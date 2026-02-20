import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { TaskList } from "@/components/dashboard/TaskList";
import { AuthBanner } from "@/components/dashboard/AuthBanner";
import { AuthModal } from "@/components/auth/AuthModal";
import { DocumentsSection } from "@/components/dashboard/DocumentsSection";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { FiscalSimulator } from "@/components/dashboard/FiscalSimulator";
import { AppointmentManager } from "@/components/dashboard/AppointmentManager";
import { LifeInSpainSection } from "@/components/dashboard/LifeInSpainSection";
import { DocumentVault } from "@/components/dashboard/DocumentVault";
import { ResourcesSection } from "@/components/dashboard/ResourcesSection";
import { SupportModal } from "@/components/dashboard/SupportModal";
import { RouteSelector } from "@/components/dashboard/RouteSelector";
import { RouteExplorer } from "@/components/dashboard/RouteExplorer";
import { RouteLimitModal } from "@/components/dashboard/RouteLimitModal";
import { SlotExhaustedModal } from "@/components/dashboard/SlotExhaustedModal";
import { DeleteRouteModal } from "@/components/dashboard/DeleteRouteModal";
import { ActiveRouteCard } from "@/components/dashboard/ActiveRouteCard";
import { SuccessConfetti } from "@/components/dashboard/SuccessConfetti";
import { UrgencyBanner } from "@/components/dashboard/UrgencyBanner";
import { NotificationBanner } from "@/components/dashboard/NotificationBanner";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useRoutes, ActiveRoute } from "@/hooks/useRoutes";
import isotipoAlbus from "@/assets/isotipo-albus.png";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight, Calculator, CalendarCheck, Shield } from "lucide-react";
import type { RouteType } from "@/lib/documentConfig";

interface UserData {
  name: string;
  email: string;
  visaType: string;
  visaTitle: string;
  leadId?: string;
  source?: string;
}

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, signOut } = useAuth();
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
      source?: string;
    } | null;

    if (state?.name) {
      setUserData({
        name: state.name,
        email: state.email || "",
        visaType: state.visaType || "consultation",
        visaTitle: state.visaTitle || "Consulta Inicial Personalizada",
        leadId: state.leadId,
        source: state.source,
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

  // Auto-start routes based on source (reg2026, arraigos, or legacy regularizacion)
  useEffect(() => {
    const source = localStorage.getItem("onboarding_source") || userData.source;
    
    if (!user || routesLoading || templates.length === 0 || !canAddRoute || activeRoutes.length > 0) {
      return;
    }

    // Template IDs
    const TEMPLATE_IDS = {
      regularizacion2026: "57b27d4a-190b-4ece-a1c3-de1859d58217",
      arraigoSocial: "f451f205-2dae-4eaf-9103-d895c626d57c",
    };
    
    let templateToStart: string | null = null;

    if (source === "reg2026") {
      templateToStart = TEMPLATE_IDS.regularizacion2026;
    } else if (source === "arraigos" || source === "regularizacion") {
      templateToStart = TEMPLATE_IDS.arraigoSocial;
    }

    if (templateToStart) {
      // Clear localStorage
      localStorage.removeItem("onboarding_source");
      
      const template = templates.find(t => t.id === templateToStart);
      if (template) {
        handleStartRoute(template.id);
      }
    }
  }, [user, routesLoading, templates, canAddRoute, userData.source, activeRoutes.length]);

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
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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

  // Determine active route type for Document Vault
  const activeRouteType: RouteType | null = useMemo(() => {
    if (activeRoutes.length === 0) return null;
    
    // Check the first active route's template name
    const firstRoute = activeRoutes[0];
    const templateName = firstRoute.template?.name?.toLowerCase() || "";
    
    if (templateName.includes("regularización 2026") || templateName.includes("regularizacion")) {
      return "regularizacion2026";
    }
    if (templateName.includes("arraigo")) {
      return "arraigos";
    }
    
    return null;
  }, [activeRoutes]);

  // Render the active section content
  const renderContent = () => {
    switch (activeNavItem) {
      case "life-in-spain":
        if (!isPremium) {
          return (
            <div className="text-center py-16 space-y-4">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Vida en España</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Guías post-aprobación, identidad digital y documentos para empleadores. Disponible para usuarios Pro y Premium.
              </p>
              <Button onClick={handleCheckout} disabled={isCheckoutLoading}>
                Mejorar mi plan
              </Button>
            </div>
          );
        }
        return <LifeInSpainSection userId={user?.id} userName={userData.name} />;
      case "appointment":
        if (!isPremium) {
          return (
            <div className="text-center py-16 space-y-4">
              <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Gestión de Cita</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Gestiona tu cita de huellas y el seguimiento de tu TIE. Disponible para usuarios Pro y Premium.
              </p>
              <Button onClick={handleCheckout} disabled={isCheckoutLoading}>
                Mejorar mi plan
              </Button>
            </div>
          );
        }
        return <AppointmentManager userId={user?.id} />;
      case "simulator":
        // Pro and Premium users get the simulator; free users see upsell
        if (!isPremium) {
          return (
            <div className="text-center py-16 space-y-4">
              <Calculator className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Simulador Fiscal</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Calcula tu sueldo neto estimado en España. Disponible para usuarios Pro y Premium.
              </p>
              <Button onClick={handleCheckout} disabled={isCheckoutLoading}>
                Mejorar mi plan
              </Button>
            </div>
          );
        }
        return (
          <FiscalSimulator
            subscriptionStatus={isPremium ? "pro" : "free"}
            onUpgrade={handleCheckout}
          />
        );
      case "profile":
        return (
          <ProfileSection
            isPremium={isPremium}
            subscriptionStatus={isPremium ? "pro" : "free"}
          />
        );
      case "documents":
        // Use new DocumentVault for reg2026/arraigos routes
        if (activeRouteType) {
          return (
            <DocumentVault
              routeType={activeRouteType}
              isPremium={isPremium}
            />
          );
        }
        // Fallback to old DocumentsSection for other visa types
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
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Mis Rutas Activas</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Haz clic en una ruta para ver los pasos, agregar notas y adjuntar documentos.
                </p>
              </div>

              <div className="grid gap-4">
                {activeRoutes.map((route) => (
                  <ActiveRouteCard
                    key={route.id}
                    route={route}
                    progress={getActiveRouteProgress(route.id)}
                    onDelete={() => handleDeleteRouteClick(route)}
                  />
                ))}

                {/* Explore More Routes Card */}
                {canAddRoute && (
                  <div
                    className="group relative rounded-2xl border border-dashed border-border p-6 
                               transition-all hover:shadow-lg hover:border-primary/30 
                               bg-background/50 cursor-pointer"
                    onClick={() => setActiveNavItem("explorer")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold group-hover:text-primary transition-colors">
                            Explorar más rutas
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Descubre todas las rutas migratorias disponibles
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 group-hover:bg-primary/10">
                        Ver rutas
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
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
        onLogout={handleLogout}
        isLoggedIn={!!user}
        isPremium={isPremium}
        userName={userData.name}
        userEmail={user?.email}
        subscriptionStatus={isPremium ? "pro" : "free"}
      />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Urgency Banner - for all users with active routes */}
          {activeRoutes.length > 0 && <UrgencyBanner />}

          {/* Notification Banners */}
          <NotificationBanner />

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
