import { Home, FolderOpen, User, MessageCircle, LogIn, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import albusLogo from "@/assets/albus-logo.png";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "roadmap", label: "Mi Ruta", icon: <Home className="w-5 h-5" /> },
  { id: "documents", label: "Documentos", icon: <FolderOpen className="w-5 h-5" /> },
  { id: "profile", label: "Perfil", icon: <User className="w-5 h-5" /> },
  { id: "support", label: "Soporte", icon: <MessageCircle className="w-5 h-5" /> },
];

interface DashboardSidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  onRegister?: () => void;
  isLoggedIn?: boolean;
  isPremium?: boolean;
  userName?: string;
}

export const DashboardSidebar = ({
  activeItem,
  onItemClick,
  onRegister,
  isLoggedIn = false,
  isPremium = false,
  userName,
}: DashboardSidebarProps) => {
  return (
    <aside className="w-64 min-h-screen bg-background border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <img src={albusLogo} alt="Albus" className="h-7" />
      </div>

      {/* User Info (if logged in with Pro) */}
      {isLoggedIn && isPremium && (
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
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-semibold uppercase">
                  <Crown className="w-2.5 h-2.5" />
                  Pro
                </span>
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
                onClick={() => onItemClick(item.id)}
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

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 Albus
        </p>
      </div>
    </aside>
  );
};
