import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    priceId: string;
    isSubscription?: boolean;
  };
  routeType: string;
  routeTemplateSlug: string;
}

export const RegistrationModal = ({
  isOpen,
  onClose,
  plan,
  routeType,
  routeTemplateSlug,
}: RegistrationModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa tu nombre y email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store registration data in localStorage for post-payment processing
      localStorage.setItem("pending_registration", JSON.stringify({
        name,
        email,
        planId: plan.id,
        planType: plan.id,
        routeType,
        routeTemplateSlug,
      }));

      // Call edge function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-one-time-payment", {
        body: {
          priceId: plan.priceId,
          email,
          name,
          routeTemplateSlug,
          planType: plan.id,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió URL de pago");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error al procesar pago",
        description: error.message || "Por favor intenta de nuevo.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Crear tu cuenta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Para continuar con el <span className="font-medium text-foreground">{plan.name}</span> ({plan.price}€{plan.isSubscription ? "/mes" : ""})
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : plan.isSubscription ? (
              `Suscribirse por ${plan.price}€/mes`
            ) : (
              `Pagar ${plan.price}€ y empezar`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Al continuar aceptas nuestros{" "}
            <a href="/terminos" className="underline hover:text-foreground">
              términos de servicio
            </a>{" "}
            y{" "}
            <a href="/privacidad" className="underline hover:text-foreground">
              política de privacidad
            </a>
            .
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
