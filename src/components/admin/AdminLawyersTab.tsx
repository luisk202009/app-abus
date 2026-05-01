import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, ShieldCheck, ShieldOff, Power, PowerOff, Loader2, Pencil, Mail, Info, CheckCircle2 } from "lucide-react";

const SPECIALTIES = ["regularización", "arraigos", "recursos", "nómada digital"];
const LANGUAGES = ["español", "inglés", "francés", "árabe"];

interface Lawyer {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  bar_number: string | null;
  college: string | null;
  city: string | null;
  bio: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  is_verified: boolean | null;
  is_active: boolean | null;
}

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  bar_number: "",
  college: "",
  city: "",
  bio: "",
  specialties: [] as string[],
  languages: [] as string[],
};

export const AdminLawyersTab = () => {
  const { toast } = useToast();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const fetchLawyers = async () => {
    const { data, error } = await supabase.from("lawyers").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setLawyers((data || []) as Lawyer[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLawyers(); }, []);

  const toggleField = async (id: string, field: "is_verified" | "is_active", current: boolean | null) => {
    const { error } = await supabase.from("lawyers").update({ [field]: !current }).eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setLawyers(prev => prev.map(l => l.id === id ? { ...l, [field]: !current } : l));
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (l: Lawyer) => {
    setEditingId(l.id);
    setForm({
      full_name: l.full_name || "",
      email: l.email || "",
      phone: l.phone || "",
      bar_number: l.bar_number || "",
      college: l.college || "",
      city: l.city || "",
      bio: l.bio || "",
      specialties: l.specialties || [],
      languages: l.languages || [],
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email) {
      toast({ variant: "destructive", title: "Error", description: "Nombre y email son obligatorios." });
      return;
    }
    setSaving(true);
    const payload = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      bar_number: form.bar_number || null,
      college: form.college || null,
      city: form.city || null,
      bio: form.bio || null,
      specialties: form.specialties.length > 0 ? form.specialties : null,
      languages: form.languages.length > 0 ? form.languages : null,
    };

    const { error } = editingId
      ? await supabase.from("lawyers").update(payload).eq("id", editingId)
      : await supabase.from("lawyers").insert({ ...payload, is_verified: false });

    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: editingId ? "Error al actualizar" : "Error al crear", description: error.message });
    } else {
      toast({ title: editingId ? "Abogado actualizado" : "Abogado creado correctamente" });
      setDrawerOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchLawyers();
    }
  };

  const handleInvite = async (l: Lawyer) => {
    setInvitingId(l.id);
    try {
      const redirectTo = `${window.location.origin}/portal-abogado`;
      const { data, error } = await supabase.functions.invoke("invite-lawyer", {
        body: { lawyer_id: l.id, email: l.email, redirect_to: redirectTo },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({
        title: "Invitación enviada",
        description: `${l.email} recibirá un correo para definir su contraseña.`,
      });
      fetchLawyers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error al invitar", description: e.message });
    } finally {
      setInvitingId(null);
    }
  };

  const toggleCheckbox = (list: string[], value: string) =>
    list.includes(value) ? list.filter(v => v !== value) : [...list, value];

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4 flex gap-3">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Cómo dar acceso a un abogado</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Crea su perfil con email (botón "Nuevo abogado").</li>
            <li>Pulsa el icono de sobre para enviarle la invitación por email.</li>
            <li>El abogado recibirá un correo, definirá su contraseña y entrará automáticamente a <code className="text-xs bg-background px-1 py-0.5 rounded">/portal-abogado</code>.</li>
          </ol>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Abogados ({lawyers.length})</h2>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Nuevo abogado
        </Button>
      </div>

      <Sheet open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{editingId ? "Editar abogado" : "Nuevo abogado"}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            <div><Label>Nombre completo *</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label>Nº Colegiado</Label><Input value={form.bar_number} onChange={e => setForm(f => ({ ...f, bar_number: e.target.value }))} /></div>
            <div><Label>Colegio</Label><Input value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} /></div>
            <div><Label>Ciudad</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} /></div>

            <div>
              <Label>Especialidades</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SPECIALTIES.map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={form.specialties.includes(s)} onCheckedChange={() => setForm(f => ({ ...f, specialties: toggleCheckbox(f.specialties, s) }))} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Idiomas</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {LANGUAGES.map(l => (
                  <label key={l} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={form.languages.includes(l)} onCheckedChange={() => setForm(f => ({ ...f, languages: toggleCheckbox(f.languages, l) }))} />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingId ? "Guardar cambios" : "Crear abogado"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Abogado</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Especialidades</TableHead>
              <TableHead>Acceso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lawyers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No hay abogados registrados</TableCell></TableRow>
            ) : lawyers.map(l => (
              <TableRow key={l.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {l.photo_url ? (
                      <img src={l.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{getInitials(l.full_name)}</div>
                    )}
                    <div>
                      <div className="font-medium">{l.full_name}</div>
                      <div className="text-xs text-muted-foreground">{l.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{l.city || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(l.specialties || []).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>
                  {l.user_id ? (
                    <Badge variant="default" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3" /> Activo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Sin acceso</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant={l.is_verified ? "default" : "outline"} className="text-xs">{l.is_verified ? "Verificado" : "No verificado"}</Badge>
                    <Badge variant={l.is_active ? "default" : "outline"} className="text-xs">{l.is_active ? "Activo" : "Inactivo"}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {!l.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInvite(l)}
                        disabled={invitingId === l.id}
                        title="Enviar invitación por email"
                      >
                        {invitingId === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(l)} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleField(l.id, "is_verified", l.is_verified)} title={l.is_verified ? "Quitar verificación" : "Verificar"}>
                      {l.is_verified ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleField(l.id, "is_active", l.is_active)} title={l.is_active ? "Desactivar" : "Activar"}>
                      {l.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
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
