

# Plan: G01 - "My Life in Spain" Module (SSN & Digital Identity)

## Summary

Create a new "Vida en Espana" section in the dashboard for post-approval users. It includes an SSN request guide, digital identity tutorials, an employer info document generator (PDF), and a new "Identidad Permanente" document category in the vault. Gated for Pro/Premium users.

---

## 1. New file: `src/components/dashboard/LifeInSpainSection.tsx`

Main component with four sections:

### Section A: SSN Request Guide ("Numero de Afiliacion a la Seguridad Social")
- Step-by-step numbered list:
  1. Obtener cita previa en la Seguridad Social
  2. Rellenar Modelo TA.1
  3. Presentar pasaporte + TIE + certificado de empadronamiento
  4. Recibir numero de afiliacion
- External link button: "Descargar Modelo TA.1" -> official SS site
- Input field for user to save their SSN number (persisted to `user_appointments.lot_number` or a new field)
- Icons: `Briefcase` for SSN section

### Section B: Digital Identity Center
- Two info cards:
  1. **Certificado Digital FNMT**: Steps to request at fnmt.es, confirm at an office, install in browser. Link to `https://www.sede.fnmt.gob.es/`
  2. **Clave PIN**: How to register, verify identity, use for tax filings. Link to `https://clave.gob.es/`
- Info box explaining importance: "Con tu identidad digital podras firmar documentos, consultar tu situacion fiscal y acceder a servicios publicos online."
- Icons: `Shield` for identity section

### Section C: Employer Info Document Generator
- Button "Generar Documento para Empleador"
- Generates a B&W PDF using `jsPDF` (same pattern as `generateTasa790.ts`)
- Content:
  - Header: "INFORMACION PARA EL EMPLEADOR"
  - Subtitle: "Derecho al trabajo tras 15 dias de admision a tramite (Real Decreto 2026)"
  - Body: Legal text explaining that the employee has the right to work after 15 days, citing article references
  - User's name and application date pre-filled
  - Albus branding footer
- New file: `src/lib/generateEmployerInfo.ts`

### Section D: SSN Celebration
- When user enters their SSN number and saves, trigger a toast: "Felicidades! Ya estas listo para trabajar legalmente en Espana."
- Confetti with green/gold colors (reuse `SuccessConfetti` pattern)

---

## 2. New file: `src/lib/generateEmployerInfo.ts`

PDF generator following the same pattern as `generateTasa790.ts`:

```text
function generateEmployerInfoPDF(userData: { fullName: string; date?: string }): void
```

- Uses jsPDF (already installed)
- B&W Albus aesthetic: black header, clean typography
- One-page document with legal text about Real Decreto 2026

---

## 3. Modify: `src/lib/documentConfig.ts`

Add a new document category `identidad_permanente` to both route types:

```typescript
export type DocumentCategory = "identidad" | "residencia" | "antecedentes" | "identidad_permanente";
```

New category config for both `regularizacion2026` and `arraigos`:

```typescript
identidad_permanente: {
  title: "Identidad Permanente",
  icon: "shield-check",
  documents: [
    { type: "tie_fisica", name: "TIE (Tarjeta Fisica)", description: "Tarjeta de Identidad de Extranjero", required: false },
    { type: "resolucion_concedida", name: "Resolucion Concedida", description: "Resolucion oficial de concesion de residencia", required: false },
    { type: "numero_ss", name: "Numero de Seguridad Social", description: "Documento con tu numero de afiliacion", required: false },
  ],
}
```

---

## 4. Modify: `src/components/dashboard/DashboardSidebar.tsx`

Add new nav item after "Gestion de Cita":

```typescript
{ id: "life-in-spain", label: "Vida en Espana", icon: <Shield className="w-5 h-5" /> }
```

---

## 5. Modify: `src/pages/Dashboard.tsx`

Add new case in `renderContent()`:

```typescript
case "life-in-spain":
  if (!isPremium) {
    return <PremiumGate feature="Vida en Espana" icon={Shield} />;
  }
  return <LifeInSpainSection userId={user?.id} userName={userData.name} />;
```

Import `LifeInSpainSection` and `Shield` icon.

---

## 6. Modify: `src/hooks/useNotifications.tsx`

Add SSN celebration detection: query `user_appointments` for users who have a `lot_number` set recently (within 24h of `updated_at`), and push a notification:

```typescript
{ id: "ssn_added", type: "approval", message: "Felicidades! Ya estas listo para trabajar legalmente en Espana.", icon: "success" }
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/LifeInSpainSection.tsx` | Main module UI with SSN guide, digital identity, employer doc generator |
| `src/lib/generateEmployerInfo.ts` | PDF generator for employer info one-pager |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/documentConfig.ts` | Add `identidad_permanente` category type and config |
| `src/components/dashboard/DashboardSidebar.tsx` | Add "Vida en Espana" nav item |
| `src/pages/Dashboard.tsx` | Add case "life-in-spain" with premium gate |
| `src/hooks/useNotifications.tsx` | Add SSN celebration notification |

## No Database Migration Required

The SSN number can be stored using the existing `user_appointments.lot_number` field (repurposed) or saved client-side. No new tables needed.

---

## Technical Details

### Aesthetic

- Clean B&W with subtle accents for success states
- Cards: `bg-background border border-border rounded-2xl p-6`
- Info boxes: `bg-muted/50 border border-border rounded-xl p-4`
- Icons: `Shield` (identity), `Briefcase` (SSN), `FileText` (employer doc)
- Success states: Emerald/Gold accents consistent with TIE module

### Employer PDF Structure

```text
+------------------------------------------+
| [BLACK HEADER]                           |
| INFORMACION PARA EL EMPLEADOR           |
| Derecho al trabajo - Real Decreto 2026   |
+------------------------------------------+
| Nombre del trabajador: [fullName]        |
|                                          |
| Segun el Real Decreto de regularizacion  |
| extraordinaria 2026, el solicitante      |
| tiene derecho a trabajar una vez         |
| transcurridos 15 dias desde la admision  |
| a tramite de su solicitud...             |
|                                          |
| Marco legal:                             |
| - Art. X Real Decreto 2026              |
| - Resolucion de admision a tramite      |
|                                          |
| Fecha: [date]                            |
+------------------------------------------+
| Generado por Albus | albus.com.co        |
+------------------------------------------+
```

### External Links

- Modelo TA.1: `https://www.seg-social.es/`
- FNMT Certificado Digital: `https://www.sede.fnmt.gob.es/certificados`
- Clave PIN: `https://clave.gob.es/clave_Home/registro.html`
- Sede Electronica (TIE check): `https://sede.administracionespublicas.gob.es/`

### Document Vault Integration

The `identidad_permanente` category will appear automatically in the Document Vault since `DocumentVault.tsx` already iterates over all categories in `DOCUMENT_CATEGORIES[routeType]`. The tag "Documentos de Identidad Permanente" will be shown as the category title with a lock icon.

---

## Implementation Order

1. `src/lib/generateEmployerInfo.ts` - PDF generator
2. `src/lib/documentConfig.ts` - Add new document category
3. `src/components/dashboard/LifeInSpainSection.tsx` - Main module UI
4. `src/components/dashboard/DashboardSidebar.tsx` - Nav item
5. `src/pages/Dashboard.tsx` - Routing and premium gate
6. `src/hooks/useNotifications.tsx` - SSN celebration notification

