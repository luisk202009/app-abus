import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, Crown, DollarSign, FileSearch, Map } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserSubmission {
  id: string;
  full_name: string | null;
  email: string | null;
  nationality: string | null;
  current_location: string | null;
  subscription_status: string | null;
  created_at: string;
  user_id: string | null;
  ai_recommendation: any;
  crm_tag?: string | null;
  taskCount?: number;
  completedTasks?: number;
  docStatus?: "completos" | "revision" | "pendiente" | "sin_docs";
  routeName?: string;
}

export const AdminUsersTab = () => {
  const [users, setUsers] = useState<UserSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [routeCounts, setRouteCounts] = useState({ regularizacion: 0, arraigos: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all submissions
      const { data: submissions, error } = await supabase
        .from("onboarding_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch pending reviews count
      const { count: reviewCount } = await supabase
        .from("user_documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "analyzing");

      setPendingReviews(reviewCount || 0);

      // Fetch all active routes with templates
      const { data: activeRoutes } = await supabase
        .from("user_active_routes")
        .select("user_id, template_id");

      const { data: templates } = await supabase
        .from("route_templates")
        .select("id, name");

      const templateMap: Record<string, string> = {};
      (templates || []).forEach((t) => { templateMap[t.id] = t.name; });

      // Count routes by type
      let regCount = 0;
      let arrCount = 0;
      const userRouteMap: Record<string, string> = {};

      (activeRoutes || []).forEach((r) => {
        const name = templateMap[r.template_id || ""] || "";
        if (r.user_id) userRouteMap[r.user_id] = name;
        if (name.toLowerCase().includes("regularizaci")) regCount++;
        else if (name.toLowerCase().includes("arraigo")) arrCount++;
      });

      setRouteCounts({ regularizacion: regCount, arraigos: arrCount });

      // Fetch document statuses per user
      const { data: allDocs } = await supabase
        .from("user_documents")
        .select("user_id, status");

      const userDocMap: Record<string, string[]> = {};
      (allDocs || []).forEach((d) => {
        if (!userDocMap[d.user_id]) userDocMap[d.user_id] = [];
        userDocMap[d.user_id].push(d.status || "waiting");
      });

      // Build enriched user list
      const enriched = (submissions || []).map((sub) => {
        const statuses = sub.user_id ? (userDocMap[sub.user_id] || []) : [];
        let docStatus: UserSubmission["docStatus"] = "sin_docs";
        if (statuses.length > 0) {
          if (statuses.every((s) => s === "valid")) docStatus = "completos";
          else if (statuses.some((s) => s === "analyzing")) docStatus = "revision";
          else docStatus = "pendiente";
        }

        const routeName = sub.user_id ? (userRouteMap[sub.user_id] || "") : "";

        // Generate CRM tag
        let crmTag = "";
        if (routeName && sub.subscription_status) {
          const routeSlug = routeName.toLowerCase().includes("regularizaci")
            ? "regularizacion_2026"
            : routeName.toLowerCase().includes("arraigo")
            ? "arraigo_social"
            : "";
          if (routeSlug) {
            crmTag = `${routeSlug}_${sub.subscription_status}`;
          }
        }

        return {
          ...sub,
          docStatus,
          routeName,
          crm_tag: crmTag || sub.crm_tag || null,
          taskCount: 0,
          completedTasks: 0,
        };
      });

      setUsers(enriched);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocBadge = (status: UserSubmission["docStatus"]) => {
    switch (status) {
      case "completos":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Docs Completos</Badge>;
      case "revision":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">En Revisión</Badge>;
      case "pendiente":
        return <Badge className="bg-muted text-muted-foreground">Pendiente</Badge>;
      default:
        return <span className="text-muted-foreground text-xs">—</span>;
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

  const totalUsers = users.length;
  const proUsers = users.filter((u) => u.subscription_status === "pro").length;
  const premiumUsers = users.filter((u) => u.subscription_status === "premium").length;
  const paidUsers = proUsers + premiumUsers;
  const estimatedRevenue = proUsers * 9.99 + premiumUsers * 19.99;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{estimatedRevenue.toFixed(2)}€</p>
                <p className="text-xs text-muted-foreground">MRR estimado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{paidUsers}</p>
                <p className="text-xs text-muted-foreground">Pro / Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Map className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold">{routeCounts.regularizacion} / {routeCounts.arraigos}</p>
                <p className="text-xs text-muted-foreground">Reg. / Arraigos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileSearch className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{pendingReviews}</p>
                <p className="text-xs text-muted-foreground">En revisión</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios</CardTitle>
          <CardDescription>
            Todos los leads y usuarios registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>CRM Tag</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "—"}
                  </TableCell>
                  <TableCell className="text-sm">{user.email || "—"}</TableCell>
                  <TableCell>{user.nationality || "—"}</TableCell>
                  <TableCell>
                    {user.subscription_status === "premium" ? (
                      <Badge className="bg-primary text-primary-foreground">Premium</Badge>
                    ) : user.subscription_status === "pro" ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20">Pro</Badge>
                    ) : user.user_id ? (
                      <Badge variant="secondary">Free</Badge>
                    ) : (
                      <Badge variant="outline">Lead</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm max-w-[120px] truncate">
                    {user.routeName || "—"}
                  </TableCell>
                  <TableCell>{getDocBadge(user.docStatus)}</TableCell>
                  <TableCell>
                    {user.crm_tag ? (
                      <Badge variant="outline" className="text-xs font-mono">
                        {user.crm_tag}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(user.created_at), "d MMM yyyy", { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
