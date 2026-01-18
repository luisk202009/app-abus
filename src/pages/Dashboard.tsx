import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RoadmapTimeline } from "@/components/dashboard/RoadmapTimeline";
import { TaskList } from "@/components/dashboard/TaskList";
import { AuthBanner } from "@/components/dashboard/AuthBanner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import isotipoAlbus from "@/assets/isotipo-albus.png";

interface UserData {
  name: string;
  visaType: string;
  visaTitle: string;
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
  
  const [activeNavItem, setActiveNavItem] = useState("roadmap");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userData, setUserData] = useState<UserData>({
    name: "Usuario",
    visaType: "consultation",
    visaTitle: "Consulta Inicial Personalizada",
  });

  useEffect(() => {
    // Get data from location state (passed from onboarding)
    const state = location.state as {
      name?: string;
      visaType?: string;
      visaTitle?: string;
    } | null;

    if (state?.name) {
      setUserData({
        name: state.name,
        visaType: state.visaType || "consultation",
        visaTitle: state.visaTitle || "Consulta Inicial Personalizada",
      });
    }

    // Check auth status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session) {
        // Fetch tasks from Supabase
        await fetchTasks(session.user.id);
      } else {
        // Use default tasks based on visa type
        const defaultTasks = getDefaultTasks(state?.visaType || "consultation");
        setTasks(defaultTasks);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [location.state]);

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
      } else {
        // No tasks in DB, use defaults
        const defaultTasks = getDefaultTasks(userData.visaType);
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
    if (isLoggedIn) {
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
    toast({
      title: "Próximamente",
      description: "El registro de usuarios estará disponible pronto.",
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

  if (isLoading) {
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
      />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Auth Banner */}
          {!isLoggedIn && <AuthBanner onRegister={handleRegister} />}

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
    </div>
  );
};

export default Dashboard;
