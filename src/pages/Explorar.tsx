import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RouteCard } from "@/components/routes/RouteCard";
import { RouteCardSkeleton } from "@/components/routes/RouteCardSkeleton";
import { RouteDetailModal } from "@/components/routes/RouteDetailModal";
import { RouteLimitModal } from "@/components/dashboard/RouteLimitModal";
import { SlotExhaustedModal } from "@/components/dashboard/SlotExhaustedModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { SuccessConfetti } from "@/components/dashboard/SuccessConfetti";
import { useRoutes, type RouteTemplate } from "@/hooks/useRoutes";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Compass } from "lucide-react";

const Explorar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, maxRoutes, handleCheckout, isCheckoutLoading } = useSubscription();
  const { templates, activeRoutes, isLoading, startRoute, isStartingRoute, canAddRoute, slotExhausted, hasReg2026Access } = useRoutes();

  const [selectedTemplate, setSelectedTemplate] = useState<RouteTemplate | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSlotExhaustedModal, setShowSlotExhaustedModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stepsCounts, setStepsCounts] = useState<Record<string, number>>({});
  const [userName, setUserName] = useState<string | undefined>();

  // Fetch user name from onboarding_submissions
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("onboarding_submissions")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.full_name) {
        setUserName(data.full_name);
      }
    };
    fetchUserName();
  }, [user]);

  // Fetch steps count for each template
  useEffect(() => {
    const fetchStepsCounts = async () => {
      const counts: Record<string, number> = {};
      for (const template of templates) {
        const { count } = await supabase
          .from("route_template_steps")
          .select("*", { count: "exact", head: true })
          .eq("template_id", template.id);
        counts[template.id] = count || 0;
      }
      setStepsCounts(counts);
    };

    if (templates.length > 0) {
      fetchStepsCounts();
    }
  }, [templates]);

  const handleItemClick = (id: string) => {
    if (id === "explorer") return; // Already on this page
    if (id === "roadmap") {
      navigate("/dashboard");
      return;
    }
    // For other items, navigate to dashboard with section
    navigate("/dashboard", { state: { section: id } });
  };

  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

  const REG2026_TEMPLATE_ID = "57b27d4a-190b-4ece-a1c3-de1859d58217";

  const handleStartRoute = async (templateId: string) => {
    if (!user) {
      setPendingTemplateId(templateId);
      setShowAuthModal(true);
      return;
    }

    const isReg2026 = templateId === REG2026_TEMPLATE_ID;

    // Reg2026 requiere pago: si no hay acceso, mostrar modal de planes
    if (isReg2026 && !hasReg2026Access) {
      setSelectedTemplate(null);
      setShowSlotExhaustedModal(true);
      return;
    }

    if (!isReg2026 && !canAddRoute) {
      setSelectedTemplate(null);
      if (slotExhausted) {
        setShowSlotExhaustedModal(true);
      } else {
        setShowLimitModal(true);
      }
      return;
    }

    const success = await startRoute(templateId);
    if (success) {
      setSelectedTemplate(null);
      setShowConfetti(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // After successful auth, retry starting the pending route
    if (pendingTemplateId) {
      const tid = pendingTemplateId;
      setPendingTemplateId(null);
      // Small delay to allow auth state to propagate
      setTimeout(() => {
        handleStartRoute(tid);
      }, 500);
    }
  };

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  const isTemplateActive = (templateId: string) =>
    activeRoutes.some((r) => r.template_id === templateId);

  return (
    <div className="min-h-screen bg-secondary flex w-full">
      <DashboardSidebar
        activeItem="explorer"
        onItemClick={handleItemClick}
        onRegister={() => setShowAuthModal(true)}
        isLoggedIn={!!user}
        isPremium={isPremium}
        userName={userName}
        userEmail={user?.email || undefined}
      />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Explorar Rutas</h1>
          </div>
          <p className="text-muted-foreground">
            Descubre las diferentes rutas migratorias disponibles para España y encuentra la que mejor se adapte a tu perfil.
          </p>
          {user && (
            <p className="text-sm text-muted-foreground mt-2">
              Tienes <span className="font-semibold text-foreground">{activeRoutes.length}</span> de{" "}
              <span className="font-semibold text-foreground">{maxRoutes === 999 ? "∞" : maxRoutes}</span> rutas activas
            </p>
          )}
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <RouteCardSkeleton count={4} />
          ) : (
            templates.map((template) => (
              <RouteCard
                key={template.id}
                template={template}
                stepsCount={stepsCounts[template.id] || 0}
                isActive={isTemplateActive(template.id)}
                onViewDetails={() => setSelectedTemplate(template)}
              />
            ))
          )}
        </div>

        {!isLoading && templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay rutas disponibles en este momento.</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <RouteDetailModal
        template={selectedTemplate}
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onStartRoute={handleStartRoute}
        isStarting={isStartingRoute}
        isActive={selectedTemplate ? isTemplateActive(selectedTemplate.id) : false}
        activeRoutesCount={activeRoutes.length}
        maxRoutes={maxRoutes}
        canAddRoute={canAddRoute}
        slotExhausted={slotExhausted}
      />

      <RouteLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        currentLimit={maxRoutes}
        onUpgrade={() => handleCheckout()}
        isUpgrading={isCheckoutLoading}
      />

      <SlotExhaustedModal
        isOpen={showSlotExhaustedModal}
        onClose={() => setShowSlotExhaustedModal(false)}
        onUpgrade={(planType) => handleCheckout({ planType })}
        isUpgrading={isCheckoutLoading}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingTemplateId(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      <SuccessConfetti trigger={showConfetti} onComplete={handleConfettiComplete} />
    </div>
  );
};

export default Explorar;
