import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRouteDetail } from "@/hooks/useRouteDetail";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRoutes } from "@/hooks/useRoutes";
import { RouteHeader } from "@/components/route-detail/RouteHeader";
import { StepCard } from "@/components/route-detail/StepCard";
import { AttachDocumentModal } from "@/components/route-detail/AttachDocumentModal";
import { DeleteRouteModal } from "@/components/dashboard/DeleteRouteModal";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { SupportModal } from "@/components/dashboard/SupportModal";
import isotipoAlbus from "@/assets/isotipo-albus.png";

const RouteDetail = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, handleCheckout, isCheckoutLoading } = useSubscription();
  const { deleteRoute } = useRoutes();

  const {
    route,
    isLoading,
    notes,
    attachments,
    updateStepProgress,
    addNote,
    deleteNote,
    attachDocument,
    removeAttachment,
  } = useRouteDetail();

  const [activeNavItem, setActiveNavItem] = useState("roadmap");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingRoute, setIsDeletingRoute] = useState(false);

  // Attachment modal state
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [attachingStepId, setAttachingStepId] = useState<string | null>(null);

  const handleNavItemClick = (id: string) => {
    setActiveNavItem(id);

    if (id === "support") {
      setShowSupportModal(true);
      return;
    }

    if (id === "roadmap") {
      navigate("/dashboard");
    } else if (id === "explorer") {
      navigate("/explorar");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!route) return;
    setIsDeletingRoute(true);
    const success = await deleteRoute(route.id);
    setIsDeletingRoute(false);
    if (success) {
      setShowDeleteModal(false);
      navigate("/dashboard");
    }
  }, [route, deleteRoute, navigate]);

  const handleOpenAttachModal = (stepId: string) => {
    setAttachingStepId(stepId);
    setAttachModalOpen(true);
  };

  const handleAttachDocument = (documentType: string) => {
    if (attachingStepId) {
      attachDocument(attachingStepId, documentType);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src={isotipoAlbus}
            alt="Albus"
            className="w-12 h-12 animate-pulse"
          />
          <p className="text-muted-foreground">Cargando tu ruta...</p>
        </div>
      </div>
    );
  }

  // No route found
  if (!route) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Ruta no encontrada</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary underline"
          >
            Volver al dashboard
          </button>
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
        onRegister={() => setShowAuthModal(true)}
        isLoggedIn={!!user}
        isPremium={isPremium}
        userName={user?.email?.split("@")[0] || "Usuario"}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Route Header */}
          <RouteHeader route={route} onDelete={handleDeleteClick} />

          {/* Steps List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Tareas</h2>

            <div className="space-y-2">
              {route.progress.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  notes={notes[step.id] || []}
                  attachments={attachments[step.id] || []}
                  onToggleComplete={(isCompleted) =>
                    updateStepProgress(step.id, isCompleted)
                  }
                  onAddNote={(content) => addNote(step.id, content)}
                  onDeleteNote={(noteId) => deleteNote(noteId, step.id)}
                  onAttachDocument={() => handleOpenAttachModal(step.id)}
                  onRemoveAttachment={(attId) =>
                    removeAttachment(attId, step.id)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {}}
      />

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        userEmail={user?.email || ""}
      />

      <DeleteRouteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        routeName={route.template?.name || "esta ruta"}
        isDeleting={isDeletingRoute}
        isPro={isPremium}
      />

      <AttachDocumentModal
        isOpen={attachModalOpen}
        onClose={() => {
          setAttachModalOpen(false);
          setAttachingStepId(null);
        }}
        onAttach={handleAttachDocument}
        alreadyAttached={
          attachingStepId
            ? (attachments[attachingStepId] || []).map((a) => a.document_type)
            : []
        }
      />
    </div>
  );
};

export default RouteDetail;
