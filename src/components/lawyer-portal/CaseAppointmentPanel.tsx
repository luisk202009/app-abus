import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, Lock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CaseManagement } from "@/hooks/useLawyerData";
import { TieChecklistEditor } from "./TieChecklistEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  caseRecord: CaseManagement | null;
  caseId: string | null;
  enabled: boolean;
  onSaved: () => void;
}

const TIE_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "appointment_scheduled", label: "En proceso" },
  { value: "collected", label: "Entregado" },
];

export const CaseAppointmentPanel = ({ caseRecord, caseId, enabled, onSaved }: Props) => {
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [appointmentLot, setAppointmentLot] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [tieStatus, setTieStatus] = useState("pending");
  const [tieAppointmentDate, setTieAppointmentDate] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAppointmentDate(caseRecord?.appointment_date ? new Date(caseRecord.appointment_date) : undefined);
    setAppointmentLot(caseRecord?.appointment_lot || "");
    setAppointmentNotes(caseRecord?.appointment_notes || "");
    setTieStatus(caseRecord?.tie_status || "pending");
    setTieAppointmentDate(caseRecord?.tie_appointment_date ? new Date(caseRecord.tie_appointment_date) : undefined);
  }, [caseRecord]);

  const handleSave = async () => {
    if (!caseId) {
      toast.error("Primero cambia la etapa para crear el caso.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("case_management")
      .update({
        appointment_date: appointmentDate?.toISOString() ?? null,
        appointment_lot: appointmentLot || null,
        appointment_notes: appointmentNotes || null,
        tie_status: tieStatus,
        tie_appointment_date: tieAppointmentDate?.toISOString() ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId);
    setSaving(false);
    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Cambios guardados");
      onSaved();
    }
  };

  return (
    <div className={cn("relative", !enabled && "opacity-60 pointer-events-none")}>
      {!enabled && (
        <div className="absolute inset-0 z-10 flex items-start justify-center pt-20 pointer-events-none">
          <div className="bg-background/95 border rounded-lg px-4 py-3 flex items-center gap-2 shadow-sm">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Disponible cuando el caso esté <strong>En trámite</strong>
            </span>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Gestión de cita</h3>
          <p className="text-xs text-muted-foreground">Cita policial y tarjeta TIE</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Fecha de cita</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start font-normal mt-1", !appointmentDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appointmentDate ? format(appointmentDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={appointmentDate} onSelect={setAppointmentDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-xs">Lote / Turno</Label>
            <Input value={appointmentLot} onChange={(e) => setAppointmentLot(e.target.value)} className="mt-1" placeholder="Ej: Lote 12 - Turno 3" />
          </div>

          <div>
            <Label className="text-xs">Notas de la cita</Label>
            <Textarea value={appointmentNotes} onChange={(e) => setAppointmentNotes(e.target.value)} rows={3} className="mt-1" placeholder="Detalles adicionales..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Estado del TIE</Label>
              <Select value={tieStatus} onValueChange={setTieStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Fecha cita TIE</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start font-normal mt-1", !tieAppointmentDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tieAppointmentDate ? format(tieAppointmentDate, "PP", { locale: es }) : "Fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={tieAppointmentDate} onSelect={setTieAppointmentDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {caseId && <TieChecklistEditor caseId={caseId} />}

        <Button onClick={handleSave} disabled={saving || !caseId} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
};
