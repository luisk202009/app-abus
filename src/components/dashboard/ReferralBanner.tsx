import { useState } from "react";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralBannerProps {
  onNavigate: () => void;
}

export const ReferralBanner = ({ onNavigate }: ReferralBannerProps) => {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("albus_referral_banner_dismissed") === "true"
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem("albus_referral_banner_dismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="relative rounded-2xl border border-amber-500/30 bg-amber-50/5 p-4 flex items-center gap-3">
      <Gift className="w-5 h-5 text-amber-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Invita amigos y gana 5€ por cada uno</p>
        <p className="text-xs text-muted-foreground">Comparte tu código de referido</p>
      </div>
      <Button size="sm" variant="outline" className="flex-shrink-0 border-amber-500/30 text-amber-600 hover:bg-amber-50/10" onClick={onNavigate}>
        Ver mi código
      </Button>
      <button onClick={handleDismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
