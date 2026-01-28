import { Crown, User, Star, Wrench } from "lucide-react";
import { useAdminMode, TestMode } from "@/contexts/AdminModeContext";
import { cn } from "@/lib/utils";

const modes: { value: TestMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "admin",
    label: "Admin",
    icon: <Crown className="w-3.5 h-3.5" />,
    description: "Sin límites",
  },
  {
    value: "free",
    label: "Free",
    icon: <User className="w-3.5 h-3.5" />,
    description: "1 ruta máx",
  },
  {
    value: "pro",
    label: "Pro",
    icon: <Star className="w-3.5 h-3.5" />,
    description: "3 rutas máx",
  },
];

export const AdminModeSwitcher = () => {
  const { isAdmin, testMode, setTestMode } = useAdminMode();

  if (!isAdmin) return null;

  return (
    <div className="p-4 border-t border-border">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wrench className="w-3.5 h-3.5" />
          <span className="font-medium">Modo de Prueba</span>
        </div>
        
        <div className="grid grid-cols-3 gap-1 p-1 bg-secondary rounded-lg">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setTestMode(mode.value)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-md text-xs transition-all",
                testMode === mode.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode.icon}
              <span className="font-medium">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Current mode indicator */}
        <p className="text-[10px] text-muted-foreground text-center">
          {modes.find((m) => m.value === testMode)?.description}
        </p>
      </div>
    </div>
  );
};
