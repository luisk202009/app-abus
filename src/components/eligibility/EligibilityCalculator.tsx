import { useState } from "react";
import { trackEvent } from "@/lib/trackingService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistModal } from "./ChecklistModal";
import { AuthModal } from "@/components/auth/AuthModal";

type Result = "eligible" | "not-eligible" | null;

interface EligibilityCalculatorProps {
  onStartProcess?: () => void;
  country?: string;
}

export const EligibilityCalculator = ({ onStartProcess, country }: EligibilityCalculatorProps) => {
  const [date, setDate] = useState<Date>();
  const [result, setResult] = useState<Result>(null);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const cutoffDate = new Date("2025-12-31");

  const handleCheck = () => {
    if (!date) return;
    const isEligible = date <= cutoffDate;
    setResult(isEligible ? "eligible" : "not-eligible");
    trackEvent("track_eligibility_check", { eligible: isEligible, country: country || "general" });
  };

  const handleReset = () => {
    setDate(undefined);
    setResult(null);
    setLeadName("");
    setLeadEmail("");
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadEmail)) {
      toast.error("Por favor, introduce un email válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const crmTag = `lead_checklist_${country || "general"}`;
      const { error } = await supabase.from("onboarding_submissions").insert({
        full_name: leadName.trim(),
        email: leadEmail.trim().toLowerCase(),
        nationality: country || "general",
        crm_tag: crmTag,
      });

      if (error) {
        // Duplicate email — user already exists
        if (error.code === "23505") {
          toast.info("Ya tienes una cuenta. Inicia sesión para continuar.");
          setShowAuthModal(true);
          return;
        }
        throw error;
      }

      setShowChecklist(true);
      toast.success("¡Tu hoja de ruta está lista!");
      trackEvent("lead_captured", { source: "eligibility_calculator", country: country || "general" });
    } catch {
      toast.error("Hubo un error. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="py-16 md:py-24 bg-muted/30" data-section="eligibility">
        <div className="container px-4 md:px-6">
          <div className="max-w-xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Calculadora de Elegibilidad 2026
              </h2>
              <p className="text-muted-foreground">
                Verifica si cumples el requisito de fecha de entrada para la Regularización Extraordinaria.
              </p>
            </div>

            {!result ? (
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground block text-left">
                  ¿Cuándo entraste a España?
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Selecciona tu fecha de entrada"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleCheck}
                  disabled={!date}
                >
                  Verificar Elegibilidad
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : result === "eligible" ? (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-center gap-3 p-5 bg-background border border-border rounded-xl">
                  <CheckCircle2 className="w-7 h-7 text-foreground shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">¡Eres apto!</p>
                    <p className="text-sm text-muted-foreground">
                      Para no cometer errores, descarga tu Hoja de Ruta Personalizada para la Regularización 2026.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-3 text-left">
                  <Input
                    placeholder="Tu nombre completo"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    required
                    maxLength={100}
                    className="h-12"
                  />
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    required
                    maxLength={255}
                    className="h-12"
                  />
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isSubmitting || !leadName.trim() || !leadEmail.trim()}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Obtener mi Guía Gratuita
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Verificar otra fecha
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-center gap-3 p-6 bg-background border border-border rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-muted-foreground shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">No aplicas para la Regularización 2026</p>
                    <p className="text-sm text-muted-foreground">
                      Pero podemos ayudarte con el proceso de Arraigo Social.
                    </p>
                  </div>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => navigate("/españa/arraigos")}
                >
                  Explorar Arraigo Social
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Verificar otra fecha
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <ChecklistModal
        isOpen={showChecklist}
        onClose={() => setShowChecklist(false)}
        userName={leadName}
        userEmail={leadEmail}
        country={country}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultEmail={leadEmail}
        defaultMode="login"
      />
    </>
  );
};
