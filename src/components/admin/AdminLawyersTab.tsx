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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, ShieldCheck, ShieldOff, Power, PowerOff, Loader2 } from "lucide-react";

const SPECIALTIES = ["regularización", "arraigos", "recursos", "nómada digital"];
const LANGUAGES = ["español", "inglés", "francés", "árabe"];

interface Lawyer {
  id: string;
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

export const AdminLawyersTab = () => {
  const { toast } = useToast();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    bar_number: "",
    college: "",
    city: "",
    bio: "",
    specialties: [] as string[],
    languages: [] as string[],
  });

  const fetchLawyers = async () => {
    const { data, error } = await supabase.from("lawyers").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setLawyers(data || []);
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

  const handleCreate = async () => {
    if (!form.full_name || !form.email) {
      toast({ variant: "destructive", title: "Error", description: "Nombre y email son obligatorios." });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("lawyers").insert({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      bar_number: form.bar_number || null,
      college: form.college || null,
      city: form.city || null,
      bio: form.bio || null,
      specialties: form.specialties.length > 0 ? form.specialties : null,
      languages: form.languages.length > 0 ? form.languages : null,
      is_verified: false,
    });
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Error al crear abogado", description: error.message });
    } else {
      toast({ title: "Abogado creado correctamente" });
      setDrawerOpen(false);
      setForm({ full_name: "", email: "", phone: "", bar_number: "", college: "", city: "", bio: "", specialties: [], languages: [] });
      fetchLawyers();
    }
  };

  const toggleCheckbox = (list: string[], value: string) =>
    list.includes(value) ? list.filter(v => v !== value) : [...list, value];

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Abogados ({lawyers.length})</h2>
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Nuevo abogado</Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader><SheetTitle>Nuevo abogado</SheetTitle></SheetHeader>
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

              <Button onClick={handleCreate} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Crear abogado
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Abogado</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Colegio</TableHead>
              <TableHead>Especialidades</TableHead>
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
                <TableCell>{l.college || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(l.specialties || []).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant={l.is_verified ? "default" : "outline"} className="text-xs">{l.is_verified ? "Verificado" : "No verificado"}</Badge>
                    <Badge variant={l.is_active ? "default" : "outline"} className="text-xs">{l.is_active ? "Activo" : "Inactivo"}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
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
