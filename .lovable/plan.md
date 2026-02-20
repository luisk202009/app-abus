

# Plan: G02 - Business Onboarding: From Immigrant to Freelancer

## Summary

Create a new "Negocios" section in the dashboard for Pro/Premium users. It includes a freelance roadmap, autonomo fee calculator, tax obligations summary, Cuota Cero guide, and a premium upsell banner for managed alta services.

---

## 1. New file: `src/components/dashboard/BusinessOnboardingSection.tsx`

Main component with five sections:

### Section A: Freelance Roadmap
Visual 3-step vertical timeline with completion tracking:
1. **Certificado Digital** - Link to G01's digital identity section. Icon: `Shield`. Description: "Solicita tu certificado en la FNMT."
2. **Alta en Hacienda (Censo de Empresarios)** - Instructions for Modelo 036/037. Icon: `Building2`. External link to AEAT sede electronica.
3. **Alta en el RETA (Seguridad Social)** - Instructions for registration via sede electronica SS. Icon: `Briefcase`. External link.

Each step: title, description, external link button, completion checkbox (local state).

### Section B: Cuota Cero Guide
Info card explaining Tarifa Plana and Cuota Cero benefits:
- **Tarifa Plana nacional**: 80 EUR/month first 12 months (all of Spain).
- **Cuota Cero regional**: Table of communities offering 100% discount (Madrid, Andalucia, Murcia, Valencia, Baleares, Canarias, La Rioja, Extremadura, Castilla-La Mancha, Aragon).
- Duration: 12 or 24 months depending on community.
- Display as a compact table: Comunidad | Duracion | Beneficio.

### Section C: Autonomo Fee Calculator
Small calculator:
- **Input**: "Ingresos netos mensuales estimados" (number input, slider optional).
- **Output**: Based on 2026 real income brackets (cotizacion por ingresos reales):
  - Bracket lookup -> monthly quota.
  - Show "Cuota de autonomo estimada: X EUR/mes".
  - Show "Con Tarifa Plana: 80 EUR/mes (primeros 12 meses)".
  - Show "Con Cuota Cero: 0 EUR/mes (si tu comunidad lo ofrece)".
- Brackets (2026 real income system, simplified):
  - <= 670 EUR: 230 EUR
  - 670-900: 260 EUR
  - 900-1,166: 275 EUR
  - 1,166-1,300: 291 EUR
  - 1,300-1,500: 294 EUR
  - 1,500-1,700: 294 EUR
  - 1,700-1,850: 310 EUR
  - 1,850-2,030: 315 EUR
  - 2,030-2,330: 320 EUR
  - 2,330-2,760: 330 EUR
  - 2,760-3,190: 350 EUR
  - 3,190-3,620: 370 EUR
  - > 3,620: 390 EUR

### Section D: Tax Obligations Summary
Clean table with three rows:
| Obligacion | Modelo | Frecuencia | Descripcion |
|---|---|---|---|
| IVA (21%) | Modelo 303 | Trimestral | Declaracion de IVA repercutido menos soportado |
| IRPF (Pagos a cuenta) | Modelo 130 | Trimestral | Pago fraccionado del 20% del rendimiento neto |
| Declaracion Anual | Modelo 100 (Renta) | Anual (Abril-Junio) | Declaracion de la Renta completa |

Additional row for Modelo 390 (resumen anual IVA) as supplementary info.

### Section E: Premium Upsell Banner
Card with gold accent border:
- Text: "Prefieres que nosotros hagamos el alta por ti? Nuestro equipo legal gestiona tu alta en Hacienda y Seguridad Social en 24h."
- Button: "Contratar Alta de Autonomo (Servicio Premium)" -> triggers `onUpgrade` callback.
- Icon: `Crown` with gold/amber accent.

---

## 2. Modify: `src/components/dashboard/DashboardSidebar.tsx`

Add new nav item after "Vida en Espana":
```typescript
{ id: "business", label: "Negocios", icon: <TrendingUp className="w-5 h-5" /> }
```

Import `TrendingUp` from lucide-react.

---

## 3. Modify: `src/pages/Dashboard.tsx`

Add new case in `renderContent()`:
```typescript
case "business":
  if (!isPremium) {
    return <PremiumGate feature="Negocios" icon={TrendingUp} />;
  }
  return <BusinessOnboardingSection onUpgrade={handleCheckout} />;
```

Import `BusinessOnboardingSection` and `TrendingUp`.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/BusinessOnboardingSection.tsx` | Full business onboarding module |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/DashboardSidebar.tsx` | Add "Negocios" nav item |
| `src/pages/Dashboard.tsx` | Add case "business" with premium gate |

## No Database Migration Required

All data is static reference content. Calculator uses client-side logic only.

---

## Technical Details

### Autonomo Fee Brackets (2026 cotizacion por ingresos reales)

```typescript
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
  const bracket = AUTONOMO_BRACKETS.find(b => monthlyIncome <= b.maxIncome);
  return bracket?.quota ?? 390;
}
```

### Cuota Cero Regions Data

```typescript
const CUOTA_CERO_REGIONS = [
  { name: "Madrid", months: 24 },
  { name: "Andalucia", months: 12 },
  { name: "Murcia", months: 24 },
  { name: "Com. Valenciana", months: 12 },
  { name: "Baleares", months: 12 },
  { name: "Canarias", months: 12 },
  { name: "La Rioja", months: 12 },
  { name: "Extremadura", months: 12 },
  { name: "Castilla-La Mancha", months: 24 },
  { name: "Aragon", months: 12 },
];
```

### Aesthetic
- Same B&W Albus style as FiscalSimulator
- Cards: `rounded-2xl border border-border`
- Gold accent for upsell: `border-amber-500/30 bg-amber-50/5`
- Icons: `TrendingUp` (header), `Shield` (cert digital), `Building2` (Hacienda), `Briefcase` (RETA), `Crown` (upsell)
- Roadmap timeline: vertical line with numbered circles, similar to LifeInSpainSection steps

### External Links
- AEAT Modelo 036: `https://sede.agenciatributaria.gob.es/`
- Seguridad Social RETA: `https://www.seg-social.es/`
- FNMT: already linked from G01

---

## Implementation Order

1. `src/components/dashboard/BusinessOnboardingSection.tsx` - Full module
2. `src/components/dashboard/DashboardSidebar.tsx` - Nav item
3. `src/pages/Dashboard.tsx` - Routing and premium gate

