import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Info,
  TrendingUp,
  Crown,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import {
  calculateNetSalary,
  COMMUNITIES,
  FAMILY_OPTIONS,
  type FamilyStatus,
  type FiscalResult,
} from "@/lib/fiscalCalculator";

interface FiscalSimulatorProps {
  subscriptionStatus?: string;
  onUpgrade?: () => void;
}

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const FiscalSimulator = ({
  subscriptionStatus = "free",
  onUpgrade,
}: FiscalSimulatorProps) => {
  const [grossSalary, setGrossSalary] = useState<number>(25000);
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>("single");
  const [community, setCommunity] = useState("madrid");

  const result: FiscalResult = useMemo(
    () => calculateNetSalary({ grossSalary, familyStatus, community }),
    [grossSalary, familyStatus, community]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">
            Simulador Fiscal
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Calcula tu sueldo neto estimado tras impuestos y Seguridad Social en
          España.
        </p>
      </div>

      {/* Fiscal Onboarding Info */}
      <Card className="border-border bg-muted/30">
        <CardContent className="p-5">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Tu nueva vida como contribuyente en España
              </p>
              <p>
                Una vez que tu solicitud sea{" "}
                <span className="font-medium text-foreground">
                  admitida a trámite
                </span>{" "}
                (máximo 15 días), podrás comenzar a trabajar legalmente con tu
                resguardo.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Briefcase className="w-4 h-4" />
                <span>
                  <span className="font-medium text-foreground">
                    Cuota Cero:
                  </span>{" "}
                  Si te das de alta como autónomo/a, disfrutas de cuota 0€
                  durante los primeros 12 meses.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Form */}
        <Card className="border-border rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Datos de simulación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Gross Salary */}
            <div className="space-y-2">
              <Label htmlFor="gross">Salario Bruto Anual (€)</Label>
              <Input
                id="gross"
                type="number"
                min={0}
                step={500}
                value={grossSalary}
                onChange={(e) =>
                  setGrossSalary(Math.max(0, Number(e.target.value)))
                }
              />
            </div>

            {/* Family Status */}
            <div className="space-y-2">
              <Label>Situación Familiar</Label>
              <Select
                value={familyStatus}
                onValueChange={(v) => setFamilyStatus(v as FamilyStatus)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {FAMILY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Community */}
            <div className="space-y-2">
              <Label>Comunidad Autónoma</Label>
              <Select value={community} onValueChange={setCommunity}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-60">
                  {COMMUNITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Right: Results */}
        <Card className="border-border rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Resultado estimado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Net Monthly Highlight */}
            <div className="text-center space-y-1 py-2">
              <p className="text-sm text-muted-foreground">
                Sueldo Neto Mensual (12 pagas)
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {fmt.format(result.netMonthly12)}
              </p>
              <p className="text-xs text-muted-foreground">
                o {fmt.format(result.netMonthly14)} en 14 pagas
              </p>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-4">
              {result.breakdown.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">
                      {fmt.format(item.amount)}{" "}
                      <span className="text-muted-foreground text-xs">
                        ({item.percentage}%)
                      </span>
                    </span>
                  </div>
                  <Progress
                    value={item.percentage}
                    className={
                      item.label === "Salario Neto"
                        ? "h-3 [&>div]:bg-primary"
                        : item.label === "Seguridad Social"
                        ? "h-3 [&>div]:bg-muted-foreground/60"
                        : "h-3 [&>div]:bg-muted-foreground/30"
                    }
                  />
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bruto anual</span>
                <span className="font-medium">
                  {fmt.format(result.grossAnnual)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seguridad Social</span>
                <span>-{fmt.format(result.socialSecurity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IRPF</span>
                <span>-{fmt.format(result.irpf)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border pt-2">
                <span>Neto anual</span>
                <span>{fmt.format(result.netAnnual)}</span>
              </div>
              <div className="flex justify-center pt-1">
                <Badge variant="outline" className="text-xs">
                  Tipo efectivo: {result.effectiveRate}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Upsell for Pro users */}
      {subscriptionStatus === "pro" && (
        <Card className="border-border bg-muted/30 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-primary" />
                <p className="text-sm">
                  ¿Necesitas ayuda con tu primera nómina o alta de autónomo?{" "}
                  <span className="font-medium">
                    Mejora al Plan Premium para soporte legal directo.
                  </span>
                </p>
              </div>
              {onUpgrade && (
                <Button
                  size="sm"
                  className="gap-1 shrink-0"
                  onClick={onUpgrade}
                >
                  Mejorar a Premium
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        * Este simulador ofrece una estimación orientativa. Los cálculos reales
        pueden variar según deducciones adicionales, convenio colectivo y
        situación personal. Consulta con un asesor fiscal para información
        precisa.
      </p>
    </div>
  );
};
