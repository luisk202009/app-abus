// Spanish Net Salary Calculator — IRPF 2025/2026 + Social Security

export type FamilyStatus = "single" | "married" | "children_1" | "children_2plus";

export interface FiscalInput {
  grossSalary: number;
  familyStatus: FamilyStatus;
  community: string;
}

export interface BreakdownItem {
  label: string;
  amount: number;
  percentage: number;
}

export interface FiscalResult {
  grossAnnual: number;
  socialSecurity: number;
  irpf: number;
  netAnnual: number;
  netMonthly12: number;
  netMonthly14: number;
  effectiveRate: number;
  breakdown: BreakdownItem[];
}

// IRPF progressive brackets (combined state + average autonomous)
const IRPF_BRACKETS = [
  { limit: 12_450, rate: 0.19 },
  { limit: 20_200, rate: 0.24 },
  { limit: 35_200, rate: 0.30 },
  { limit: 60_000, rate: 0.37 },
  { limit: 300_000, rate: 0.45 },
  { limit: Infinity, rate: 0.47 },
];

// Community adjustment on the effective rate (percentage points)
const COMMUNITY_ADJUSTMENTS: Record<string, number> = {
  madrid: -0.005,
  cataluna: 0.005,
  valencia: 0.005,
  andalucia: 0,
  aragon: 0,
  asturias: 0.003,
  baleares: 0.002,
  canarias: -0.002,
  cantabria: 0,
  castilla_leon: 0,
  castilla_mancha: 0,
  extremadura: 0.003,
  galicia: 0,
  murcia: 0,
  navarra: 0,
  pais_vasco: -0.003,
  la_rioja: 0,
};

function getPersonalMinimum(familyStatus: FamilyStatus): number {
  const base = 5_550;
  switch (familyStatus) {
    case "married":
      return base + 3_400;
    case "children_1":
      return base + 2_400;
    case "children_2plus":
      return base + 2_400 + 2_700;
    default:
      return base;
  }
}

function calculateProgressiveIRPF(taxableBase: number): number {
  if (taxableBase <= 0) return 0;
  let remaining = taxableBase;
  let tax = 0;
  let prevLimit = 0;

  for (const bracket of IRPF_BRACKETS) {
    const bracketSize = bracket.limit - prevLimit;
    const taxable = Math.min(remaining, bracketSize);
    tax += taxable * bracket.rate;
    remaining -= taxable;
    prevLimit = bracket.limit;
    if (remaining <= 0) break;
  }

  return tax;
}

export function calculateNetSalary(input: FiscalInput): FiscalResult {
  const { grossSalary, familyStatus, community } = input;

  // 1. Social Security (employee contribution ~6.35%)
  const socialSecurity = grossSalary * 0.0635;

  // 2. Taxable base = gross - SS - personal minimum
  const personalMinimum = getPersonalMinimum(familyStatus);
  const taxableBase = Math.max(0, grossSalary - socialSecurity - personalMinimum);

  // 3. IRPF
  let irpf = calculateProgressiveIRPF(taxableBase);

  // 4. Community adjustment
  const adjustment = COMMUNITY_ADJUSTMENTS[community] ?? 0;
  irpf = Math.max(0, irpf + grossSalary * adjustment);

  // 5. Net
  const netAnnual = grossSalary - socialSecurity - irpf;
  const effectiveRate = grossSalary > 0 ? irpf / grossSalary : 0;

  return {
    grossAnnual: grossSalary,
    socialSecurity: Math.round(socialSecurity * 100) / 100,
    irpf: Math.round(irpf * 100) / 100,
    netAnnual: Math.round(netAnnual * 100) / 100,
    netMonthly12: Math.round((netAnnual / 12) * 100) / 100,
    netMonthly14: Math.round((netAnnual / 14) * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 10000) / 100, // e.g. 15.23
    breakdown: [
      {
        label: "Salario Neto",
        amount: Math.round(netAnnual * 100) / 100,
        percentage: grossSalary > 0 ? Math.round((netAnnual / grossSalary) * 10000) / 100 : 0,
      },
      {
        label: "Seguridad Social",
        amount: Math.round(socialSecurity * 100) / 100,
        percentage: grossSalary > 0 ? Math.round((socialSecurity / grossSalary) * 10000) / 100 : 0,
      },
      {
        label: "IRPF",
        amount: Math.round(irpf * 100) / 100,
        percentage: grossSalary > 0 ? Math.round((irpf / grossSalary) * 10000) / 100 : 0,
      },
    ],
  };
}

export const COMMUNITIES = [
  { value: "madrid", label: "Madrid" },
  { value: "cataluna", label: "Cataluña" },
  { value: "andalucia", label: "Andalucía" },
  { value: "valencia", label: "Comunidad Valenciana" },
  { value: "pais_vasco", label: "País Vasco" },
  { value: "galicia", label: "Galicia" },
  { value: "castilla_leon", label: "Castilla y León" },
  { value: "castilla_mancha", label: "Castilla-La Mancha" },
  { value: "canarias", label: "Canarias" },
  { value: "aragon", label: "Aragón" },
  { value: "murcia", label: "Región de Murcia" },
  { value: "baleares", label: "Islas Baleares" },
  { value: "extremadura", label: "Extremadura" },
  { value: "asturias", label: "Asturias" },
  { value: "navarra", label: "Navarra" },
  { value: "cantabria", label: "Cantabria" },
  { value: "la_rioja", label: "La Rioja" },
];

export const FAMILY_OPTIONS = [
  { value: "single" as FamilyStatus, label: "Soltero/a" },
  { value: "married" as FamilyStatus, label: "Casado/a" },
  { value: "children_1" as FamilyStatus, label: "Con 1 hijo/a" },
  { value: "children_2plus" as FamilyStatus, label: "Con 2+ hijos/as" },
];
