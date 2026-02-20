import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PartnerClient } from "@/hooks/usePartnerData";

interface Props {
  clients: PartnerClient[];
  onSelectClient: (userId: string) => void;
  onStatusChange: (assignmentId: string, status: string) => void;
  selectedUserId: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  en_revision: { label: "En Revisión", className: "bg-blue-100 text-blue-800 border-blue-200" },
  listo_presentar: { label: "Listo para Presentar", className: "bg-green-100 text-green-800 border-green-200" },
  requiere_accion: { label: "Requiere Acción", className: "bg-red-100 text-red-800 border-red-200" },
};

export const PartnerClientList = ({ clients, onSelectClient, onStatusChange, selectedUserId }: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Ruta</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Asignado</TableHead>
          <TableHead>Docs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((c) => {
          const cfg = statusConfig[c.assignment.case_status] || statusConfig.en_revision;
          return (
            <TableRow
              key={c.assignment.id}
              className={selectedUserId === c.assignment.user_id ? "bg-muted/50" : ""}
            >
              <TableCell className="font-medium">{c.fullName || "—"}</TableCell>
              <TableCell className="text-sm">{c.email || "—"}</TableCell>
              <TableCell className="text-sm max-w-[140px] truncate">{c.routeName || "—"}</TableCell>
              <TableCell>
                <Select
                  value={c.assignment.case_status}
                  onValueChange={(val) => onStatusChange(c.assignment.id, val)}
                >
                  <SelectTrigger className="w-[170px] h-8 text-xs">
                    <SelectValue>
                      <Badge className={cfg.className}>{cfg.label}</Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_revision">🔵 En Revisión</SelectItem>
                    <SelectItem value="listo_presentar">🟢 Listo para Presentar</SelectItem>
                    <SelectItem value="requiere_accion">🔴 Requiere Acción</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(c.assignment.assigned_at), "d MMM yyyy", { locale: es })}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectClient(c.assignment.user_id)}
                >
                  <FileText className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
        {clients.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No tienes clientes asignados
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
