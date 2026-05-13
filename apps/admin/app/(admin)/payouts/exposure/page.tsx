"use client";
import { useExposure } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle, StatTile, Skeleton, formatCurrency, Progress } from "@genone/ui";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";

export default function ExposurePage() {
  const { data, isLoading } = useExposure();
  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;
  const today = data[data.length - 1]!;
  const approved = today.approvedCents;
  const pending = today.pendingCents;
  const cap = today.dailyCapCents;
  const total = approved + pending;
  const pct = (total / cap) * 100;
  const tone = pct < 60 ? "bg-[var(--success)]" : pct < 80 ? "bg-[var(--warning)]" : "bg-[var(--danger)]";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Daily payout exposure</h1>
        <p className="text-sm text-[var(--text-muted)]">Auto-refresh every 60 seconds. Trips a hard lock if cap is breached.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatTile label="Today Approved" value={formatCurrency(approved)} />
        <StatTile label="Today Pending" value={formatCurrency(pending)} />
        <StatTile label="Total (approved + pending)" value={formatCurrency(total)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cap utilisation</CardTitle>
          <p className="text-xs text-[var(--text-muted)]">Daily cap {formatCurrency(cap)} - auto-lock triggers at 100%.</p>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(100, pct)} indicatorClassName={tone} className="h-3" />
          <div className="mt-2 text-xs font-mono text-[var(--text-muted)]">{pct.toFixed(1)}% of cap used</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Last 7 days</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.map((d) => ({ date: d.date.slice(5), approved: d.approvedCents / 100, pending: d.pendingCents / 100 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--border)" tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="approved" stackId="a" fill="var(--success)" radius={[0, 0, 0, 0]} name="Approved" />
              <Bar dataKey="pending" stackId="a" fill="var(--warning)" radius={[6, 6, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
