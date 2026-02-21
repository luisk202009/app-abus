import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  interval: string;
  features: string[];
  is_active: boolean;
  stripe_price_id: string | null;
  max_routes: number;
  has_documents: boolean;
  has_fiscal_simulator: boolean;
  has_appointments: boolean;
  has_life_in_spain: boolean;
  has_business: boolean;
  has_referrals: boolean;
}

const FEATURE_TOGGLES = [
  { key: "has_documents", label: "Documentos" },
  { key: "has_fiscal_simulator", label: "Simulador Fiscal" },
  { key: "has_appointments", label: "Gestión de Cita" },
  { key: "has_life_in_spain", label: "Vida en España" },
  { key: "has_business", label: "Negocios" },
  { key: "has_referrals", label: "Referidos" },
] as const;

export const AdminPlansTab = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price_cents: 0,
    features: "",
    is_active: true,
    stripe_price_id: "",
    max_routes: 1,
    has_documents: false,
    has_fiscal_simulator: false,
    has_appointments: false,
    has_life_in_spain: false,
    has_business: false,
    has_referrals: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price_cents", { ascending: true });

      if (error) throw error;

      setPlans(
        (data || []).map((p) => ({
          ...p,
          features: Array.isArray(p.features) ? p.features : JSON.parse(p.features as string || "[]"),
        }))
      );
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({
      name: "", slug: "", price_cents: 0, features: "", is_active: true,
      stripe_price_id: "", max_routes: 1,
      has_documents: false, has_fiscal_simulator: false, has_appointments: false,
      has_life_in_spain: false, has_business: false, has_referrals: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name, slug: plan.slug, price_cents: plan.price_cents,
      features: plan.features.join("\n"), is_active: plan.is_active,
      stripe_price_id: plan.stripe_price_id || "", max_routes: plan.max_routes,
      has_documents: plan.has_documents, has_fiscal_simulator: plan.has_fiscal_simulator,
      has_appointments: plan.has_appointments, has_life_in_spain: plan.has_life_in_spain,
      has_business: plan.has_business, has_referrals: plan.has_referrals,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const featuresArray = formData.features.split("\n").map((f) => f.trim()).filter(Boolean);
      const planData = {
        name: formData.name, slug: formData.slug, price_cents: formData.price_cents,
        features: featuresArray, is_active: formData.is_active,
        stripe_price_id: formData.stripe_price_id || null,
        max_routes: formData.max_routes, has_documents: formData.has_documents,
        has_fiscal_simulator: formData.has_fiscal_simulator, has_appointments: formData.has_appointments,
        has_life_in_spain: formData.has_life_in_spain, has_business: formData.has_business,
        has_referrals: formData.has_referrals, updated_at: new Date().toISOString(),
      };

      if (editingPlan) {
        const { error } = await supabase.from("plans").update(planData).eq("id", editingPlan.id);
        if (error) throw error;
        toast({ title: "Plan actualizado" });
      } else {
        const { error } = await supabase.from("plans").insert(planData);
        if (error) throw error;
        toast({ title: "Plan creado" });
      }

      setIsDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message || "Error desconocido" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`¿Eliminar el plan "${plan.name}"?`)) return;
    try {
      const { error } = await supabase.from("plans").delete().eq("id", plan.id);
      if (error) throw error;
      toast({ title: "Plan eliminado" });
      fetchPlans();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message || "Error desconocido" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planes de precios</CardTitle>
            <CardDescription>Gestiona los planes que se muestran en la página de precios</CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo plan
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Rutas</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="text-muted-foreground">{plan.slug}</TableCell>
                  <TableCell>{(plan.price_cents / 100).toFixed(2)}€/{plan.interval}</TableCell>
                  <TableCell>{plan.max_routes}</TableCell>
                  <TableCell className="max-w-[120px]">
                    <span className="text-sm text-muted-foreground">{plan.features.length} items</span>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {FEATURE_TOGGLES.filter((ft) => plan[ft.key]).map((ft) => (
                        <Badge key={ft.key} variant="outline" className="text-[10px] px-1.5">
                          {ft.label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(plan)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar plan" : "Nuevo plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Pro" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="pro" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Precio (céntimos)</Label>
                <Input type="number" value={formData.price_cents} onChange={(e) => setFormData({ ...formData, price_cents: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Max Rutas</Label>
                <Input type="number" value={formData.max_routes} onChange={(e) => setFormData({ ...formData, max_routes: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>Stripe Price ID</Label>
                <Input value={formData.stripe_price_id} onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })} placeholder="price_..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Características (una por línea)</Label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-sm"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder={"Análisis de perfil\nChecklist de tareas\nSoporte por email"}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Módulos incluidos</Label>
              <div className="grid grid-cols-2 gap-3">
                {FEATURE_TOGGLES.map((ft) => (
                  <div key={ft.key} className="flex items-center gap-3">
                    <Switch
                      checked={(formData as any)[ft.key]}
                      onCheckedChange={(checked) => setFormData({ ...formData, [ft.key]: checked })}
                    />
                    <Label className="text-sm">{ft.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
              <Label>Plan activo</Label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingPlan ? "Guardar cambios" : "Crear plan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
