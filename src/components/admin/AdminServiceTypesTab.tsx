import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Check, X, Power, PowerOff, Loader2 } from "lucide-react";

interface ServiceType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean | null;
}

const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const AdminServiceTypesTab = () => {
  const { toast } = useToast();
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [newForm, setNewForm] = useState({ name: "", description: "" });

  const fetchTypes = async () => {
    const { data, error } = await supabase.from("service_types").select("*").order("created_at", { ascending: false });
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else setTypes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleCreate = async () => {
    if (!newForm.name) { toast({ variant: "destructive", title: "Error", description: "Nombre es obligatorio." }); return; }
    setSaving(true);
    const { error } = await supabase.from("service_types").insert({
      name: newForm.name,
      slug: slugify(newForm.name),
      description: newForm.description || null,
    });
    setSaving(false);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else { toast({ title: "Tipo de servicio creado" }); setDialogOpen(false); setNewForm({ name: "", description: "" }); fetchTypes(); }
  };

  const startEdit = (t: ServiceType) => { setEditingId(t.id); setEditForm({ name: t.name, description: t.description || "" }); };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("service_types").update({ name: editForm.name, slug: slugify(editForm.name), description: editForm.description || null }).eq("id", id);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else { setEditingId(null); fetchTypes(); }
  };

  const toggleActive = async (id: string, current: boolean | null) => {
    const { error } = await supabase.from("service_types").update({ is_active: !current }).eq("id", id);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else setTypes(prev => prev.map(t => t.id === id ? { ...t, is_active: !current } : t));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tipos de Servicio ({types.length})</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Nuevo tipo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo tipo de servicio</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nombre *</Label><Input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Descripción</Label><Input value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} /></div>
              {newForm.name && <p className="text-xs text-muted-foreground">Slug: {slugify(newForm.name)}</p>}
              <Button onClick={handleCreate} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Crear
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No hay tipos de servicio</TableCell></TableRow>
            ) : types.map(t => (
              <TableRow key={t.id}>
                <TableCell>
                  {editingId === t.id ? (
                    <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-8" />
                  ) : t.name}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{editingId === t.id ? slugify(editForm.name) : t.slug}</TableCell>
                <TableCell>
                  {editingId === t.id ? (
                    <Input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="h-8" />
                  ) : (t.description || "—")}
                </TableCell>
                <TableCell>
                  <Badge variant={t.is_active ? "default" : "outline"} className="text-xs">{t.is_active ? "Activo" : "Inactivo"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {editingId === t.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => saveEdit(t.id)}><Check className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => startEdit(t)}><Pencil className="w-4 h-4" /></Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(t.id, t.is_active)}>
                      {t.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
