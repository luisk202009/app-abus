import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Languages, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { LawyerCardData } from "./LawyerCard";

interface LawyerService {
  id: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  service_type_id: string | null;
  service_name?: string;
}

interface ExistingInquiry {
  id: string;
  status: string;
  created_at: string;
}

interface LawyerProfileModalProps {
  lawyer: LawyerCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Pendiente de asignación", variant: "secondary" },
  assigned: { label: "Asignado", variant: "default" },
  active: { label: "En curso", variant: "default" },
  closed: { label: "Cerrado", variant: "outline" },
};

const MIN_CHARS = 50;

export const LawyerProfileModal = ({ lawyer, open, onOpenChange }: LawyerProfileModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<LawyerService[]>([]);
  const [existingInquiry, setExistingInquiry] = useState<ExistingInquiry | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !lawyer) {
      setMessage("");
      setExistingInquiry(null);
      setServices([]);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch services + service type names
        const { data: svcData } = await supabase
          .from("lawyer_services")
          .select("id, description, price, currency, service_type_id")
          .eq("lawyer_id", lawyer.id)
          .eq("is_active", true);

        const typeIds = (svcData || []).map((s) => s.service_type_id).filter(Boolean) as string[];
        let typeMap: Record<string, string> = {};
        if (typeIds.length > 0) {
          const { data: types } = await supabase
            .from("service_types")
            .select("id, name")
            .in("id", typeIds);
          typeMap = (types || []).reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {});
        }

        setServices(
          (svcData || []).map((s) => ({
            ...s,
            service_name: s.service_type_id ? typeMap[s.service_type_id] : undefined,
          }))
        );

        // Check for active inquiry
        if (user) {
          const { data: inquiries } = await supabase
            .from("lawyer_inquiries")
            .select("id, status, created_at")
            .eq("user_id", user.id)
            .eq("lawyer_id", lawyer.id)
            .neq("status", "closed")
            .order("created_at", { ascending: false })
            .limit(1);

          setExistingInquiry(inquiries && inquiries.length > 0 ? inquiries[0] : null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, lawyer, user]);

  const handleSubmit = async () => {
    if (!user || !lawyer || message.trim().length < MIN_CHARS) return;

    setIsSubmitting(true);
    try {
      // Get submission_id if exists
      const { data: submission } = await supabase
        .from("onboarding_submissions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const { error } = await supabase.from("lawyer_inquiries").insert({
        user_id: user.id,
        lawyer_id: lawyer.id,
        submission_id: submission?.id || null,
        message: message.trim(),
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description:
          "Tu solicitud fue enviada. El equipo de Albus revisará tu caso y lo asignará en menos de 24 horas.",
      });
      setMessage("");
      // Refresh existing inquiry state
      setExistingInquiry({ id: "new", status: "pending", created_at: new Date().toISOString() });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: err?.message || "Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lawyer) return null;

  const statusInfo = existingInquiry
    ? STATUS_LABELS[existingInquiry.status] || STATUS_LABELS.pending
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Perfil del abogado</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex gap-4 items-start">
          <Avatar className="w-20 h-20">
            {lawyer.photo_url ? <AvatarImage src={lawyer.photo_url} alt={lawyer.full_name} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {getInitials(lawyer.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{lawyer.full_name}</h2>
            {lawyer.college && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>
                  {lawyer.college}
                  {lawyer.bar_number ? ` · Nº ${lawyer.bar_number}` : ""}
                </span>
              </div>
            )}
            {lawyer.city && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{lawyer.city}</span>
              </div>
            )}
            {lawyer.languages && lawyer.languages.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Languages className="w-3.5 h-3.5" />
                <span className="capitalize">{lawyer.languages.join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {lawyer.specialties && lawyer.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {lawyer.specialties.map((s) => (
              <Badge key={s} variant="secondary" className="capitalize">
                {s}
              </Badge>
            ))}
          </div>
        )}

        {lawyer.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{lawyer.bio}</p>
        )}

        {/* Services */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Servicios</h3>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay servicios publicados.</p>
          ) : (
            <div className="space-y-2">
              {services.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-3 flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {s.service_name && <p className="font-medium text-sm">{s.service_name}</p>}
                      {s.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      )}
                    </div>
                    {s.price !== null && (
                      <span className="font-semibold text-sm whitespace-nowrap">
                        {s.price}
                        {s.currency === "EUR" || !s.currency ? "€" : ` ${s.currency}`}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Inquiry section */}
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-semibold text-sm">Enviar consulta</h3>
          {existingInquiry && statusInfo ? (
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ya tienes una consulta activa con este abogado.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Textarea
                placeholder="Describe tu caso (mínimo 50 caracteres)…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={2000}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {message.trim().length < MIN_CHARS
                    ? `Faltan ${MIN_CHARS - message.trim().length} caracteres`
                    : "Listo para enviar"}
                </span>
                <span>{message.length}/2000</span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={message.trim().length < MIN_CHARS || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  "Enviar solicitud"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
