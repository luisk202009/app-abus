import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Lawyer } from "@/hooks/useLawyerData";
import { toast } from "sonner";

const SPECIALTIES = ["regularización", "arraigos", "recursos", "nómada digital"];
const LANGUAGES = ["español", "inglés", "francés", "árabe"];

interface Props {
  lawyer: Lawyer;
  onRefresh: () => void;
}

export const LawyerProfileTab = ({ lawyer, onRefresh }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    bio: lawyer.bio || "",
    phone: lawyer.phone || "",
    city: lawyer.city || "",
    specialties: lawyer.specialties || [],
    languages: lawyer.languages || [],
    photo_url: lawyer.photo_url || "",
  });

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lawyer.user_id) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `lawyers/${lawyer.user_id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      toast.error("Error subiendo foto: " + upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    setUploading(false);
    toast.success("Foto cargada. Recuerda guardar.");
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("lawyers")
      .update({
        bio: form.bio || null,
        phone: form.phone || null,
        city: form.city || null,
        specialties: form.specialties.length ? form.specialties : null,
        languages: form.languages.length ? form.languages : null,
        photo_url: form.photo_url || null,
      })
      .eq("id", lawyer.id);
    setSaving(false);
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success("Perfil actualizado");
      onRefresh();
    }
  };

  const initials = lawyer.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl space-y-4">
      <Card className="p-5">
        <div className="flex items-start gap-4 mb-6">
          {form.photo_url ? (
            <img src={form.photo_url} alt="" className="w-20 h-20 rounded-full object-cover border" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{lawyer.full_name}</h2>
            <p className="text-sm text-muted-foreground">{lawyer.email}</p>
            <div className="flex gap-2 mt-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-1.5">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Cambiar foto
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Solo lectura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-md">
            <div>
              <Label className="text-xs">Nº Colegiado</Label>
              <p className="text-sm mt-1">{lawyer.bar_number || "—"}</p>
            </div>
            <div>
              <Label className="text-xs">Colegio</Label>
              <p className="text-sm mt-1">{lawyer.college || "—"}</p>
            </div>
            <div>
              <Label className="text-xs">Verificación</Label>
              <div className="mt-1">
                {lawyer.is_verified ? (
                  <Badge className="gap-1"><ShieldCheck className="w-3 h-3" /> Verificado</Badge>
                ) : (
                  <Badge variant="outline">Pendiente</Badge>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Estos campos solo pueden ser modificados por el equipo de Albus.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={4} className="mt-1" />
          </div>

          <div>
            <Label>Especialidades</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SPECIALTIES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form.specialties.includes(s)} onCheckedChange={() => setForm((f) => ({ ...f, specialties: toggle(f.specialties, s) }))} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Idiomas</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {LANGUAGES.map((l) => (
                <label key={l} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form.languages.includes(l)} onCheckedChange={() => setForm((f) => ({ ...f, languages: toggle(f.languages, l) }))} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Guardar cambios
          </Button>
        </div>
      </Card>
    </div>
  );
};
