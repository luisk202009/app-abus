import { useState } from "react";
import { Mail, MessageCircle, Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const SupportModal = ({ isOpen, onClose, userEmail }: SupportModalProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState(userEmail || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending (in production, this would call an edge function)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Mensaje enviado",
      description: "Te responderemos a la brevedad posible.",
    });

    setMessage("");
    setIsSubmitting(false);
    onClose();
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/34600000000?text=Hola,%20tengo%20una%20consulta%20sobre%20Albus", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">¿Necesitas ayuda?</DialogTitle>
          <DialogDescription>
            Escríbenos y te responderemos lo antes posible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="support-email">Tu email</Label>
            <Input
              id="support-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-message">Mensaje</Label>
            <Textarea
              id="support-message"
              placeholder="Describe tu consulta o problema..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar mensaje
              </>
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O contáctanos por</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href="mailto:hola@albus.com"
            className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
