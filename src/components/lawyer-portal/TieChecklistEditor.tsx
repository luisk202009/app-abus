import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { ChecklistItem } from "@/hooks/useLawyerData";
import { toast } from "sonner";

interface Props {
  caseId: string;
}

export const TieChecklistEditor = ({ caseId }: Props) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState("");

  const fetchItems = async () => {
    const { data } = await supabase
      .from("tie_checklist_items")
      .select("*")
      .eq("case_id", caseId)
      .order("order_index");
    setItems((data || []) as ChecklistItem[]);
  };

  useEffect(() => {
    fetchItems();
  }, [caseId]);

  const toggle = async (item: ChecklistItem) => {
    const newVal = !item.is_completed;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_completed: newVal } : i)));
    await supabase.from("tie_checklist_items").update({ is_completed: newVal }).eq("id", item.id);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const maxOrder = items.reduce((m, i) => Math.max(m, i.order_index || 0), 0);
    const { error } = await supabase
      .from("tie_checklist_items")
      .insert({ case_id: caseId, item: newItem.trim(), order_index: maxOrder + 1, is_completed: false });
    if (error) {
      toast.error("Error: " + error.message);
    } else {
      setNewItem("");
      fetchItems();
    }
  };

  const removeItem = async (id: string) => {
    await supabase.from("tie_checklist_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="border rounded-md p-3 space-y-2">
      <Label className="text-xs font-semibold">Documentos para cita policial</Label>
      <div className="space-y-1.5">
        {items.length === 0 && <p className="text-xs text-muted-foreground italic">No hay documentos en la lista</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <Checkbox checked={!!item.is_completed} onCheckedChange={() => toggle(item)} />
            <span className={`flex-1 text-sm ${item.is_completed ? "line-through text-muted-foreground" : ""}`}>
              {item.item}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => removeItem(item.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
          placeholder="Agregar documento..."
          className="h-8 text-sm"
        />
        <Button size="sm" onClick={addItem} className="h-8"><Plus className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
};
