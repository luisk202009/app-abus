import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Result = "eligible" | "not-eligible" | null;

interface EligibilityCalculatorProps {
  onStartProcess?: () => void;
}

export const EligibilityCalculator = ({ onStartProcess }: EligibilityCalculatorProps) => {
  const [date, setDate] = useState<Date>();
  const [result, setResult] = useState<Result>(null);
  const navigate = useNavigate();

  const cutoffDate = new Date("2025-12-31");

  const handleCheck = () => {
    if (!date) return;
    setResult(date <= cutoffDate ? "eligible" : "not-eligible");
  };

  const handleReset = () => {
    setDate(undefined);
    setResult(null);
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
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
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-center gap-3 p-6 bg-background border border-border rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">¡Eres elegible!</p>
                  <p className="text-sm text-muted-foreground">
                    Tienes hasta el 30 de junio de 2026 para presentar tu solicitud.
                  </p>
                </div>
              </div>
              <Button
                variant="hero"
                size="lg"
                className="w-full gap-2"
                onClick={onStartProcess}
              >
                Comenzar mi proceso
                <ArrowRight className="w-4 h-4" />
              </Button>
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
  );
};
