import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/trackingService";

const SESSION_KEY = "albus_exit_intent_shown";

export const ExitIntentModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const show = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    // Don't show if another dialog is already open
    if (document.querySelector('[role="dialog"]')) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setIsOpen(true);
    trackEvent("exit_intent_shown");
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Desktop: mouse leaves viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    // Mobile: 30s inactivity
    let inactivityTimer = setTimeout(show, 30000);
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(show, 30000);
    };
    const events = ["scroll", "touchstart", "click"] as const;
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(inactivityTimer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [show]);

  const handleClose = () => setIsOpen(false);

  const handleCTA = () => {
    trackEvent("exit_intent_cta_clicked");
    setIsOpen(false);
    // Scroll to eligibility calculator
    const el = document.querySelector("[data-section='eligibility']");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-float animate-scale-in overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            ¡No pierdas tu oportunidad!
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            El proceso de Regularización 2026 es limitado. ¿Tienes dudas?
            Descarga nuestra guía gratuita antes de irte.
          </p>

          <Button
            variant="hero"
            size="lg"
            className="w-full gap-2"
            onClick={handleCTA}
          >
            Obtener mi Guía Gratuita
            <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            No gracias, ya volveré
          </button>
        </div>
      </div>
    </div>
  );
};
