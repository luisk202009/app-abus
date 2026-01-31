import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface RouteTemplate {
  id: string;
  name: string;
  country: string | null;
  description: string | null;
  estimated_cost: string | null;
  required_savings: string | null;
  difficulty: string | null;
}

interface RouteTemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: RouteTemplate | null;
  onSave: (data: Partial<RouteTemplate>) => Promise<void>;
}

export const RouteTemplateForm = ({ open, onOpenChange, template, onSave }: RouteTemplateFormProps) => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("España");
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [requiredSavings, setRequiredSavings] = useState("");
  const [difficulty, setDifficulty] = useState("media");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setCountry(template.country || "España");
      setDescription(template.description || "");
      setEstimatedCost(template.estimated_cost || "");
      setRequiredSavings(template.required_savings || "");
      setDifficulty(template.difficulty || "media");
    } else {
      setName("");
      setCountry("España");
      setDescription("");
      setEstimatedCost("");
      setRequiredSavings("");
      setDifficulty("media");
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        country,
        description: description.trim() || null,
        estimated_cost: estimatedCost.trim() || null,
        required_savings: requiredSavings.trim() || null,
        difficulty,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{template ? "Editar ruta" : "Nueva ruta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Ruta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Visado de Nómada Digital"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="España">España</SelectItem>
                  <SelectItem value="Portugal">Portugal</SelectItem>
                  <SelectItem value="Francia">Francia</SelectItem>
                  <SelectItem value="Italia">Italia</SelectItem>
                  <SelectItem value="Alemania">Alemania</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Nivel de Dificultad</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción breve</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Visado para trabajadores remotos..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Coste Estimado</Label>
              <Input
                id="cost"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="800 - 1,200 EUR"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="savings">Ahorros Requeridos</Label>
              <Input
                id="savings"
                value={requiredSavings}
                onChange={(e) => setRequiredSavings(e.target.value)}
                placeholder="10,000+ EUR"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {template ? "Guardar cambios" : "Crear ruta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
