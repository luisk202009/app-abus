import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, CheckCircle2, Clock, MapPin, CreditCard, PartyPopper,
  Fingerprint, FileText, ExternalLink, Info, Save, Loader2, CalendarCheck
} from "lucide-react";
import { generateTasa790PDF } from "@/lib/generateTasa790";

interface AppointmentManagerProps {
  userId?: string;
}

const TIE_STEPS = [
  { id: "aprobada", label: "Solicitud Aprobada", icon: CheckCircle2 },
  { id: "appointment_scheduled", label: "Cita Programada", icon: CalendarCheck },
  { id: "fingerprints_done", label: "Huellas Tomadas", icon: Fingerprint },
  { id: "card_ready", label: "Tarjeta Lista", icon: CreditCard },
  { id: "collected", label: "Recogida", icon: PartyPopper },
];

const CHECKLIST_ITEMS = [
  { id: "ex17", label: "Formulario EX-17", note: "Descarga oficial", link: "https://extranjeros.inclusion.gob.es/es/ModelosSolicitudes/Mod_solicitudes2/17-Formulario_TIE.pdf" },
  { id: "tasa790", label: "Tasa 790-012", note: "Generar borrador con tus datos", hasGenerator: true },
  { id: "resolucion", label: "Resolución de concesión", note: "Descargable desde la Bóveda si tu abogado la subió" },
  { id: "empadronamiento", label: "Certificado de Empadronamiento", note: "Actualizado (máximo 3 meses)" },
];

export const AppointmentManager = ({ userId }: AppointmentManagerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [appointmentTime, setAppointmentTime] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [tieStatus, setTieStatus] = useState("pending");
  const [applicationStatus, setApplicationStatus] = useState("en_tramite");
  const [recordId, setRecordId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await supabase
        .from("user_appointments")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) {
        setRecordId(data.id);
        setAppointmentDate(data.appointment_date ? new Date(data.appointment_date) : undefined);
        setAppointmentTime(data.appointment_time || "");
        setPoliceStation(data.police_station_address || "");
        setLotNumber(data.lot_number || "");
        setTieStatus(data.tie_status || "pending");
        setApplicationStatus(data.application_status || "en_tramite");
      }
      setIsLoading(false);
    };
    load();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const payload = {
        user_id: userId,
        appointment_date: appointmentDate ? format(appointmentDate, "yyyy-MM-dd") : null,
        appointment_time: appointmentTime || null,
        police_station_address: policeStation || null,
        lot_number: lotNumber || null,
        tie_status: tieStatus,
        updated_at: new Date().toISOString(),
      };

      if (recordId) {
        await supabase.from("user_appointments").update(payload).eq("id", recordId);
      } else {
        const { data } = await supabase.from("user_appointments").insert({ ...payload, application_status: applicationStatus }).select("id").single();
        if (data) setRecordId(data.id);
      }
      toast({ title: "Guardado", description: "Datos de cita actualizados." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateTasa = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("onboarding_submissions")
      .select("full_name, nationality, current_location, email, professional_profile")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      generateTasa790PDF({
        fullName: data.full_name || "",
        nationality: data.nationality || "",
        currentLocation: data.current_location || "",
        email: data.email || "",
        professionalProfile: data.professional_profile || undefined,
      });
    }
  };

  const daysUntil = appointmentDate
    ? Math.ceil((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const currentStepIndex = TIE_STEPS.findIndex((s) => s.id === tieStatus);
  // If application approved, at least step 0 is done
  const effectiveStepIndex = applicationStatus === "aprobada" ? Math.max(currentStepIndex, 0) : -1;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section A: Application Status Banner */}
      {applicationStatus === "aprobada" ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900">
                  ¡Enhorabuena! Tu residencia ha sido concedida 🎉
                </h3>
                <p className="text-emerald-700 text-sm mt-1">
                  Empecemos con la gestión de tu TIE (Tarjeta de Identidad de Extranjero).
                  A continuación, programa tu cita de huellas y prepara la documentación necesaria.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Solicitud en trámite</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Tu solicitud está siendo procesada. Cuando sea aprobada por tu equipo legal,
                  podrás gestionar tu cita de huellas desde aquí.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section B: TIE Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progreso del TIE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {TIE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = i <= effectiveStepIndex;
              const isCurrent = i === effectiveStepIndex;
              return (
                <div key={step.id} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div
                      className={cn(
                        "absolute top-5 -left-1/2 w-full h-0.5",
                        isDone ? "bg-emerald-500" : "bg-border"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isCurrent
                        ? "border-emerald-500 text-emerald-500 bg-background"
                        : "border-border text-muted-foreground bg-background"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-2 text-center leading-tight max-w-[80px]",
                      isDone ? "text-emerald-700 font-medium" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Section C: Appointment Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              Cita de Huellas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysUntil !== null && daysUntil > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <span className="text-2xl font-bold text-amber-700">{daysUntil}</span>
                <p className="text-xs text-amber-600 mt-0.5">días para tu cita de huellas</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !appointmentDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {appointmentDate ? format(appointmentDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={appointmentDate}
                      onSelect={setAppointmentDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Hora</Label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  placeholder="09:00"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Dirección de la comisaría</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    placeholder="Ej: Comisaría de Extranjería, Madrid"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cita
            </Button>
          </CardContent>
        </Card>

        {/* Section D: TIE Status & Lot Number */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Estado del TIE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Número de Lote</Label>
              <Input
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="Ej: LOT-2026-XXXX"
              />
            </div>

            <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">¿Tu tarjeta ya está lista?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consulta el estado de tu TIE en la Sede Electrónica del Gobierno de España.
                  </p>
                </div>
              </div>
              <a
                href="https://sede.administracionespublicas.gob.es/pagina/index/directorio/icpplus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Consultar estado
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <Button onClick={handleSave} disabled={isSaving} variant="outline" className="w-full gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Datos TIE
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section E: Police Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Documentación para la Cita de Huellas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
              >
                <Checkbox
                  checked={!!checkedItems[item.id]}
                  onCheckedChange={(v) => setCheckedItems((prev) => ({ ...prev, [item.id]: !!v }))}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 flex-shrink-0"
                  >
                    Descargar <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {item.hasGenerator && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex-shrink-0"
                    onClick={handleGenerateTasa}
                  >
                    Generar PDF
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
