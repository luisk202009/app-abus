
# Plan: F02 - Simulador Fiscal de Salario Neto para Usuarios Regularizados

## Resumen

Crear un simulador de salario neto integrado en el dashboard, accesible para usuarios Pro y Premium. Incluye calculo de IRPF progresivo espanol, Seguridad Social, y desglose visual con barras de progreso. Los usuarios gratuitos veran un modal de upsell al intentar acceder.

---

## 1. Nuevo archivo: `src/components/dashboard/FiscalSimulator.tsx`

Componente principal del simulador con las siguientes secciones:

### Seccion informativa: "Tu nueva vida como contribuyente"
- Texto explicativo sobre el derecho a trabajar tras la admision a tramite (max 15 dias)
- Destacar la "Cuota Cero" para autonomos nuevos
- Icono `Info` con fondo `bg-muted`, texto `text-muted-foreground`

### Formulario de entrada
- **Salario Bruto Anual**: Input numerico con formato de euros
- **Situacion Familiar**: Select con opciones: Soltero/a, Casado/a, Con hijos (1), Con hijos (2+)
- **Comunidad Autonoma**: Select con las 17 comunidades (Madrid, Cataluna, Andalucia, etc.)

### Logica de calculo (todo client-side)

**Seguridad Social empleado**: 6.35% del bruto

**IRPF 2025/2026 tramos estatales:**

| Tramo | Tipo |
|-------|------|
| 0 - 12,450 EUR | 19% |
| 12,450 - 20,200 EUR | 24% |
| 20,200 - 35,200 EUR | 30% |
| 35,200 - 60,000 EUR | 37% |
| 60,000 - 300,000 EUR | 45% |
| 300,000+ EUR | 47% |

Nota: Estos tramos combinan estatal + autonomico medio. Para simplificar, se usa una tabla unica con ajustes minimos por comunidad (Madrid ligeramente menor, Cataluna ligeramente mayor).

**Deducciones por situacion familiar:**
- Soltero/a: minimo personal 5,550 EUR
- Casado/a: +3,400 EUR
- Con hijos: +2,400 por primer hijo, +2,700 por segundo

### Seccion de resultados
- **Sueldo Neto Mensual** (12 pagas y 14 pagas)
- **Desglose visual** con barras de progreso:
  - Barra "Salario Neto" (verde/gris oscuro)
  - Barra "Seguridad Social" (azul)
  - Barra "IRPF" (rojo/gris)
- Porcentajes y cantidades absolutas

### CTA Premium (solo para usuarios Pro)
Si `subscriptionStatus === "pro"`:
- Mostrar banner: "Necesitas ayuda con tu primera nomina o alta de autonomo? Mejora al Plan Premium para soporte legal directo."
- Boton "Mejorar a Premium" que abre `PremiumFeatureModal`

---

## 2. Nuevo archivo: `src/lib/fiscalCalculator.ts`

Modulo con la logica pura de calculo (sin UI):

```typescript
interface FiscalInput {
  grossSalary: number;
  familyStatus: "single" | "married" | "children_1" | "children_2plus";
  community: string;
}

interface FiscalResult {
  grossAnnual: number;
  socialSecurity: number;
  irpf: number;
  netAnnual: number;
  netMonthly12: number;
  netMonthly14: number;
  effectiveRate: number;
  breakdown: {
    label: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
}

export function calculateNetSalary(input: FiscalInput): FiscalResult;
```

Funciones auxiliares:
- `calculateIRPF(taxableBase: number, community: string): number`
- `getPersonalMinimum(familyStatus: string): number`
- `COMMUNITY_ADJUSTMENTS`: objeto con factor de ajuste por comunidad

---

## 3. Modificar: `src/components/dashboard/DashboardSidebar.tsx`

Agregar nuevo item de navegacion:

```typescript
{ id: "simulator", label: "Simulador Fiscal", icon: <Calculator className="w-5 h-5" /> }
```

Ubicarlo despues de "Recursos" y antes de "Perfil".

---

## 4. Modificar: `src/pages/Dashboard.tsx`

Agregar caso en `renderContent()`:

```typescript
case "simulator":
  if (!isPremium) {
    // Show premium gate modal
    return <PremiumGate />;
  }
  return <FiscalSimulator subscriptionStatus={subscriptionStatus} />;
```

Importar el componente `FiscalSimulator`.

Para usuarios gratuitos: mostrar el `PremiumFeatureModal` existente con `feature="el Simulador Fiscal"`.

---

## Archivos a Crear

| Archivo | Proposito |
|---------|-----------|
| `src/lib/fiscalCalculator.ts` | Logica pura de calculo IRPF y SS |
| `src/components/dashboard/FiscalSimulator.tsx` | Interfaz completa del simulador |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/DashboardSidebar.tsx` | Agregar nav item "Simulador Fiscal" con icono Calculator |
| `src/pages/Dashboard.tsx` | Agregar case "simulator" en renderContent, gate con premium check |

---

## Detalles Tecnicos

### Estetica B&W Albus

- Cards con `bg-background border border-border rounded-2xl`
- Barras de progreso usando el componente `Progress` existente de shadcn
- Colores de desglose: Neto en `bg-primary` (negro), SS en `bg-muted-foreground`, IRPF en `bg-muted`
- Resultados destacados con `text-3xl font-bold`

### Comunidades Autonomas (dropdown)

Lista simplificada con las 17 comunidades. Cada una tiene un factor de ajuste sobre el IRPF base:
- Madrid: -0.5% (tipo mas bajo)
- Cataluna/Valencia: +0.5%
- Resto: 0% (base)

### Responsive

- En mobile: formulario stacked, resultados debajo
- En desktop: formulario a la izquierda, resultados a la derecha (grid 2 columnas)

### Formato numeros

- Usar `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })` para mostrar cantidades
- Input con `type="number"` y step de 100

---

## Orden de Implementacion

1. `src/lib/fiscalCalculator.ts` - Logica de calculo
2. `src/components/dashboard/FiscalSimulator.tsx` - Interfaz completa
3. `src/components/dashboard/DashboardSidebar.tsx` - Nav item
4. `src/pages/Dashboard.tsx` - Routing y premium gate
