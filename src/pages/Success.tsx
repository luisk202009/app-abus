import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle, Sparkles } from "lucide-react";
import albusLogo from "@/assets/albus-logo.png";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Log successful payment for analytics
    console.log("Payment successful, session:", sessionId);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo and Badge */}
        <div className="flex flex-col items-center gap-4">
          <img src={albusLogo} alt="Albus" className="h-10" />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            <Crown className="w-4 h-4" />
            Pro
          </div>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            ¡Bienvenido a Albus Pro!
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Tu suscripción está activa. Ahora tienes acceso completo al almacenamiento seguro de documentos, revisión automática y generación de formularios.
          </p>
        </div>

        {/* Features List */}
        <div className="bg-secondary/50 rounded-xl p-6 text-left space-y-3">
          <p className="text-sm font-medium text-foreground">Ahora puedes:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              Subir y organizar tus documentos de forma segura
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              Recibir revisiones automáticas de tus archivos
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              Generar formularios de tasa 790 listos para imprimir
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              Acceder al asistente IA personalizado
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold gap-2"
          onClick={() => navigate("/dashboard")}
        >
          Empezar mi trámite ahora
        </Button>

        {/* Help text */}
        <p className="text-xs text-muted-foreground">
          ¿Tienes alguna pregunta? Contacta con{" "}
          <a href="mailto:soporte@albus.com" className="underline hover:text-foreground">
            soporte@albus.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default Success;
