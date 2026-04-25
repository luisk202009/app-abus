import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Scale } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import albusLogo from "@/assets/albus-logo.png";

interface Props {
  lawyerName: string;
}

export const LawyerPortalHeader = ({ lawyerName }: Props) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-card sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={albusLogo} alt="Albus" className="h-7" />
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{lawyerName}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
};
