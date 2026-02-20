

# Plan: F04 - Marketing Analytics & Business Intelligence Dashboard

## Summary

Add a new "Analytics" tab to the Admin Panel (`/admin`) with a full BI dashboard. This includes a conversion funnel visualization, nationality insights, partner efficiency metrics, revenue growth chart, and CSV export. All charts use Recharts (already installed) with the Albus B&W aesthetic.

---

## 1. New file: `src/components/admin/AdminAnalyticsTab.tsx`

The main analytics dashboard component, containing five sections:

### Section A: Conversion Funnel (Recharts FunnelChart or custom horizontal bars)

Since Recharts doesn't have a native funnel, use horizontal `BarChart` with decreasing widths to simulate a funnel:

- **Total Leads**: Count of all `onboarding_submissions`
- **Registered Users**: Count where `user_id IS NOT NULL`
- **Pro Conversions**: Count where `subscription_status = 'pro'` (x 9.99 EUR)
- **Premium Conversions**: Count where `subscription_status = 'premium'` (x 19.99 EUR)

Each bar shows count + conversion rate vs previous step.

### Section B: Nationality Insights

- **Bar chart**: Top 10 countries by user count (horizontal `BarChart`)
- **Table below**: "Pais", "Leads Generados", "Ventas Totales (EUR)", "Conversion Rate (%)"
  - Calculated from `onboarding_submissions.nationality` grouped, cross-referenced with `subscription_status`

### Section C: Partner Efficiency Metrics

- Fetch all `partners`, `partner_assignments`, and `user_documents` to calculate:
  - **Average review time**: Difference between `user_documents.created_at` and `updated_at` where status changed from `waiting`/`analyzing` to `valid`/`error`, for assigned users
  - **"Aprobada" count**: Count of assignments with `case_status = 'aprobada'` per partner
  - **User satisfaction**: Mockup section with placeholder stars/ratings (no real data yet)
- Display as a table: Partner Name | Docs Reviewed | Avg Review Time | Aprobadas | Satisfaction

### Section D: Revenue & Growth Chart

- **Line chart** (`LineChart` from Recharts): Revenue over time
  - Group `onboarding_submissions` by `created_at` (daily/weekly toggle)
  - Calculate cumulative revenue: pro users x 9.99 + premium users x 19.99
- **Lead Pipeline metric**: Card showing "If 10% of free leads upgrade to Pro: +X EUR/mo potential"

### Section E: CSV Export

- "Exportar CSV" button on the users table
- Generate CSV from `onboarding_submissions` data: Name, Email, Nationality, Plan, Route, Date
- Trigger browser download

---

## 2. Modify: `src/pages/Admin.tsx`

- Add new tab "Analytics" with `BarChart3` icon from lucide
- Import and render `AdminAnalyticsTab` in a new `TabsContent`
- Position as first tab (default) for quick access

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/AdminAnalyticsTab.tsx` | Full BI dashboard with funnel, charts, tables, CSV export |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Add "Analytics" tab |

---

## Technical Details

### Data Fetching Strategy

All data comes from existing tables - no new migrations needed:
- `onboarding_submissions`: leads, users, nationality, subscription_status, created_at
- `partner_assignments`: case_status, assigned_at
- `partners`: team_name
- `user_documents`: status, created_at, updated_at (for review time calc)
- `user_appointments`: application_status (for aprobada count)

### Recharts Components Used

- `BarChart` + `Bar` + `XAxis` + `YAxis` for funnel and nationality
- `LineChart` + `Line` for revenue growth
- `Tooltip`, `ResponsiveContainer` for interactivity
- B&W palette: `fill="#1a1a1a"` primary, `fill="#6b7280"` secondary, `fill="#d1d5db"` tertiary

### CSV Export Logic

```typescript
const exportCSV = (users: UserSubmission[]) => {
  const headers = "Nombre,Email,Pais,Plan,Ruta,Fecha\n";
  const rows = users.map(u => 
    `"${u.full_name || ''}","${u.email || ''}","${u.nationality || ''}","${u.subscription_status || 'free'}","${u.routeName || ''}","${u.created_at}"`
  ).join("\n");
  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `albus-users-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};
```

### Funnel Conversion Rate

```typescript
const funnelSteps = [
  { label: "Total Leads", value: totalLeads },
  { label: "Registrados", value: registeredUsers },
  { label: "Pro", value: proUsers },
  { label: "Premium", value: premiumUsers },
];
// Rate: (step.value / previousStep.value * 100).toFixed(1) + "%"
```

### Partner Review Time Calculation

```typescript
// For each user_document belonging to an assigned user:
// reviewTime = updated_at - created_at (in hours)
// Filter only docs where status is 'valid' or 'error' (reviewed)
// Average across all docs for each partner
```

---

## Implementation Order

1. `src/components/admin/AdminAnalyticsTab.tsx` - Full analytics dashboard
2. `src/pages/Admin.tsx` - Add tab

