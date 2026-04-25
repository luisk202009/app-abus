import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Mail, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InquiryWithDetails, CaseManagement } from "@/hooks/useLawyerData";
import { CaseAppointmentPanel } from "./CaseAppointmentPanel";
import { STAGE_LABEL, StageBadge } from "./LawyerCasesList";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  inquiry: InquiryWithDetails;
  onBack: () => void;
  onRefresh: () => void;
}

const STAGES = ["por_presentar", "en_tramite", "requerimiento", "resuelto"];

export const LawyerCaseDetail = ({ inquiry, onBack, onRefresh }: Props) => {
  const { user } = useAuth();
  const [caseRecord, setCaseRecord] = useState<CaseManagement | null>(inquiry.case);
  const [stage, setStage] = useState<string>(inquiry.case?.stage || "por_presentar");
  const [notes, setNotes] = useState<string>(inquiry.case?.lawyer_notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStage, setSavingStage] = useState(false);

  useEffect(() => {
    setCaseRecord(inquiry.case);
    setStage(inquiry.case?.stage || "por_presentar");
    setNotes(inquiry.case?.lawyer_notes || "");
  }, [inquiry]);

  const ensureCase = async (): Promise<CaseManagement | null> => {
    if (caseRecord) return caseRecord;
    const { data, error } = await supabase
      .from("case_management")
      .insert({ inquiry_id: inquiry.id, stage: "por_presentar", updated_by: user?.id })
      .select()
      .single();
    if (error) {
      toast.error("Error al crear caso: " + error.message);
      return null;
    }
    setCaseRecord(data as CaseManagement);
    return data as CaseManagement;
  };

  const handleStageChange = async (newStage: string) => {
    setSavingStage(true);
    setStage(newStage);
    const c = await ensureCase();
    if (!c) { setSavingStage(false); return; }
    const { error } = await supabase
      .from("case_management")
      .update({ stage: newStage, updated_at: new Date().toISOString(), updated_by: user?.id })
      .eq("id", c.id);
    setSavingStage(false);
    if (error) toast.error("Error al actualizar etapa");
    else {
      toast.success(`Etapa: ${STAGE_LABEL[newStage]}`);
      setCaseRecord({ ...c, stage: newStage });
      onRefresh();
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    const c = await ensureCase();
    if (!c) { setSavingNotes(false); return; }
    const { error } = await supabase
      .from("case_management")
      .update({ lawyer_notes: notes, updated_at: new Date().toISOString(), updated_by: user?.id })
      .eq("id", c.id);
    setSavingNotes(false);
    if (error) toast.error("Error al guardar notas");
    else {
      toast.success("Notas guardadas");
      setCaseRecord({ ...c, lawyer_notes: notes });
    }
  };

  const handleSaved = async () => {
    // Refetch case
    if (caseRecord) {
      const { data } = await supabase.from("case_management").select("*").eq("id", caseRecord.id).single();
      if (data) setCaseRecord(data as CaseManagement);
    }
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver a casos
        </Button>
        <StageBadge stage={stage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <Card className="p-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold mb-3">Información del cliente</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <span>{inquiry.client_name || "Sin nombre"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{inquiry.client_email || "Sin email"}</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Mensaje original</Label>
            <div className="mt-1 p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">
              {inquiry.message || "Sin mensaje"}
            </div>
          </div>

          <div>
            <Label className="text-xs">Etapa del caso</Label>
            <Select value={stage} onValueChange={handleStageChange} disabled={savingStage}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABEL[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Notas internas (privadas)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="mt-1"
              placeholder="Notas visibles solo para ti..."
            />
            <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes} className="mt-2">
              {savingNotes ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar notas
            </Button>
          </div>
        </Card>

        {/* Columna derecha */}
        <Card className="p-5">
          <CaseAppointmentPanel
            caseRecord={caseRecord}
            caseId={caseRecord?.id || null}
            enabled={stage === "en_tramite"}
            onSaved={handleSaved}
          />
        </Card>
      </div>
    </div>
  );
};
