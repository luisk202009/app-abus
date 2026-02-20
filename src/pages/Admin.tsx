import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Package, FileText, Map, Loader2, FolderOpen, BarChart3, BookOpen } from "lucide-react";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminPlansTab } from "@/components/admin/AdminPlansTab";
import { AdminResourcesTab } from "@/components/admin/AdminResourcesTab";
import { AdminRoutesTab } from "@/components/admin/AdminRoutesTab";
import { AdminDocumentsTab } from "@/components/admin/AdminDocumentsTab";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";
import isotipoAlbus from "@/assets/isotipo-albus.png";

const ADMIN_EMAIL = "l@albus.com.co";

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

    // Check if user is admin
    if (user.email === ADMIN_EMAIL) {
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
  }, [user, authLoading, navigate, toast]);

  if (authLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src={isotipoAlbus}
            alt="Albus"
            className="w-12 h-12 animate-pulse"
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
              <img src={isotipoAlbus} alt="Albus" className="w-6 h-6" />
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
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
