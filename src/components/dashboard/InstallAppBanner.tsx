import { useState, useEffect } from "react";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallAppBanner = () => {
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Track visits
    const visits = parseInt(localStorage.getItem("albus_visits") || "0", 10);
    localStorage.setItem("albus_visits", String(visits + 1));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (visits >= 1) setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!isMobile || !showBanner || dismissed) return null;

  return (
    <div className="bg-background border border-border rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Smartphone className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Instala Albus en tu dispositivo</p>
        <p className="text-xs text-muted-foreground">Acceso rápido sin abrir el navegador</p>
      </div>
      <Button size="sm" onClick={handleInstall}>
        Instalar
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => setDismissed(true)}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
