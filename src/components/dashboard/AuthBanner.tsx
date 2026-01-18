import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthBannerProps {
  onRegister: () => void;
}

export const AuthBanner = ({ onRegister }: AuthBannerProps) => {
  return (
    <div className="bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium">
          Regístrate para guardar tu progreso y descargar tus formularios
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="shrink-0 gap-2"
        onClick={onRegister}
      >
        Registrarse
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
