import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RoadmapTimeline } from "@/components/dashboard/RoadmapTimeline";
import { TaskList } from "@/components/dashboard/TaskList";
import { AuthBanner } from "@/components/dashboard/AuthBanner";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import isotipoAlbus from "@/assets/isotipo-albus.png";

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

// Default tasks based on visa type
const getDefaultTasks = (visaType: string): Task[] => {
  const baseTasks: Task[] = [
    { id: "1", title: "Apostillar Antecedentes Penales", category: "Legal", completed: false },
    { id: "2", title: "Contratar Seguro Médico", category: "Pago", completed: false },
    { id: "3", title: "Obtener certificado de empadronamiento", category: "Documento", completed: false },
  ];

  if (visaType === "digital_nomad") {
    return [
      ...baseTasks,
      { id: "4", title: "Demostrar ingresos mínimos (€2,646/mes)", category: "Documento", completed: false },
      { id: "5", title: "Contrato de trabajo remoto traducido", category: "Legal", completed: false },
    ];
  }

  if (visaType === "student") {
    return [
      ...baseTasks,
      { id: "4", title: "Carta de aceptación de universidad", category: "Documento", completed: false },
      { id: "5", title: "Demostrar solvencia económica", category: "Documento", completed: false },
    ];
  }

  return baseTasks;
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  const [activeNavItem, setActiveNavItem] = useState("roadmap");
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
          .single();

        if (submission) {
          const recommendation = submission.ai_recommendation as { type?: string; title?: string } | null;
          setUserData({
            name: submission.full_name || user.email?.split("@")[0] || "Usuario",
            email: submission.email || user.email || "",
            visaType: recommendation?.type || "consultation",
            visaTitle: recommendation?.title || "Consulta Inicial Personalizada",
            leadId: submission.id,
          });
        }

        // Fetch tasks from Supabase
        await fetchTasks(user.id, state?.visaType || "consultation");
      } else {
        // Use default tasks based on visa type
        const defaultTasks = getDefaultTasks(state?.visaType || "consultation");
        setTasks(defaultTasks);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [location.state, user, authLoading]);

  const fetchTasks = async (userId: string, visaType: string) => {
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
      } else {
        // No tasks in DB, use defaults
        const defaultTasks = getDefaultTasks(visaType);
        setTasks(defaultTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      const defaultTasks = getDefaultTasks(userData.visaType);
      setTasks(defaultTasks);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    // If logged in, update in Supabase
    if (user) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        try {
          await supabase
            .from("user_tasks")
            .update({ status: task.completed ? "pending" : "completed" })
            .eq("id", taskId);
        } catch (error) {
          console.error("Error updating task:", error);
        }
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
    if (id !== "roadmap") {
      toast({
        title: "Próximamente",
        description: "Esta sección estará disponible pronto.",
      });
    }
  };

  if (isLoading || authLoading) {
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
      />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Auth Banner */}
          {!user && <AuthBanner onRegister={handleRegister} />}

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Hola, {userData.name}!
            </h1>
            <p className="text-muted-foreground">
              Tu camino hacia el{" "}
              <span className="font-medium text-foreground">
                {userData.visaTitle}
              </span>
            </p>
          </div>

          {/* Roadmap Timeline */}
          <RoadmapTimeline currentStep={1} />

          {/* Task List */}
          <TaskList tasks={tasks} onTaskToggle={handleTaskToggle} />
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
    </div>
  );
};

export default Dashboard;
