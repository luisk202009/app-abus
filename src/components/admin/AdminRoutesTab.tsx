import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, List, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { RouteTemplateForm } from "./RouteTemplateForm";
import { StepTemplateForm } from "./StepTemplateForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RouteTemplate {
  id: string;
  name: string;
  country: string | null;
  description: string | null;
  estimated_cost: string | null;
  required_savings: string | null;
  difficulty: string | null;
}

interface RouteTemplateStep {
  id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  step_order: number | null;
}

export const AdminRoutesTab = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [steps, setSteps] = useState<RouteTemplateStep[]>([]);
  const [stepsCount, setStepsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingSteps, setLoadingSteps] = useState(false);
  
  // Route form state
  const [routeFormOpen, setRouteFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteTemplate | null>(null);
  const [deleteRouteOpen, setDeleteRouteOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<RouteTemplate | null>(null);
  
  // Step form state
  const [selectedTemplate, setSelectedTemplate] = useState<RouteTemplate | null>(null);
  const [stepFormOpen, setStepFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<RouteTemplateStep | null>(null);
  const [deleteStepOpen, setDeleteStepOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<RouteTemplateStep | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("route_templates")
      .select("*")
      .order("name");

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setTemplates(data || []);
      // Fetch step counts
      const { data: stepsData } = await supabase
        .from("route_template_steps")
        .select("template_id");
      
      const counts: Record<string, number> = {};
      stepsData?.forEach((step) => {
        if (step.template_id) {
          counts[step.template_id] = (counts[step.template_id] || 0) + 1;
        }
      });
      setStepsCount(counts);
    }
    setLoading(false);
  };

  const fetchSteps = async (templateId: string) => {
    setLoadingSteps(true);
    const { data, error } = await supabase
      .from("route_template_steps")
      .select("*")
      .eq("template_id", templateId)
      .order("step_order");

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setSteps(data || []);
    }
    setLoadingSteps(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchSteps(selectedTemplate.id);
    } else {
      setSteps([]);
    }
  }, [selectedTemplate]);

  // Route CRUD handlers
  const handleSaveRoute = async (data: Partial<RouteTemplate>) => {
    if (editingRoute) {
      const { error } = await supabase
        .from("route_templates")
        .update(data)
        .eq("id", editingRoute.id);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        throw error;
      }
      toast({ title: "Ruta actualizada" });
    } else {
      const { error } = await supabase
        .from("route_templates")
        .insert(data as any);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        throw error;
      }
      toast({ title: "Ruta creada" });
    }
    setEditingRoute(null);
    fetchTemplates();
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;
    
    const { error } = await supabase
      .from("route_templates")
      .delete()
      .eq("id", routeToDelete.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Ruta eliminada" });
      if (selectedTemplate?.id === routeToDelete.id) {
        setSelectedTemplate(null);
      }
      fetchTemplates();
    }
    setRouteToDelete(null);
    setDeleteRouteOpen(false);
  };

  // Step CRUD handlers
  const handleSaveStep = async (data: Partial<RouteTemplateStep>) => {
    if (editingStep) {
      const { error } = await supabase
        .from("route_template_steps")
        .update(data)
        .eq("id", editingStep.id);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        throw error;
      }
      toast({ title: "Paso actualizado" });
    } else {
      const { error } = await supabase
        .from("route_template_steps")
        .insert(data as any);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        throw error;
      }
      toast({ title: "Paso creado" });
    }
    setEditingStep(null);
    if (selectedTemplate) {
      fetchSteps(selectedTemplate.id);
      fetchTemplates(); // Refresh step counts
    }
  };

  const handleDeleteStep = async () => {
    if (!stepToDelete) return;
    
    const { error } = await supabase
      .from("route_template_steps")
      .delete()
      .eq("id", stepToDelete.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Paso eliminado" });
      if (selectedTemplate) {
        fetchSteps(selectedTemplate.id);
        fetchTemplates();
      }
    }
    setStepToDelete(null);
    setDeleteStepOpen(false);
  };

  // Reorder steps
  const moveStep = async (step: RouteTemplateStep, direction: "up" | "down") => {
    const currentIndex = steps.findIndex((s) => s.id === step.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    
    const targetStep = steps[targetIndex];
    const currentOrder = step.step_order || currentIndex + 1;
    const targetOrder = targetStep.step_order || targetIndex + 1;

    // Swap orders
    await supabase
      .from("route_template_steps")
      .update({ step_order: targetOrder })
      .eq("id", step.id);

    await supabase
      .from("route_template_steps")
      .update({ step_order: currentOrder })
      .eq("id", targetStep.id);

    if (selectedTemplate) {
      fetchSteps(selectedTemplate.id);
    }
  };

  const getDifficultyBadge = (difficulty: string | null) => {
    switch (difficulty) {
      case "facil":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Fácil</Badge>;
      case "alta":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Alta</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Media</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Routes Catalog */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Catálogo de Rutas</CardTitle>
            <CardDescription>Gestiona las plantillas de rutas disponibles para usuarios</CardDescription>
          </div>
          <Button onClick={() => { setEditingRoute(null); setRouteFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva ruta
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Dificultad</TableHead>
                  <TableHead>Pasos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow 
                    key={template.id}
                    className={selectedTemplate?.id === template.id ? "bg-muted/50" : ""}
                  >
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.country || "España"}</TableCell>
                    <TableCell>{getDifficultyBadge(template.difficulty)}</TableCell>
                    <TableCell>{stepsCount[template.id] || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingRoute(template); setRouteFormOpen(true); }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setRouteToDelete(template); setDeleteRouteOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay rutas creadas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Steps Editor */}
      {selectedTemplate && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pasos de: {selectedTemplate.name}</CardTitle>
              <CardDescription>Gestiona los pasos de esta ruta</CardDescription>
            </div>
            <Button onClick={() => { setEditingStep(null); setStepFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo paso
            </Button>
          </CardHeader>
          <CardContent>
            {loadingSteps ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="max-w-xs">Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {steps.map((step, index) => (
                    <TableRow key={step.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {step.step_order || index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{step.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {step.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveStep(step, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveStep(step, "down")}
                            disabled={index === steps.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingStep(step); setStepFormOpen(true); }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setStepToDelete(step); setDeleteStepOpen(true); }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {steps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay pasos creados para esta ruta
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Route Form Modal */}
      <RouteTemplateForm
        open={routeFormOpen}
        onOpenChange={setRouteFormOpen}
        template={editingRoute}
        onSave={handleSaveRoute}
      />

      {/* Step Form Modal */}
      {selectedTemplate && (
        <StepTemplateForm
          open={stepFormOpen}
          onOpenChange={setStepFormOpen}
          step={editingStep}
          templateId={selectedTemplate.id}
          nextOrder={steps.length + 1}
          onSave={handleSaveStep}
        />
      )}

      {/* Delete Route Confirmation */}
      <AlertDialog open={deleteRouteOpen} onOpenChange={setDeleteRouteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ruta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la ruta "{routeToDelete?.name}" y todos sus pasos asociados. 
              Las rutas ya iniciadas por usuarios no se verán afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoute} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Step Confirmation */}
      <AlertDialog open={deleteStepOpen} onOpenChange={setDeleteStepOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el paso "{stepToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStep} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
