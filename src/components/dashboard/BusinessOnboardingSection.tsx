import { useState } from "react";
import {
  TrendingUp,
  Shield,
  Building2,
  Briefcase,
  Crown,
  ExternalLink,
  CheckCircle2,
  Circle,
  Receipt,
  Info,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";

// --- Data ---

const AUTONOMO_BRACKETS = [
  { maxIncome: 670, quota: 230 },
  { maxIncome: 900, quota: 260 },
  { maxIncome: 1166, quota: 275 },
  { maxIncome: 1300, quota: 291 },
  { maxIncome: 1500, quota: 294 },
  { maxIncome: 1700, quota: 294 },
  { maxIncome: 1850, quota: 310 },
  { maxIncome: 2030, quota: 315 },
  { maxIncome: 2330, quota: 320 },
  { maxIncome: 2760, quota: 330 },
  { maxIncome: 3190, quota: 350 },
  { maxIncome: 3620, quota: 370 },
  { maxIncome: Infinity, quota: 390 },
];

function getAutonomoQuota(monthlyIncome: number): number {
  const bracket = AUTONOMO_BRACKETS.find((b) => monthlyIncome <= b.maxIncome);
  return bracket?.quota ?? 390;
}

const CUOTA_CERO_REGIONS = [
  { name: "Madrid", months: 24 },
  { name: "Andalucía", months: 12 },
  { name: "Murcia", months: 24 },
  { name: "Com. Valenciana", months: 12 },
  { name: "Baleares", months: 12 },
  { name: "Canarias", months: 12 },
  { name: "La Rioja", months: 12 },
  { name: "Extremadura", months: 12 },
  { name: "Castilla-La Mancha", months: 24 },
  { name: "Aragón", months: 12 },
];

const ROADMAP_STEPS = [
  {
    title: "Certificado Digital",
    description:
      "Solicita tu certificado digital en la FNMT. Es imprescindible para cualquier trámite telemático con Hacienda y la Seguridad Social.",
    icon: Shield,
    link: "https://www.sede.fnmt.gob.es/certificados",
    linkLabel: "Ir a FNMT",
  },
  {
    title: "Alta en Hacienda (Censo de Empresarios)",
    description:
      "Date de alta en el Censo de Empresarios mediante el Modelo 036 o 037 (simplificado). Elige tu epígrafe del IAE y tu régimen de IVA.",
    icon: Building2,
    link: "https://sede.agenciatributaria.gob.es/",
    linkLabel: "Ir a la AEAT",
  },
  {
    title: "Alta en el RETA (Seguridad Social)",
    description:
      "Regístrate como trabajador autónomo en el Régimen Especial de Trabajadores Autónomos. Puedes hacerlo online con tu certificado digital.",
    icon: Briefcase,
    link: "https://www.seg-social.es/",
    linkLabel: "Ir a la Seguridad Social",
  },
];

const TAX_OBLIGATIONS = [
  {
    obligation: "IVA (21%)",
    modelo: "Modelo 303",
    frequency: "Trimestral",
    description: "Declaración de IVA repercutido menos soportado",
  },
  {
    obligation: "IRPF (Pagos a cuenta)",
    modelo: "Modelo 130",
    frequency: "Trimestral",
    description: "Pago fraccionado del 20% del rendimiento neto",
  },
  {
    obligation: "Declaración Anual",
    modelo: "Modelo 100 (Renta)",
    frequency: "Anual (Abr-Jun)",
    description: "Declaración de la Renta completa",
  },
  {
    obligation: "Resumen Anual IVA",
    modelo: "Modelo 390",
    frequency: "Anual (Enero)",
    description: "Resumen informativo anual de operaciones de IVA",
  },
];

// --- Component ---

interface BusinessOnboardingSectionProps {
  onUpgrade?: () => void;
}

export const BusinessOnboardingSection = ({
  onUpgrade,
}: BusinessOnboardingSectionProps) => {
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [monthlyIncome, setMonthlyIncome] = useState(1500);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const quota = getAutonomoQuota(monthlyIncome);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Negocios</h2>
            <p className="text-sm text-muted-foreground">
              De inmigrante a autónomo: tu guía paso a paso
            </p>
          </div>
        </div>
      </div>

      {/* Section A: Freelance Roadmap */}
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Hoja de Ruta del Autónomo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="relative">
            {ROADMAP_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = completedSteps[i];
              return (
                <div key={i} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Timeline line */}
                  {i < ROADMAP_STEPS.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border" />
                  )}
                  {/* Circle / Check */}
                  <button
                    onClick={() => toggleStep(i)}
                    className="relative z-10 mt-0.5 flex-shrink-0"
                  >
                    {done ? (
                      <CheckCircle2 className="w-10 h-10 text-primary fill-primary/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-border bg-background flex items-center justify-center text-sm font-semibold text-muted-foreground">
                        {i + 1}
                      </div>
                    )}
                  </button>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <h4
                        className={`font-semibold text-sm ${done ? "line-through text-muted-foreground" : ""}`}
                      >
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-1.5">
                        {step.linkLabel}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section B: Cuota Cero Guide */}
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Tarifa Plana y Cuota Cero
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">
                    Tarifa Plana nacional:
                  </strong>{" "}
                  80 €/mes durante los primeros 12 meses. Aplica en toda España
                  para nuevos autónomos.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">
              Comunidades con Cuota Cero (0 €/mes)
            </h4>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Comunidad</TableHead>
                    <TableHead className="text-xs text-right">
                      Duración
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Beneficio
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CUOTA_CERO_REGIONS.map((region) => (
                    <TableRow key={region.name}>
                      <TableCell className="text-sm font-medium">
                        {region.name}
                      </TableCell>
                      <TableCell className="text-sm text-right text-muted-foreground">
                        {region.months} meses
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="text-xs text-emerald-600 border-emerald-200"
                        >
                          100% bonificación
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section C: Autonomo Fee Calculator */}
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Calculadora de Cuota de Autónomo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Ingresos netos mensuales estimados
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[monthlyIncome]}
                onValueChange={(v) => setMonthlyIncome(v[0])}
                min={300}
                max={5000}
                step={50}
                className="flex-1"
              />
              <div className="w-24">
                <Input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) =>
                    setMonthlyIncome(Number(e.target.value) || 300)
                  }
                  min={300}
                  max={10000}
                  className="text-right text-sm"
                />
              </div>
              <span className="text-sm text-muted-foreground">€/mes</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Cuota estimada
              </p>
              <p className="text-2xl font-bold">{quota} €</p>
              <p className="text-xs text-muted-foreground">/mes</p>
            </div>
            <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Con Tarifa Plana
              </p>
              <p className="text-2xl font-bold text-primary">80 €</p>
              <p className="text-xs text-muted-foreground">
                primeros 12 meses
              </p>
            </div>
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Con Cuota Cero
              </p>
              <p className="text-2xl font-bold text-emerald-600">0 €</p>
              <p className="text-xs text-muted-foreground">
                si tu comunidad lo ofrece
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section D: Tax Obligations */}
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Obligaciones Fiscales del Autónomo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Obligación</TableHead>
                  <TableHead className="text-xs">Modelo</TableHead>
                  <TableHead className="text-xs">Frecuencia</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Descripción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TAX_OBLIGATIONS.map((tax) => (
                  <TableRow key={tax.modelo}>
                    <TableCell className="text-sm font-medium">
                      {tax.obligation}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {tax.modelo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tax.frequency}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                      {tax.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section E: Premium Upsell */}
      <Card className="rounded-2xl border border-amber-500/30 bg-amber-50/5 dark:bg-amber-950/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1">
                ¿Prefieres que nosotros hagamos el alta por ti?
              </h3>
              <p className="text-sm text-muted-foreground">
                Nuestro equipo legal gestiona tu alta en Hacienda y Seguridad
                Social en 24h. Sin complicaciones.
              </p>
            </div>
            <Button
              onClick={onUpgrade}
              className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0 gap-2"
            >
              <Crown className="w-4 h-4" />
              Contratar Alta de Autónomo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
