import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, Crown } from "lucide-react";
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
  taskCount?: number;
  completedTasks?: number;
}

export const AdminUsersTab = () => {
  const [users, setUsers] = useState<UserSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all submissions
      const { data: submissions, error } = await supabase
        .from("onboarding_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch task counts for each user
      const usersWithTasks = await Promise.all(
        (submissions || []).map(async (submission) => {
          if (submission.user_id) {
            const { data: tasks } = await supabase
              .from("user_tasks")
              .select("status")
              .eq("user_id", submission.user_id);

            return {
              ...submission,
              taskCount: tasks?.length || 0,
              completedTasks: tasks?.filter((t) => t.status === "completed").length || 0,
            };
          }
          return { ...submission, taskCount: 0, completedTasks: 0 };
        })
      );

      setUsers(usersWithTasks);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVisaType = (recommendation: any) => {
    if (!recommendation) return "Sin análisis";
    return recommendation.title || recommendation.type || "Consulta";
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
  const premiumUsers = users.filter((u) => u.subscription_status === "pro").length;
  const registeredUsers = users.filter((u) => u.user_id).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{registeredUsers}</p>
                <p className="text-sm text-muted-foreground">Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{premiumUsers}</p>
                <p className="text-sm text-muted-foreground">Pro</p>
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
                <TableHead>Visa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "—"}
                  </TableCell>
                  <TableCell>{user.email || "—"}</TableCell>
                  <TableCell>{user.nationality || "—"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {getVisaType(user.ai_recommendation)}
                  </TableCell>
                  <TableCell>
                    {user.subscription_status === "pro" ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Pro
                      </Badge>
                    ) : user.user_id ? (
                      <Badge variant="secondary">Registrado</Badge>
                    ) : (
                      <Badge variant="outline">Lead</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.taskCount > 0 ? (
                      <span className="text-sm">
                        {user.completedTasks}/{user.taskCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
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
