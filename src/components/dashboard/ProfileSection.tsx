import { useState, useEffect, useRef } from "react";
import { User, Mail, Globe, Crown, Lock, Pencil, Save, X, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CountrySelect } from "@/components/onboarding/CountrySelect";

interface ProfileSectionProps {
  isPremium: boolean;
  subscriptionStatus: string;
  onProfileUpdate?: (data: { full_name: string; nationality: string; avatar_url?: string }) => void;
}

export const ProfileSection = ({ isPremium, subscriptionStatus, onProfileUpdate }: ProfileSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
        .select("full_name, nationality, email, subscription_status, avatar_url")
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
        if ((data as any).avatar_url) {
          setAvatarUrl((data as any).avatar_url);
        }
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

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ variant: "destructive", title: "Formato no válido", description: "Solo se permiten imágenes JPG, PNG o WebP." });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Archivo muy grande", description: "La imagen no puede superar 5MB." });
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Upload to Storage
    setIsUploadingAvatar(true);
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      toast({ variant: "destructive", title: "Error", description: "No se pudo subir la imagen." });
      setAvatarPreview(null);
      setIsUploadingAvatar(false);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const newAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    // Save to database
    const { error: dbError } = await supabase
      .from("onboarding_submissions")
      .update({ avatar_url: newAvatarUrl } as any)
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Avatar DB update error:", dbError);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la URL de la imagen." });
    } else {
      setAvatarUrl(newAvatarUrl);
      toast({ title: "Foto actualizada", description: "Tu foto de perfil se ha actualizado." });
      onProfileUpdate?.({ full_name: profileData.full_name, nationality: profileData.nationality, avatar_url: newAvatarUrl });
    }

    setAvatarPreview(null);
    setIsUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const payload = {
      full_name: editData.full_name.trim(),
      nationality: editData.nationality.trim(),
    };

    // Paso 1: intentar reclamar fila huérfana por email vía edge function
    // (bypassa RLS de forma segura y evita choques con el constraint UNIQUE de email)
    try {
      await supabase.functions.invoke("claim-onboarding-row");
    } catch (claimErr) {
      console.warn("claim-onboarding-row failed (continuamos):", claimErr);
    }

    // Paso 2: UPDATE por user_id (ahora la fila debería existir si había lead previo)
    const { data: updated, error: updateError } = await supabase
      .from("onboarding_submissions")
      .update(payload)
      .eq("user_id", user.id)
      .select("id");

    if (updateError) {
      console.error("Profile update error:", updateError.message, updateError.code, updateError.details);
      toast({ variant: "destructive", title: "Error", description: updateError.message || "No se pudo actualizar el perfil." });
      setIsSaving(false);
      return;
    }

    // Paso 3: si no había fila previa de ningún tipo, INSERT
    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabase
        .from("onboarding_submissions")
        .insert({ ...payload, user_id: user.id, email: user.email || "" });

      if (insertError) {
        console.error("Profile insert error:", insertError.message, insertError.code, insertError.details);
        toast({ variant: "destructive", title: "Error", description: insertError.message || "No se pudo crear el perfil." });
        setIsSaving(false);
        return;
      }
    }

    setProfileData(prev => ({ ...prev, full_name: payload.full_name, nationality: payload.nationality }));
    setIsEditing(false);
    toast({ title: "Perfil actualizado", description: "Tus datos se han guardado correctamente." });
    onProfileUpdate?.({ full_name: payload.full_name, nationality: payload.nationality });
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

  const displayAvatar = avatarPreview || avatarUrl;

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
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="w-16 h-16">
                {displayAvatar ? (
                  <AvatarImage src={displayAvatar} alt="Foto de perfil" />
                ) : null}
                <AvatarFallback className="bg-secondary">
                  <User className="w-7 h-7 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{profileData.full_name || "Sin definir"}</p>
              <p className="text-xs text-muted-foreground">{profileData.email}</p>
              {isEditing && (
                <p className="text-xs text-muted-foreground mt-1">Haz clic en la foto para cambiarla</p>
              )}
            </div>
          </div>

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
                <div className="mt-1">
                  <CountrySelect
                    value={editData.nationality}
                    onChange={(val) => setEditData(prev => ({ ...prev, nationality: val }))}
                    compact
                  />
                </div>
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
