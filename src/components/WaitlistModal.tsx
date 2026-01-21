import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell } from "lucide-react";
import { CountryFlag } from "@/components/CountryFlag";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: {
    id: string;
    name: string;
    code: string;
  };
}

export const WaitlistModal = ({ isOpen, onClose, country }: WaitlistModalProps) => {
  const [email, setEmail] = useState("");
  const [acceptsUpdates, setAcceptsUpdates] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Por favor, introduce tu email.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("waitlist")
        .insert({
          email,
          country: country.id,
          accepts_updates: acceptsUpdates,
        });

      if (error) throw error;

      toast({
        title: "¡Te has unido a la lista!",
        description: `Te avisaremos cuando ${country.name} esté disponible.`,
      });
      
      onClose();
      setEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar. Intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <CountryFlag code={country.code} size="md" />
            Próximamente: {country.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground mb-6">
            Estamos preparando la mejor ruta migratoria para {country.name}. 
            Únete a la lista de espera y sé el primero en acceder.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="waitlist-email">Email</Label>
              <Input
                id="waitlist-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="accepts-updates"
                checked={acceptsUpdates}
                onCheckedChange={(checked) => setAcceptsUpdates(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="accepts-updates" className="text-sm text-muted-foreground cursor-pointer">
                Acepto recibir actualizaciones sobre {country.name}
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Unirme a la lista de espera
                </>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
