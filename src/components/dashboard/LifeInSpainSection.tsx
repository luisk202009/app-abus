import { useState } from "react";
import { Shield, Briefcase, FileText, ExternalLink, Save, ChevronRight, Lock, Monitor, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateEmployerInfoPDF } from "@/lib/generateEmployerInfo";
import { SuccessConfetti } from "./SuccessConfetti";

interface LifeInSpainSectionProps {
  userId?: string;
  userName: string;
}

export const LifeInSpainSection = ({ userId, userName }: LifeInSpainSectionProps) => {
  const { toast } = useToast();
  const [ssnNumber, setSsnNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSaveSSN = async () => {
    if (!ssnNumber.trim() || !userId) return;

    setIsSaving(true);
    try {
      // Check if appointment record exists
      const { data: existing } = await supabase
        .from("user_appointments")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_appointments")
          .update({ lot_number: ssnNumber.trim() })
          .eq("user_id", userId);
      } else {
        await supabase
          .from("user_appointments")
          .insert({ user_id: userId, lot_number: ssnNumber.trim() });
      }

      setShowConfetti(true);
      toast({
        title: "¡Felicidades!",
        description: "Ya estás listo para trabajar legalmente en España.",
      });
    } catch (error) {
      console.error("Error saving SSN:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el número. Intenta de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateEmployerPDF = () => {
    generateEmployerInfoPDF({ fullName: userName });
    toast({
      title: "Documento generado",
      description: "Se ha descargado el PDF para tu empleador.",
    });
  };

  const ssnSteps = [
    "Obtener cita previa en la Tesorería General de la Seguridad Social",
    "Rellenar y descargar el Modelo TA.1",
    "Presentar pasaporte + TIE + certificado de empadronamiento",
    "Recibir tu número de afiliación a la Seguridad Social",
  ];

  return (
    <div className="space-y-8">
      <SuccessConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Vida en España</h2>
            <p className="text-sm text-muted-foreground">
              Tu guía post-aprobación: identidad digital, empleo y más
            </p>
          </div>
        </div>
      </div>

      {/* Section A: SSN Request Guide */}
      <Card className="bg-background border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Número de Seguridad Social</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          El número de afiliación a la Seguridad Social es imprescindible para trabajar legalmente en España.
        </p>

        <ol className="space-y-3">
          {ssnSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="text-sm pt-1">{step}</span>
            </li>
          ))}
        </ol>

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.open("https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/7330", "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
          Descargar Modelo TA.1
        </Button>

        {/* SSN Input */}
        <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
          <label className="text-sm font-medium">Guarda tu número de afiliación</label>
          <div className="flex gap-2">
            <Input
              placeholder="Ej: 28/12345678/90"
              value={ssnNumber}
              onChange={(e) => setSsnNumber(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveSSN} disabled={isSaving || !ssnNumber.trim()} className="gap-2">
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </div>
        </div>
      </Card>

      {/* Section B: Digital Identity Center */}
      <Card className="bg-background border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Centro de Identidad Digital</h3>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            Con tu identidad digital podrás firmar documentos, consultar tu situación fiscal y acceder a servicios públicos online.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* FNMT Card */}
          <div className="border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-sm">Certificado Digital FNMT</h4>
            </div>
            <ol className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                Solicitar en sede.fnmt.gob.es con tu NIE
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                Confirmar identidad en oficina de registro
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                Descargar e instalar en tu navegador
              </li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              onClick={() => window.open("https://www.sede.fnmt.gob.es/certificados", "_blank")}
            >
              <ExternalLink className="w-3 h-3" />
              Ir a FNMT
            </Button>
          </div>

          {/* Clave PIN Card */}
          <div className="border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-sm">Cl@ve PIN</h4>
            </div>
            <ol className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                Registrarte en clave.gob.es
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                Verificar identidad (presencial o videollamada)
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                Usar para declaraciones fiscales y trámites
              </li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              onClick={() => window.open("https://clave.gob.es/clave_Home/registro.html", "_blank")}
            >
              <ExternalLink className="w-3 h-3" />
              Ir a Cl@ve
            </Button>
          </div>
        </div>
      </Card>

      {/* Section C: Employer Document Generator */}
      <Card className="bg-background border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Documento para Empleador</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Genera un documento informativo para entregar a tu empleador explicando tu derecho al trabajo
          tras 15 días de la admisión a trámite, conforme al Real Decreto de Regularización 2026.
        </p>

        <Button onClick={handleGenerateEmployerPDF} className="gap-2">
          <FileText className="w-4 h-4" />
          Generar Documento para Empleador (PDF)
        </Button>
      </Card>
    </div>
  );
};
