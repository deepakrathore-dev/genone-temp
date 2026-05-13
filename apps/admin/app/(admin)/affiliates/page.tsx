"use client";
import { useAffiliates } from "@/lib/queries";
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Skeleton, formatCurrency, formatNumber, StatTile,
} from "@genone/ui";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function AffiliatesPage() {
  const { data, isLoading } = useAffiliates();
  const totalCommission = (data ?? []).reduce((s, a) => s + a.totalCommissionCents, 0);
  const pendingCommission = (data ?? []).reduce((s, a) => s + a.pendingCommissionCents, 0);
  const activeCount = (data ?? []).filter((a) => a.status === "ACTIVE").length;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Affiliate management</h1>
          <p className="text-sm text-[var(--text-muted)]">Approve, suspend, and adjust per-affiliate commission tiers.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatTile label="Active affiliates" value={String(activeCount)} />
        <StatTile label="Total commission paid" value={formatCurrency(totalCommission)} />
        <StatTile label="Pending payout (15th)" value={formatCurrency(pendingCommission)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All affiliates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Signups (mo)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><div className="text-sm font-medium">{a.name}</div><div className="text-xs text-[var(--text-muted)]">{a.email}</div></TableCell>
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell><Badge variant="primary">{a.tierPct}%</Badge></TableCell>
                    <TableCell className="font-mono">{formatNumber(a.monthSignups)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.totalCommissionCents)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.pendingCommissionCents)}</TableCell>
                    <TableCell><Badge variant={a.status === "ACTIVE" ? "success" : a.status === "SUSPENDED" ? "danger" : "warning"}>{a.status}</Badge></TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      {a.status === "PENDING" && <Button size="sm" variant="success" onClick={() => toast.success("Approved")}>Approve</Button>}
                      {a.status === "ACTIVE" && <Button size="sm" variant="danger" onClick={() => toast.success("Suspended")}>Suspend</Button>}
                      <Button size="sm" variant="outline" onClick={() => toast.success("Tier adjusted")}>Adjust tier</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
