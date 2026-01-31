import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface RouteTemplateStep {
  id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  step_order: number | null;
}

interface StepTemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: RouteTemplateStep | null;
  templateId: string;
  nextOrder: number;
  onSave: (data: Partial<RouteTemplateStep>) => Promise<void>;
}

export const StepTemplateForm = ({ 
  open, 
  onOpenChange, 
  step, 
  templateId, 
  nextOrder,
  onSave 
}: StepTemplateFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepOrder, setStepOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (step) {
      setTitle(step.title || "");
      setDescription(step.description || "");
      setStepOrder(step.step_order || 1);
    } else {
      setTitle("");
      setDescription("");
      setStepOrder(nextOrder);
    }
  }, [step, nextOrder, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        template_id: templateId,
        title: title.trim(),
        description: description.trim() || null,
        step_order: stepOrder,
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
          <DialogTitle>{step ? "Editar paso" : "Nuevo paso"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Paso</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Preparar documentación base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Orden</Label>
            <Input
              id="order"
              type="number"
              min={1}
              value={stepOrder}
              onChange={(e) => setStepOrder(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instrucciones detalladas para este paso..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {step ? "Guardar cambios" : "Crear paso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
