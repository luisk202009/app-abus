import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, TrendingUp, Users, Globe, Briefcase, DollarSign, Star, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────
interface Submission {
  id: string;
  full_name: string | null;
  email: string | null;
  nationality: string | null;
  subscription_status: string | null;
  user_id: string | null;
  created_at: string;
}

interface PartnerRow {
  id: string;
  team_name: string;
}

interface Assignment {
  partner_id: string;
  user_id: string;
  case_status: string;
}

interface DocRow {
  user_id: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Helpers ────────────────────────────────────────────────────
const PRO_PRICE = 9.99;
const PREMIUM_PRICE = 19.99;

const fmtPct = (v: number) => (isNaN(v) ? "0.0" : v.toFixed(1));
const fmtEur = (v: number) => `€${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const exportCSV = (users: Submission[]) => {
  const BOM = "\uFEFF";
  const headers = "Nombre,Email,Pais,Plan,Fecha\n";
  const rows = users
    .map(
      (u) =>
        `"${u.full_name || ""}","${u.email || ""}","${u.nationality || ""}","${u.subscription_status || "free"}","${u.created_at}"`
    )
    .join("\n");
  const blob = new Blob([BOM + headers + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `albus-users-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Component ──────────────────────────────────────────────────
export const AdminAnalyticsTab = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueView, setRevenueView] = useState<"daily" | "weekly">("daily");

  useEffect(() => {
    const load = async () => {
      const [subRes, partRes, assRes, docRes] = await Promise.all([
        supabase.from("onboarding_submissions").select("id,full_name,email,nationality,subscription_status,user_id,created_at"),
        supabase.from("partners").select("id,team_name"),
        supabase.from("partner_assignments").select("partner_id,user_id,case_status"),
        supabase.from("user_documents").select("user_id,status,created_at,updated_at"),
      ]);
      setSubmissions((subRes.data as Submission[]) || []);
      setPartners((partRes.data as PartnerRow[]) || []);
      setAssignments((assRes.data as Assignment[]) || []);
      setDocs((docRes.data as DocRow[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  // ── Funnel ─────────────────────────────────────────────────
  const funnel = useMemo(() => {
    const total = submissions.length;
    const registered = submissions.filter((s) => s.user_id).length;
    const pro = submissions.filter((s) => s.subscription_status === "pro").length;
    const premium = submissions.filter((s) => s.subscription_status === "premium").length;
    const steps = [
      { label: "Total Leads", value: total },
      { label: "Registrados", value: registered },
      { label: "Pro (€9.99)", value: pro },
      { label: "Premium (€19.99)", value: premium },
    ];
    return steps.map((s, i) => ({
      ...s,
      rate: i === 0 ? "100%" : `${fmtPct(steps[i - 1].value ? (s.value / steps[i - 1].value) * 100 : 0)}%`,
    }));
  }, [submissions]);

  // ── Nationality ────────────────────────────────────────────
  const nationalityData = useMemo(() => {
    const map: Record<string, { leads: number; pro: number; premium: number }> = {};
    submissions.forEach((s) => {
      const c = s.nationality || "Desconocido";
      if (!map[c]) map[c] = { leads: 0, pro: 0, premium: 0 };
      map[c].leads++;
      if (s.subscription_status === "pro") map[c].pro++;
      if (s.subscription_status === "premium") map[c].premium++;
    });
    return Object.entries(map)
      .map(([country, d]) => ({
        country,
        leads: d.leads,
        revenue: d.pro * PRO_PRICE + d.premium * PREMIUM_PRICE,
        convRate: d.leads ? ((d.pro + d.premium) / d.leads) * 100 : 0,
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 10);
  }, [submissions]);

  // ── Partner efficiency ─────────────────────────────────────
  const partnerMetrics = useMemo(() => {
    return partners.map((p) => {
      const pAssignments = assignments.filter((a) => a.partner_id === p.id);
      const assignedUserIds = new Set(pAssignments.map((a) => a.user_id));
      const aprobadas = pAssignments.filter((a) => a.case_status === "aprobada").length;

      const reviewedDocs = docs.filter(
        (d) =>
          assignedUserIds.has(d.user_id) &&
          (d.status === "valid" || d.status === "error") &&
          d.created_at &&
          d.updated_at
      );
      const totalHours = reviewedDocs.reduce((sum, d) => {
        const diff = new Date(d.updated_at!).getTime() - new Date(d.created_at!).getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      const avgHours = reviewedDocs.length ? totalHours / reviewedDocs.length : 0;

      return {
        name: p.team_name,
        docsReviewed: reviewedDocs.length,
        avgReviewHours: avgHours,
        aprobadas,
      };
    });
  }, [partners, assignments, docs]);

  // ── Revenue over time ──────────────────────────────────────
  const revenueData = useMemo(() => {
    const paying = submissions.filter(
      (s) => s.subscription_status === "pro" || s.subscription_status === "premium"
    );
    paying.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const buckets: Record<string, number> = {};
    paying.forEach((s) => {
      const d = new Date(s.created_at);
      let key: string;
      if (revenueView === "daily") {
        key = d.toISOString().split("T")[0];
      } else {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        key = `W${startOfWeek.toISOString().split("T")[0]}`;
      }
      const amount = s.subscription_status === "pro" ? PRO_PRICE : PREMIUM_PRICE;
      buckets[key] = (buckets[key] || 0) + amount;
    });

    let cumulative = 0;
    return Object.entries(buckets).map(([date, rev]) => {
      cumulative += rev;
      return { date: date.replace("W", ""), revenue: rev, cumulative };
    });
  }, [submissions, revenueView]);

  // ── Pipeline ───────────────────────────────────────────────
  const pipeline = useMemo(() => {
    const freeLeads = submissions.filter(
      (s) => !s.subscription_status || s.subscription_status === "free"
    ).length;
    return freeLeads * 0.1 * PRO_PRICE;
  }, [submissions]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Section A: Conversion Funnel ─────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Funnel de Conversión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnel} layout="vertical" margin={{ left: 100 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 13 }} width={110} />
              <Tooltip
                formatter={(v: number) => [v, "Usuarios"]}
                contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {funnel.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#1a1a1a" : i === 1 ? "#4b5563" : i === 2 ? "#9ca3af" : "#d1d5db"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-4 flex-wrap">
            {funnel.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                {i > 0 && <p className="text-xs text-muted-foreground">({s.rate})</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Section B: Nationality Insights ──────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" /> Distribución por Nacionalidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={nationalityData} layout="vertical" margin={{ left: 120 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={120} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="leads" fill="#1a1a1a" radius={[0, 4, 4, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>País</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Ventas (€)</TableHead>
                <TableHead className="text-right">Conversión (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nationalityData.map((row) => (
                <TableRow key={row.country}>
                  <TableCell className="font-medium">{row.country}</TableCell>
                  <TableCell className="text-right">{row.leads}</TableCell>
                  <TableCell className="text-right">{fmtEur(row.revenue)}</TableCell>
                  <TableCell className="text-right">{fmtPct(row.convRate)}%</TableCell>
                </TableRow>
              ))}
              {nationalityData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Sin datos de nacionalidad
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Section C: Partner Efficiency ─────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Rendimiento de Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead className="text-right">Docs Revisados</TableHead>
                <TableHead className="text-right">Tiempo Medio (h)</TableHead>
                <TableHead className="text-right">Aprobadas</TableHead>
                <TableHead className="text-right">Satisfacción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerMetrics.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right">{p.docsReviewed}</TableCell>
                  <TableCell className="text-right">{p.avgReviewHours.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{p.aprobadas}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-current" /> —
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {partnerMetrics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Sin partners registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Section D: Revenue & Growth ──────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Ingresos y Crecimiento
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={revenueView === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setRevenueView("daily")}
            >
              Diario
            </Button>
            <Button
              variant={revenueView === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setRevenueView("weekly")}
            >
              Semanal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number, name: string) => [fmtEur(v), name === "cumulative" ? "Acumulado" : "Período"]}
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                />
                <Line type="monotone" dataKey="cumulative" stroke="#1a1a1a" strokeWidth={2} dot={false} name="cumulative" />
                <Line type="monotone" dataKey="revenue" stroke="#9ca3af" strokeWidth={1.5} dot={false} name="revenue" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">Sin datos de ingresos</p>
          )}

          {/* Lead Pipeline */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Lead Pipeline</p>
              <p className="text-xs text-muted-foreground">
                Si el 10% de los leads gratuitos actualizan a Pro
              </p>
            </div>
            <p className="text-2xl font-bold">{fmtEur(pipeline)}<span className="text-sm font-normal text-muted-foreground">/mes potencial</span></p>
          </div>
        </CardContent>
      </Card>

      {/* ── Section E: CSV Export ─────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Exportar Usuarios
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportCSV(submissions)} className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Descarga un archivo CSV con {submissions.length} registros (nombre, email, nacionalidad, plan, fecha)
            para reporting fiscal o análisis externo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
