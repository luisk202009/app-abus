import { useEffect } from "react";
import { useReferral } from "@/hooks/useReferral";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Users, Copy, Share2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReferralDashboardProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

export const ReferralDashboard = ({ isPremium, onUpgrade }: ReferralDashboardProps) => {
  const { code, referrals, totalInvited, totalEarned, isLoading, generateCode } = useReferral();
  const { toast } = useToast();

  useEffect(() => {
    if (isPremium && !code && !isLoading) {
      generateCode();
    }
  }, [isPremium, code, isLoading, generateCode]);

  if (!isPremium) {
    return (
      <div className="text-center py-16 space-y-4">
        <Gift className="w-12 h-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-semibold">Programa de Referidos</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Invita amigos y gana 5€ por cada uno. Disponible para usuarios Pro y Premium.
        </p>
        <Button onClick={onUpgrade}>Mejorar mi plan</Button>
      </div>
    );
  }

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast({ title: "¡Código copiado!", description: "Compártelo con tus amigos." });
    }
  };

  const shareMessage = `¡Hola! Estoy usando Albus para mi Regularización 2026. Si usas mi código ${code}, tendrás 5€ de descuento en tu plan Pro. Regístrate aquí: ${window.location.origin}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const maskName = (name: string | null) => {
    if (!name) return "Anónimo";
    if (name.length <= 2) return name[0] + "***";
    return name[0] + "***" + name[name.length - 1];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          Programa de Referidos
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comparte tu código y gana 5€ por cada amigo que se suscriba.
        </p>
      </div>

      {/* Code Card */}
      <Card className="border-amber-500/30 bg-amber-50/5">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Tu código de referido</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-mono font-bold tracking-[0.3em]">
              {code || "------"}
            </span>
            <Button variant="outline" size="icon" onClick={handleCopy} disabled={!code}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Sharing */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={shareWhatsApp}>
              <Share2 className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={shareTelegram}>
              Telegram
            </Button>
            <Button variant="outline" size="sm" onClick={shareFacebook}>
              Facebook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Amigos Invitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalInvited}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              Dinero Ganado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEarned}€</p>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de Referidos</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Comparte tu código para empezar a ganar recompensas 🎁
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{maskName(r.referred_name)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={r.status === "completado" ? "default" : "outline"}
                        className={r.status === "completado" ? "bg-green-600" : ""}
                      >
                        {r.status === "completado" ? "Completado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
