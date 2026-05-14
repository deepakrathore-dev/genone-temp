"use client";
import * as React from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Tabs, TabsList, TabsTrigger,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Skeleton, formatCurrency, formatNumber,
} from "@genone/ui";
import { MetricTile } from "@/components/dashboard/MetricTile";
import { RetentionCohort, buildRetentionCohortMock } from "@/components/dashboard/RetentionCohort";
import { useAffiliates } from "@/lib/queries";
import { Download, Calendar } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = ["accounts", "payouts", "orders", "positions"] as const;
type Section = typeof SECTIONS[number];
const SECTION_LABEL: Record<Section, string> = {
  accounts: "Accounts",
  payouts: "Payouts",
  orders: "Orders",
  positions: "Positions",
};

export default function AdminDashboardPage() {
  const [section, setSection] = React.useState<Section>("accounts");
  const { data: affiliates } = useAffiliates();
  const cohortRows = React.useMemo(buildRetentionCohortMock, []);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Site administration</h1>
        </div>
        <div className="flex items-center gap-2">
          
          <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={section} onValueChange={(v) => setSection(v as Section)}>
        <TabsList>
          {SECTIONS.map((s) => (
            <TabsTrigger key={s} value={s}>{SECTION_LABEL[s]}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {section === "accounts" && <AccountsSection />}
      {section === "payouts" && <PayoutsSection />}
      {section === "orders" && <OrdersSection />}
      {section === "positions" && <PositionsSection />}

      <RetentionCohort rows={cohortRows} />

      {affiliates && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Affiliate performance</CardTitle>
            <CardDescription>Revenue and commission attributed to each partner over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Commission tier</TableHead>
                  <TableHead>Signups (mo)</TableHead>
                  <TableHead>Lifetime commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">{a.email}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell><Badge variant="primary">{a.tierPct}%</Badge></TableCell>
                    <TableCell className="font-mono">{formatNumber(a.monthSignups)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.totalCommissionCents)}</TableCell>
                    <TableCell><Badge variant={a.status === "ACTIVE" ? "success" : a.status === "SUSPENDED" ? "danger" : "warning"}>{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AccountsSection() {
  return (
    <div className="space-y-3">
      {/* Top row: accounts by lifecycle stage */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile label="Total Accounts" value="329" href="/users" delta={0.44} hint="from last week" />
        <MetricTile label="Phase 1 (Evaluation)" value="178" href="/users?phase=1" delta={0.0} hint="from last week" accent="info" />
        <MetricTile label="Phase 2 (Funded)" value="33" href="/users?phase=2" delta={0.0} hint="from last week" accent="accent" />
        <MetricTile label="Live Account" value="1" href="/users?live=1" delta={0.0} hint="from last week" accent="success" />
      </div>

      {/* Broker (Rithmic only - others come later) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetricTile label="Rithmic active accounts" value="76" href="/users" accent="primary" hint="All live broker connections" />
        <Card className="flex items-center justify-between p-4 text-sm text-[var(--text-muted)]">
          <div>
            <div className="text-sm font-medium text-[var(--text)]">More brokers coming soon</div>
            <div className="text-xs">Additional broker integrations will appear here as they go live.</div>
          </div>
          <Badge variant="neutral">Roadmap</Badge>
        </Card>
      </div>

      {/* Health metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile label="Daily DD Breached" value="2.43%" href="/risk" accent="warning" />
        <MetricTile label="Max DD Breached" value="3.34%" href="/risk" accent="warning" />
        <MetricTile label="Blocked Accounts" value="13.07%" href="/users?status=blocked" accent="warning" />
        <MetricTile label="Passed Accounts" value="2.43%" href="/users?status=passed" accent="success" />
      </div>

      {/* Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetricTile label="Total Users" value="227" href="/users" delta={0.44} hint="from last week" />
        <MetricTile label="Average Accounts per User" value="1.45" hint="from last week" delta={0.0} />
      </div>

      {/* Average times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetricTile label="Average pass time" value="15d 22h 6m" hint="From purchase to evaluation pass" />
        <MetricTile label="Average breach time" value="37d 7h 27m" hint="From purchase to rule breach" />
      </div>
    </div>
  );
}

function PayoutsSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricTile label="Payouts today" value={formatCurrency(48_200_00)} href="/payouts" accent="success" delta={-2.1} hint="from yesterday" />
      <MetricTile label="Pending requests" value="28" href="/payouts" accent="warning" />
      <MetricTile label="Approved this month" value={formatCurrency(2_840_000_00)} href="/payouts" accent="primary" />
      <MetricTile label="Daily cap utilisation" value="38%" href="/payouts/exposure" accent="info" hint="of the $5,000 daily cap" />
    </div>
  );
}

function OrdersSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricTile label="Orders today" value="14,326" href="/users" />
      <MetricTile label="Avg orders per account" value="62.3" />
      <MetricTile label="Force-liquidated orders" value="38" accent="warning" hint="at 4:00 PM ET cutoff" />
      <MetricTile label="Rejected orders" value="142" accent="danger" hint="contract limit violations" />
    </div>
  );
}

function PositionsSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricTile label="Open positions" value="412" href="/users" />
      <MetricTile label="Net exposure" value={formatCurrency(8_240_00_00)} accent="primary" />
      <MetricTile label="Largest single position" value="6 contracts" hint="NQ 03-2026" />
      <MetricTile label="Closed today" value="3,184" hint="across all funded accounts" />
    </div>
  );
}
