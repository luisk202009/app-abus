import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Package, FileText, Map, Loader2, FolderOpen, BarChart3, BookOpen, Scale, Briefcase, Inbox } from "lucide-react";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminPlansTab } from "@/components/admin/AdminPlansTab";
import { AdminResourcesTab } from "@/components/admin/AdminResourcesTab";
import { AdminRoutesTab } from "@/components/admin/AdminRoutesTab";
import { AdminDocumentsTab } from "@/components/admin/AdminDocumentsTab";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";
import { AdminLawyersTab } from "@/components/admin/AdminLawyersTab";
import { AdminServiceTypesTab } from "@/components/admin/AdminServiceTypesTab";
import { AdminLegalLeadsTab } from "@/components/admin/AdminLegalLeadsTab";
import albusLogo from "@/assets/albus-logo.png";



const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/");
      return;
    }

    // Check if user has admin role in database
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setIsAuthorized(true);
        } else {
          toast({
            variant: "destructive",
            title: "Acceso denegado",
            description: "No tienes permisos para acceder a esta página.",
          });
          navigate("/");
        }
        setCheckingAuth(false);
      });
  }, [user, authLoading, navigate, toast]);

  if (authLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src={albusLogo}
            alt="Albus"
            className="h-10 w-auto animate-pulse"
          />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <img src={albusLogo} alt="Albus" className="h-5 w-auto" />
              <span className="font-semibold">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/manual")} className="gap-1.5">
              <BookOpen className="w-4 h-4" />
              Manual
            </Button>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 space-y-6">
        <AdminSystemStatus />
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-background border border-border">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Package className="w-4 h-4" />
              Planes
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <FileText className="w-4 h-4" />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="routes" className="gap-2">
              <Map className="w-4 h-4" />
              Rutas
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="lawyers" className="gap-2">
              <Scale className="w-4 h-4" />
              Abogados
            </TabsTrigger>
            <TabsTrigger value="service-types" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Servicios
            </TabsTrigger>
            <TabsTrigger value="legal-leads" className="gap-2">
              <Inbox className="w-4 h-4" />
              Leads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdminAnalyticsTab />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="plans">
            <AdminPlansTab />
          </TabsContent>

          <TabsContent value="resources">
            <AdminResourcesTab />
          </TabsContent>

          <TabsContent value="routes">
            <AdminRoutesTab />
          </TabsContent>

          <TabsContent value="documents">
            <AdminDocumentsTab />
          </TabsContent>

          <TabsContent value="lawyers">
            <AdminLawyersTab />
          </TabsContent>

          <TabsContent value="service-types">
            <AdminServiceTypesTab />
          </TabsContent>

          <TabsContent value="legal-leads">
            <AdminLegalLeadsTab />
          </TabsContent>
        </Tabs>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
