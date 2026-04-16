import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";

interface Inquiry {
  id: string;
  created_at: string | null;
  user_id: string | null;
  message: string | null;
  lawyer_id: string | null;
  status: string | null;
}

interface LawyerOption {
  id: string;
  full_name: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  assigned: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  closed: "bg-foreground text-background",
};

const DEFAULT_CHECKLIST = [
  "Pasaporte original",
  "TIE provisional",
  "Foto carnet x2",
  "Tasa 790-012 pagada",
  "Formulario EX-17",
  "Justificante de cita",
];

export const AdminLegalLeadsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [lawyerNames, setLawyerNames] = useState<Record<string, string>>({});
  const [lawyers, setLawyers] = useState<LawyerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    // Consultas en paralelo
    const [inqRes, lawyersRes, subsRes] = await Promise.all([
      supabase.from("lawyer_inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("lawyers").select("id, full_name, is_verified, is_active"),
      supabase.from("onboarding_submissions").select("user_id, full_name"),
    ]);

    if (inqRes.data) setInquiries(inqRes.data);

    // Mapa de nombres de usuarios
    if (subsRes.data) {
      const map: Record<string, string> = {};
      subsRes.data.forEach(s => { if (s.user_id && s.full_name) map[s.user_id] = s.full_name; });
      setUserNames(map);
    }

    // Mapa de nombres de abogados y lista de activos verificados
    if (lawyersRes.data) {
      const nameMap: Record<string, string> = {};
      const active: LawyerOption[] = [];
      lawyersRes.data.forEach(l => {
        nameMap[l.id] = l.full_name;
        if (l.is_verified && l.is_active) active.push({ id: l.id, full_name: l.full_name });
      });
      setLawyerNames(nameMap);
      setLawyers(active);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async () => {
    if (!assignModal || !selectedLawyer || !user) return;
    setAssigning(true);

    // 1. Actualizar lawyer_inquiries
    const { error: updateError } = await supabase.from("lawyer_inquiries").update({
      lawyer_id: selectedLawyer,
      assigned_by: user.id,
      assigned_at: new Date().toISOString(),
      status: "assigned",
    }).eq("id", assignModal);

    if (updateError) {
      toast({ variant: "destructive", title: "Error al asignar", description: updateError.message });
      setAssigning(false);
      return;
    }

    // 2. Crear caso en case_management
    const { data: caseData, error: caseError } = await supabase.from("case_management").insert({
      inquiry_id: assignModal,
      stage: "por_presentar",
    }).select("id").single();

    if (caseError) {
      toast({ variant: "destructive", title: "Error al crear caso", description: caseError.message });
      setAssigning(false);
      return;
    }

    // 3. Insertar checklist por defecto
    const checklistItems = DEFAULT_CHECKLIST.map((item, i) => ({
      case_id: caseData.id,
      item,
      order_index: i,
      is_completed: false,
    }));

    const { error: checklistError } = await supabase.from("tie_checklist_items").insert(checklistItems);
    if (checklistError) {
      toast({ variant: "destructive", title: "Error al crear checklist", description: checklistError.message });
    } else {
      toast({ title: "Abogado asignado y caso creado correctamente" });
    }

    setAssigning(false);
    setAssignModal(null);
    setSelectedLawyer("");
    fetchData();
  };

  const filtered = filter === "all" ? inquiries : inquiries.filter(i => i.status === filter);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Leads Jurídicos ({inquiries.length})</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="assigned">Asignados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="closed">Cerrados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead>Abogado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No hay leads jurídicos</TableCell></TableRow>
            ) : filtered.map(inq => (
              <TableRow key={inq.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  {inq.created_at ? new Date(inq.created_at).toLocaleDateString("es-ES") : "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {inq.user_id ? (userNames[inq.user_id] || inq.user_id.slice(0, 8)) : "—"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {inq.message ? inq.message.slice(0, 80) : "—"}
                </TableCell>
                <TableCell>
                  {inq.lawyer_id ? lawyerNames[inq.lawyer_id] || "Desconocido" : <span className="text-muted-foreground">Sin asignar</span>}
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${STATUS_COLORS[inq.status || "pending"] || ""}`}>
                    {inq.status || "pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {inq.status === "pending" && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setAssignModal(inq.id); setSelectedLawyer(""); }}>
                      <UserPlus className="w-4 h-4" /> Asignar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de asignación */}
      <Dialog open={!!assignModal} onOpenChange={open => { if (!open) setAssignModal(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Asignar abogado</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Abogado verificado y activo</Label>
              <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
                <SelectTrigger><SelectValue placeholder="Seleccionar abogado..." /></SelectTrigger>
                <SelectContent>
                  {lawyers.map(l => <SelectItem key={l.id} value={l.id}>{l.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Se creará automáticamente un caso con checklist TIE (6 ítems).
            </p>
            <Button onClick={handleAssign} disabled={!selectedLawyer || assigning} className="w-full">
              {assigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Asignar y crear caso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
