import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Briefcase, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LawyerService, ServiceType } from "@/hooks/useLawyerData";
import { toast } from "sonner";

interface Props {
  lawyerId: string;
  services: LawyerService[];
  serviceTypes: ServiceType[];
  onRefresh: () => void;
}

const CURRENCIES = ["EUR", "USD", "COP"];

export const LawyerServicesTab = ({ lawyerId, services, serviceTypes, onRefresh }: Props) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LawyerService | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    service_type_id: "",
    description: "",
    price: "",
    currency: "EUR",
    is_active: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ service_type_id: "", description: "", price: "", currency: "EUR", is_active: true });
    setOpen(true);
  };

  const openEdit = (s: LawyerService) => {
    setEditing(s);
    setForm({
      service_type_id: s.service_type_id || "",
      description: s.description || "",
      price: s.price?.toString() || "",
      currency: s.currency || "EUR",
      is_active: s.is_active ?? true,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.service_type_id) {
      toast.error("Selecciona un tipo de servicio");
      return;
    }
    setSaving(true);
    const payload = {
      lawyer_id: lawyerId,
      service_type_id: form.service_type_id,
      description: form.description || null,
      price: form.price ? Number(form.price) : null,
      currency: form.currency,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from("lawyer_services").update(payload).eq("id", editing.id)
      : await supabase.from("lawyer_services").insert(payload);
    setSaving(false);
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success(editing ? "Servicio actualizado" : "Servicio creado");
      setOpen(false);
      onRefresh();
    }
  };

  const toggleActive = async (s: LawyerService) => {
    await supabase.from("lawyer_services").update({ is_active: !s.is_active }).eq("id", s.id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mis servicios ({services.length})</h2>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo servicio
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aún no has creado servicios.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{s.service_type_name || "Servicio"}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.description || "Sin descripción"}</p>
                </div>
                <Badge variant={s.is_active ? "default" : "outline"} className="text-xs">
                  {s.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-sm font-semibold">
                  {s.price ? `${s.price} ${s.currency}` : "Precio a consultar"}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)} className="h-7">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(s)} className="h-7 text-xs">
                    {s.is_active ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar servicio" : "Nuevo servicio"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Tipo de servicio *</Label>
              <Select value={form.service_type_id} onValueChange={(v) => setForm((f) => ({ ...f, service_type_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Precio</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Moneda</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <Label htmlFor="active-toggle" className="cursor-pointer">Servicio activo</Label>
              <Switch id="active-toggle" checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
