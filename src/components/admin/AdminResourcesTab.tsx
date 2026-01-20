import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Upload, FileText, Lock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  plan_requirement: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export const AdminResourcesTab = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_url: "",
    file_name: "",
    plan_requirement: "free",
    category: "",
    is_active: true,
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingResource(null);
    setFormData({
      title: "",
      description: "",
      file_url: "",
      file_name: "",
      plan_requirement: "free",
      category: "",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || "",
      file_url: resource.file_url || "",
      file_name: resource.file_name || "",
      plan_requirement: resource.plan_requirement,
      category: resource.category || "",
      is_active: resource.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("resources")
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        file_url: publicUrl,
        file_name: file.name,
      });

      toast({ title: "Archivo subido correctamente" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al subir archivo",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({
        variant: "destructive",
        title: "Título requerido",
      });
      return;
    }

    setIsSaving(true);

    try {
      const resourceData = {
        title: formData.title,
        description: formData.description || null,
        file_url: formData.file_url || null,
        file_name: formData.file_name || null,
        plan_requirement: formData.plan_requirement,
        category: formData.category || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      if (editingResource) {
        const { error } = await supabase
          .from("resources")
          .update(resourceData)
          .eq("id", editingResource.id);

        if (error) throw error;
        toast({ title: "Recurso actualizado" });
      } else {
        const { error } = await supabase
          .from("resources")
          .insert(resourceData);

        if (error) throw error;
        toast({ title: "Recurso creado" });
      }

      setIsDialogOpen(false);
      fetchResources();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`¿Eliminar el recurso "${resource.title}"?`)) return;

    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resource.id);

      if (error) throw error;
      toast({ title: "Recurso eliminado" });
      fetchResources();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
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
            <CardTitle>Recursos</CardTitle>
            <CardDescription>
              Gestiona los recursos descargables para usuarios
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo recurso
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Archivo</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {resource.category || "—"}
                  </TableCell>
                  <TableCell>
                    {resource.file_name ? (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate max-w-[100px]">{resource.file_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={resource.plan_requirement === "pro" ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {resource.plan_requirement === "pro" && <Lock className="w-3 h-3" />}
                      {resource.plan_requirement.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={resource.is_active ? "default" : "outline"}>
                      {resource.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(resource.created_at), "d MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(resource)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(resource)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {resources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No hay recursos todavía
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Editar recurso" : "Nuevo recurso"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Guía de visados para España"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md bg-background text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del recurso..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Guías, Plantillas..."
                />
              </div>
              <div className="space-y-2">
                <Label>Plan requerido</Label>
                <Select
                  value={formData.plan_requirement}
                  onValueChange={(v) => setFormData({ ...formData, plan_requirement: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Archivo adjunto</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              {formData.file_name ? (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{formData.file_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Subir archivo
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Recurso activo</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingResource ? "Guardar cambios" : "Crear recurso"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
