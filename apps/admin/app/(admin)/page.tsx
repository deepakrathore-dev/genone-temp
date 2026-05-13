"use client";
import {
  Card, CardContent, CardHeader, CardTitle, Button,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, formatCurrency, formatNumber, Skeleton,
} from "@genone/ui";
import { KpiGrid } from "@/components/kpi/KpiGrid";
import { TierDistribution } from "@/components/kpi/TierDistribution";
import { RetryAnalytics } from "@/components/kpi/RetryAnalytics";
import { useAffiliates } from "@/lib/queries";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const { data: affiliates } = useAffiliates();
  const exportCsv = () => toast.success("Export queued");

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Business overview</h1>
          <p className="text-sm text-[var(--text-muted)]">Auto-refresh every 30 seconds.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-3.5 w-3.5" /> Export CSV</Button>
      </div>

      <KpiGrid />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TierDistribution />
        <RetryAnalytics />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Affiliate Performance</CardTitle>
          <p className="text-xs text-[var(--text-muted)]">Revenue and commission attributed per affiliate (rolling 30d).</p>
        </CardHeader>
        <CardContent className="p-0">
          {!affiliates ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Signups (mo)</TableHead>
                  <TableHead>Total commission</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><div className="text-sm font-medium">{a.name}</div><div className="text-xs text-[var(--text-muted)]">{a.email}</div></TableCell>
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell><Badge variant="primary">{a.tierPct}%</Badge></TableCell>
                    <TableCell className="font-mono">{formatNumber(a.monthSignups)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.totalCommissionCents)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.pendingCommissionCents)}</TableCell>
                    <TableCell><Badge variant={a.status === "ACTIVE" ? "success" : a.status === "SUSPENDED" ? "danger" : "warning"}>{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Monthly P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Stat label="Revenue" value={formatCurrency(2_840_000)} tone="success" />
            <Stat label="Affiliate commissions" value={formatCurrency(420_000)} tone="danger" />
            <Stat label="Trader payouts" value={formatCurrency(680_000)} tone="danger" />
            <Stat label="Net margin" value={formatCurrency(1_740_000)} tone="success" />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{label}</dt>
      <dd className={`mt-1 text-xl font-mono font-semibold ${tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : ""}`}>{value}</dd>
    </div>
  );
}
