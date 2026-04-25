import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InquiryWithDetails } from "@/hooks/useLawyerData";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Inbox } from "lucide-react";

interface Props {
  inquiries: InquiryWithDetails[];
  onSelect: (inquiry: InquiryWithDetails) => void;
}

export const STAGE_LABEL: Record<string, string> = {
  por_presentar: "Por presentar",
  en_tramite: "En trámite",
  requerimiento: "Requerimiento",
  resuelto: "Resuelto",
};

export const STAGE_COLOR: Record<string, string> = {
  por_presentar: "bg-muted text-muted-foreground border-border",
  en_tramite: "bg-blue-100 text-blue-800 border-blue-200",
  requerimiento: "bg-orange-100 text-orange-800 border-orange-200",
  resuelto: "bg-green-100 text-green-800 border-green-200",
};

export const StageBadge = ({ stage }: { stage: string | null | undefined }) => {
  const s = stage || "por_presentar";
  return (
    <Badge variant="outline" className={`text-xs font-medium border ${STAGE_COLOR[s] || STAGE_COLOR.por_presentar}`}>
      {STAGE_LABEL[s] || STAGE_LABEL.por_presentar}
    </Badge>
  );
};

export const LawyerCasesList = ({ inquiries, onSelect }: Props) => {
  if (inquiries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No tienes casos asignados todavía.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {inquiries.map((inq) => (
        <Card
          key={inq.id}
          onClick={() => onSelect(inq)}
          className="p-4 cursor-pointer hover:border-foreground/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">
                  {inq.client_name || "Cliente sin nombre"}
                </h3>
                <StageBadge stage={inq.case?.stage} />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {inq.created_at
                  ? formatDistanceToNow(new Date(inq.created_at), { addSuffix: true, locale: es })
                  : ""}
              </p>
              <p className="text-sm text-foreground/80 line-clamp-2">
                {inq.message || "Sin mensaje"}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
