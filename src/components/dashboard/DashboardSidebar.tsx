import { Home, FolderOpen, User, MessageCircle, LogIn } from "lucide-react";
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
}

export const DashboardSidebar = ({
  activeItem,
  onItemClick,
  onRegister,
  isLoggedIn = false,
}: DashboardSidebarProps) => {
  return (
    <aside className="w-64 min-h-screen bg-background border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <img src={albusLogo} alt="Albus" className="h-7" />
      </div>

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
