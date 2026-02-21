import { useState, useEffect } from "react";
import { Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface PricingSectionProps {
  onStartFree?: () => void;
}

interface PlanData {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  interval: string;
  features: string[];
  is_active: boolean;
  stripe_price_id: string | null;
}

export const PricingSection = ({ onStartFree }: PricingSectionProps) => {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("plans")
        .select("id, name, slug, price_cents, currency, interval, features, is_active, stripe_price_id")
        .eq("is_active", true)
        .order("price_cents", { ascending: true });

      setPlans(
        (data || []).map((p) => ({
          ...p,
          features: Array.isArray(p.features) ? (p.features as string[]) : [],
        }))
      );
      setIsLoading(false);
    };
    fetchPlans();
  }, []);

  if (isLoading) {
    return (
      <section id="precios" className="py-24 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Precios simples y transparentes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Empieza gratis y actualiza cuando necesites más funcionalidades.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="precios" className="py-24 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Precios simples y transparentes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Empieza gratis y actualiza cuando necesites más funcionalidades.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = plan.slug === "pro";
            const isPremium = plan.slug === "premium";
            const priceStr = plan.price_cents === 0
              ? "0€"
              : `${(plan.price_cents / 100).toFixed(2).replace(".", ",")}€`;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 animate-fade-up ${
                  isPopular
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-background text-foreground text-xs font-semibold rounded-full border border-border shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {isPremium && <Crown className="w-4 h-4 text-primary" />}
                  </div>
                  <p className={`text-sm ${isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.slug === "free" ? "Perfecto para empezar" : isPopular ? "Para quienes van en serio" : "Acompañamiento completo"}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{priceStr}</span>
                  <span className={isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}>/{plan.interval === "month" ? "mes" : plan.interval}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${isPopular ? "" : "text-primary"}`} />
                      <span>{String(feature)}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? "secondary" : plan.slug === "free" ? "outline" : "default"}
                  className={`w-full ${isPopular ? "bg-background text-foreground hover:bg-background/90" : ""}`}
                  onClick={onStartFree}
                >
                  {plan.slug === "free" ? "Empezar gratis" : `Empezar con ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
