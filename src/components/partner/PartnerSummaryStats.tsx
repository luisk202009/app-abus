import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, AlertTriangle } from "lucide-react";
import type { PartnerClient } from "@/hooks/usePartnerData";

interface Props {
  clients: PartnerClient[];
}

export const PartnerSummaryStats = ({ clients }: Props) => {
  const total = clients.length;
  const completed = clients.filter((c) => c.assignment.case_status === "listo_presentar").length;
  const pending = total - completed;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Casos asignados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{completed}</p>
              <p className="text-xs text-muted-foreground">Listos para presentar</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
