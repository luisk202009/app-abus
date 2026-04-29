import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw, X, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PendingPayment {
  id: string;
  plan_type: string;
  route_template: string | null;
  price_id: string;
  status: string;
  email: string;
  error_message: string | null;
}

/**
 * Banner mostrado en el Dashboard cuando el usuario tiene un pago de
 * Regularización pendiente o fallido. Permite reintentar o cancelar.
 */
export const PendingPaymentAlert = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const paymentError = searchParams.get("payment_error") === "1";

  const fetchPending = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("pending_payments")
      .select("id, plan_type, route_template, price_id, status, email, error_message")
      .eq("user_id", user.id)
      .in("status", ["pending", "failed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Error cargando pending_payments:", error);
      return;
    }
    setPending(data as PendingPayment | null);
  }, [user]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Realtime: si Stripe webhook completa el pago, ocultar el banner
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`pending_payments_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pending_payments",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchPending()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPending]);

  const handleRetry = async () => {
    if (!pending || !user) return;
    setIsRetrying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sesión expirada");

      const response = await fetch(
        "https://uidwcgxbybjpbteowrnh.supabase.co/functions/v1/create-one-time-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            priceId: pending.price_id,
            email: pending.email || user.email,
            name: user.user_metadata?.full_name || user.email,
            routeTemplateSlug: pending.route_template ?? "regularizacion-2026",
            planType: pending.plan_type,
            pendingPaymentId: pending.id,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Error al reintentar");
      if (data.url) {
        window.open(data.url, "_blank");
        toast({
          title: "Checkout reabierto",
          description: "Hemos abierto Stripe en una nueva pestaña.",
        });
      }
    } catch (error: any) {
      console.error("Retry error:", error);
      toast({
        title: "No se pudo reintentar",
        description: error.message || "Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancel = async () => {
    if (!pending) return;
    const { error } = await supabase
      .from("pending_payments")
      .update({ status: "cancelled" })
      .eq("id", pending.id);
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar.",
        variant: "destructive",
      });
      return;
    }
    setPending(null);
    // Limpiar query params
    const next = new URLSearchParams(searchParams);
    next.delete("pending_payment");
    next.delete("payment_error");
    setSearchParams(next, { replace: true });
  };

  if (!pending) return null;

  const planLabel =
    pending.plan_type === "premium" ? "Premium" : pending.plan_type === "pro" ? "Pro" : pending.plan_type;

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-2 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              {paymentError || pending.status === "failed"
                ? "Tu pago no se completó"
                : "Pago pendiente"}
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Completa el checkout para activar tu plan{" "}
              <span className="font-medium">Regularización {planLabel}</span> y desbloquear
              tu hoja de ruta.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => handleRetry()}
            disabled={isRetrying}
            className="bg-amber-700 hover:bg-amber-800 text-white"
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Abriendo...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar pago
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCancel()}
            className="text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
