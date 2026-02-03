import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  plan: {
    id: "pro" | "premium";
    name: string;
    price: number;
    features: string[];
    highlighted?: boolean;
    badge?: string;
    isSubscription?: boolean;
  };
  onSelect: () => void;
}

export const PricingCard = ({ plan, onSelect }: PricingCardProps) => {
  const isHighlighted = plan.highlighted;

  return (
    <div
      className={cn(
        "relative rounded-xl border p-6 transition-all",
        isHighlighted
          ? "border-primary bg-primary text-primary-foreground shadow-lg"
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-xs font-medium bg-amber-400 text-amber-950 rounded-full">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className={cn(
            "text-lg font-semibold",
            isHighlighted ? "text-primary-foreground" : "text-foreground"
          )}>
            {plan.name}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-3xl font-bold",
              isHighlighted ? "text-primary-foreground" : "text-foreground"
            )}>
              {plan.price}€
            </span>
            <span className={cn(
              "text-sm",
              isHighlighted ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {plan.isSubscription ? "/mes" : "pago único"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className={cn(
          "h-px",
          isHighlighted ? "bg-primary-foreground/20" : "bg-border"
        )} />

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className={cn(
                "w-4 h-4 mt-0.5 shrink-0",
                isHighlighted ? "text-primary-foreground" : "text-primary"
              )} />
              <span className={cn(
                "text-sm",
                isHighlighted ? "text-primary-foreground/90" : "text-muted-foreground"
              )}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          onClick={onSelect}
          className={cn(
            "w-full",
            isHighlighted
              ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Elegir {plan.name.split(" ")[1]}
        </Button>
      </div>
    </div>
  );
};
