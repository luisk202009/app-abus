import { Home, FolderOpen, User, MessageCircle, LogIn, LogOut, Crown, BookOpen, Settings, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminModeSwitcher } from "@/components/admin/AdminModeSwitcher";
import albusLogo from "@/assets/albus-logo.png";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "roadmap", label: "Mi Ruta", icon: <Home className="w-5 h-5" /> },
  { id: "explorer", label: "Explorar Rutas", icon: <Compass className="w-5 h-5" /> },
  { id: "documents", label: "Documentos", icon: <FolderOpen className="w-5 h-5" /> },
  { id: "resources", label: "Recursos", icon: <BookOpen className="w-5 h-5" /> },
  { id: "profile", label: "Perfil", icon: <User className="w-5 h-5" /> },
  { id: "support", label: "Soporte", icon: <MessageCircle className="w-5 h-5" /> },
];

interface DashboardSidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  onRegister?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  isPremium?: boolean;
  userName?: string;
  userEmail?: string;
  subscriptionStatus?: string;
}

const ADMIN_EMAIL = "l@albus.com.co";

export const DashboardSidebar = ({
  activeItem,
  onItemClick,
  onRegister,
  onLogout,
  isLoggedIn = false,
  isPremium = false,
  userName,
  userEmail,
  subscriptionStatus = "free",
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const isAdmin = userEmail === ADMIN_EMAIL;

  return (
    <aside className="w-64 min-h-screen bg-background border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <img src={albusLogo} alt="Albus" className="h-7" />
      </div>

      {/* User Info (always show when logged in) */}
      {isLoggedIn && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {userName || "Usuario"}
                </span>
                {(subscriptionStatus === "premium" || subscriptionStatus === "pro" || isPremium) ? (
                  <Badge className="gap-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground">
                    <Crown className="w-2.5 h-2.5" />
                    {subscriptionStatus === "premium" ? "Premium" : "Pro"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    Gratis
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  if (item.id === "explorer") {
                    navigate("/explorar");
                    return;
                  }
                  onItemClick(item.id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  activeItem === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Admin Mode Switcher (only for admin) */}
      {isAdmin && <AdminModeSwitcher />}

      {/* Admin Button (only for admin) */}
      {isAdmin && (
        <div className="px-4 pb-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate("/admin")}
          >
            <Settings className="w-4 h-4" />
            Panel Admin
          </Button>
        </div>
      )}

      {/* Register Button (if not logged in) */}
      {!isLoggedIn && onRegister && (
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={onRegister}
          >
            <LogIn className="w-4 h-4" />
            Registrarse
          </Button>
        </div>
      )}

      {/* Logout Button (if logged in) */}
      {isLoggedIn && onLogout && (
        <div className="px-4 pb-2">
          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2026 Albus
        </p>
      </div>
    </aside>
  );
};
