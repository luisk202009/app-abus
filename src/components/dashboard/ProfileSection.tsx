import { useState, useEffect } from "react";
import { User, Mail, Globe, Crown, Lock, Pencil, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSectionProps {
  isPremium: boolean;
  subscriptionStatus: string;
}

export const ProfileSection = ({ isPremium, subscriptionStatus }: ProfileSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    nationality: "",
    email: "",
  });
  const [editData, setEditData] = useState({ full_name: "", nationality: "" });
  const [planInfo, setPlanInfo] = useState<{ name: string; price_cents: number; currency: string; interval: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("onboarding_submissions")
        .select("full_name, nationality, email, subscription_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          nationality: data.nationality || "",
          email: data.email || user.email || "",
        });
        setEditData({
          full_name: data.full_name || "",
          nationality: data.nationality || "",
        });
      } else {
        setProfileData(prev => ({ ...prev, email: user.email || "" }));
      }

      // Fetch plan info
      const slug = subscriptionStatus === "premium" ? "premium" : subscriptionStatus === "pro" ? "pro" : "free";
      const { data: plan } = await supabase
        .from("plans")
        .select("name, price_cents, currency, interval")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (plan) setPlanInfo(plan);
    };

    fetchProfile();
  }, [user, subscriptionStatus]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("onboarding_submissions")
      .update({
        full_name: editData.full_name.trim(),
        nationality: editData.nationality.trim(),
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el perfil." });
    } else {
      setProfileData(prev => ({ ...prev, ...editData }));
      setIsEditing(false);
      toast({ title: "Perfil actualizado", description: "Tus datos se han guardado correctamente." });
    }
    setIsSaving(false);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el correo." });
    } else {
      toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada para cambiar tu contraseña." });
    }
    setIsResetting(false);
  };

  const getPlanBadge = () => {
    if (subscriptionStatus === "premium") {
      return <Badge className="gap-1 bg-primary text-primary-foreground"><Crown className="w-3 h-3" />Premium</Badge>;
    }
    if (subscriptionStatus === "pro" || isPremium) {
      return <Badge className="gap-1 bg-primary text-primary-foreground"><Crown className="w-3 h-3" />Pro</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Gratis</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Mi Perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tu información personal y suscripción.</p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Información Personal</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
              <Pencil className="w-3.5 h-3.5" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditData({ full_name: profileData.full_name, nationality: profileData.nationality }); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" className="gap-2" onClick={handleSave} disabled={isSaving}>
                <Save className="w-3.5 h-3.5" />
                Guardar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Name */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Nombre completo</p>
              {isEditing ? (
                <Input
                  value={editData.full_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="mt-1 h-9"
                  placeholder="Tu nombre"
                  maxLength={100}
                />
              ) : (
                <p className="font-medium">{profileData.full_name || "Sin definir"}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Correo electrónico</p>
              <p className="font-medium">{profileData.email}</p>
            </div>
          </div>

          {/* Nationality */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Nacionalidad</p>
              {isEditing ? (
                <Input
                  value={editData.nationality}
                  onChange={(e) => setEditData(prev => ({ ...prev, nationality: e.target.value }))}
                  className="mt-1 h-9"
                  placeholder="Tu nacionalidad"
                  maxLength={100}
                />
              ) : (
                <p className="font-medium">{profileData.nationality || "Sin definir"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan & Billing Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Suscripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plan actual</p>
              <div className="flex items-center gap-2 mt-1">
                {getPlanBadge()}
                {planInfo && planInfo.price_cents > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {(planInfo.price_cents / 100).toFixed(2)} {planInfo.currency.toUpperCase()}/{planInfo.interval === "month" ? "mes" : planInfo.interval}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handlePasswordReset}
            disabled={isResetting}
          >
            <Lock className="w-4 h-4" />
            {isResetting ? "Enviando..." : "Cambiar Contraseña"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Te enviaremos un correo con un enlace para restablecer tu contraseña.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
