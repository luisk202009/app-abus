import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuccessConfetti } from "./SuccessConfetti";
import { Mail, CalendarDays, CheckCircle2, Circle, AlertTriangle, PartyPopper, Scale, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  userId?: string;
}

interface Inquiry {
  id: string;
  lawyer_id: string | null;
  status: string | null;
  created_at: string | null;
}
interface Lawyer {
  id: string;
  full_name: string;
  email: string;
  photo_url: string | null;
  specialties: string[] | null;
}
interface Case {
  id: string;
  stage: string | null;
  appointment_date: string | null;
  appointment_lot: string | null;
  appointment_notes: string | null;
  tie_status: string | null;
  tie_appointment_date: string | null;
}
interface ChecklistItem {
  id: string;
  item: string;
  is_completed: boolean | null;
  order_index: number | null;
}

const STAGES = [
  { id: "por_presentar", label: "Por presentar" },
  { id: "en_tramite", label: "En trámite" },
  { id: "requerimiento", label: "Requerimiento" },
  { id: "resuelto", label: "Resuelto" },
];

const TIE_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-muted text-muted-foreground border-border" },
  appointment_scheduled: { label: "En proceso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  fingerprints_done: { label: "Huellas tomadas", className: "bg-blue-100 text-blue-800 border-blue-200" },
  card_ready: { label: "Lista para recoger", className: "bg-green-100 text-green-800 border-green-200" },
  collected: { label: "Entregado", className: "bg-green-100 text-green-800 border-green-200" },
};

export const LegalCaseTracker = ({ userId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [caseRec, setCaseRec] = useState<Case | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    (async () => {
      const { data: inqs } = await supabase
        .from("lawyer_inquiries")
        .select("id, lawyer_id, status, created_at")
        .eq("user_id", userId)
        .in("status", ["assigned", "active", "pending"])
        .order("created_at", { ascending: false })
        .limit(1);

      const inq = inqs?.[0] as Inquiry | undefined;
      if (!inq || !inq.lawyer_id) {
        setLoading(false);
        return;
      }
      setInquiry(inq);

      const [lawyerRes, caseRes] = await Promise.all([
        supabase.from("lawyers")
          .select("id, full_name, email, photo_url, specialties")
          .eq("id", inq.lawyer_id)
          .maybeSingle(),
        supabase.from("case_management")
          .select("id, stage, appointment_date, appointment_lot, appointment_notes, tie_status, tie_appointment_date")
          .eq("inquiry_id", inq.id)
          .maybeSingle(),
      ]);

      setLawyer(lawyerRes.data as Lawyer | null);
      const c = caseRes.data as Case | null;
      setCaseRec(c);

      if (c?.id) {
        const { data: items } = await supabase
          .from("tie_checklist_items")
          .select("id, item, is_completed, order_index")
          .eq("case_id", c.id)
          .order("order_index");
        setChecklist((items || []) as ChecklistItem[]);
      }
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!inquiry || !lawyer) return null;

  const stage = caseRec?.stage || "por_presentar";
  const stageIndex = STAGES.findIndex((s) => s.id === stage);
  const initials = lawyer.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const tieInfo = caseRec?.tie_status ? TIE_LABELS[caseRec.tie_status] : null;
  const showTie = tieInfo && caseRec?.tie_status !== "pending";

  return (
    <div className="space-y-4">
      {stage === "resuelto" && !confettiFired && (
        <SuccessConfetti trigger={true} onComplete={() => setConfettiFired(true)} />
      )}

      {/* Lawyer card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-4 h-4 text-muted-foreground" />
            Tu abogado asignado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {lawyer.photo_url ? (
              <img src={lawyer.photo_url} alt={lawyer.full_name} className="w-14 h-14 rounded-full object-cover border" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-base font-semibold">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">{lawyer.full_name}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {(lawyer.specialties || []).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
                ))}
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="gap-1.5 flex-shrink-0">
              <a href={`mailto:${lawyer.email}`}>
                <Mail className="w-3.5 h-3.5" />
                Contactar
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stage stepper */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Etapa del proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {STAGES.map((s, i) => {
              const isDone = i < stageIndex;
              const isCurrent = i === stageIndex;
              const isRequerimiento = isCurrent && s.id === "requerimiento";
              const isResuelto = isCurrent && s.id === "resuelto";

              return (
                <div key={s.id} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div className={cn(
                      "absolute top-4 -left-1/2 w-full h-0.5",
                      i <= stageIndex
                        ? (stage === "requerimiento" && i === stageIndex ? "bg-orange-400" : "bg-green-500")
                        : "bg-border"
                    )} />
                  )}
                  <div className={cn(
                    "relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors text-xs font-semibold",
                    isDone && "bg-green-500 border-green-500 text-white",
                    isCurrent && isRequerimiento && "bg-orange-500 border-orange-500 text-white",
                    isCurrent && isResuelto && "bg-green-500 border-green-500 text-white",
                    isCurrent && !isRequerimiento && !isResuelto && "bg-foreground border-foreground text-background",
                    !isDone && !isCurrent && "bg-background border-border text-muted-foreground"
                  )}>
                    {isDone || isResuelto ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-[10px] mt-2 text-center leading-tight max-w-[80px]",
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Requerimiento banner */}
      {stage === "requerimiento" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 text-sm">Requerimiento pendiente</h4>
                <p className="text-orange-800 text-sm mt-1">
                  Tu expediente tiene un requerimiento pendiente. Tu abogado se pondrá en contacto contigo próximamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resuelto banner */}
      {stage === "resuelto" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <PartyPopper className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 text-sm">¡Felicidades!</h4>
                <p className="text-green-800 text-sm mt-1">
                  Tu proceso ha sido resuelto favorablemente. 🎉
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment banner */}
      {caseRec?.appointment_date && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 text-sm">
                  📅 Tu cita está programada para{" "}
                  {format(new Date(caseRec.appointment_date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                </h4>
                {caseRec.appointment_lot && (
                  <p className="text-blue-800 text-sm mt-1">
                    Lote / Turno: <strong>{caseRec.appointment_lot}</strong>
                  </p>
                )}
                {caseRec.appointment_notes && (
                  <p className="text-blue-800 text-sm mt-2 whitespace-pre-wrap">
                    {caseRec.appointment_notes}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TIE status */}
      {showTie && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Estado del TIE</p>
                <Badge variant="outline" className={cn("mt-1.5 text-xs border", tieInfo!.className)}>
                  {tieInfo!.label}
                </Badge>
              </div>
              {caseRec?.tie_appointment_date && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Cita TIE</p>
                  <p className="text-sm font-medium mt-1">
                    {format(new Date(caseRec.tie_appointment_date), "PPP", { locale: es })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist (read-only) */}
      {checklist.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Documentos para tu cita</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-2.5 text-sm">
                  {item.is_completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={cn(
                    item.is_completed
                      ? "text-green-700 line-through"
                      : "text-muted-foreground"
                  )}>
                    {item.item}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
