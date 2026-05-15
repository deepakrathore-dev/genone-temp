"use client";
import * as React from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Tabs, TabsList, TabsTrigger,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, formatCurrency, formatNumber,
} from "@genone/ui";
import { MetricTile } from "@/components/dashboard/MetricTile";
import { RetentionCohort, buildRetentionCohortMock } from "@/components/dashboard/RetentionCohort";
import { useAffiliates } from "@/lib/queries";
import { accounts as mockAccounts, users as mockUsers, purchases as mockPurchases } from "@genone/mock-data";
import { Download } from "lucide-react";
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
  const cohortRows = React.useMemo(() => buildRetentionCohortMock(), []);

  // Reconcile every account-related number against the same mock dataset so the
  // dashboard never shows nonsensical totals (e.g. 178 phase-1 accounts on 329
  // total with phase-2 also at 33 — which used to overstate by 21).
  const accountStats = React.useMemo(() => {
    const total = mockAccounts.length;
    const phase1 = mockAccounts.filter((a) => a.type === "EVALUATION" && !a.archivedAt).length;
    const phase2 = mockAccounts.filter((a) => a.type === "FUNDED" && !a.archivedAt).length;
    const passed = mockAccounts.filter((a) => a.status === "PASSED").length;
    const blocked = mockAccounts.filter(
      (a) => a.status === "FAILED" || a.status === "INACTIVE" || a.status === "PAUSED"
    ).length;
    const active = mockAccounts.filter((a) => a.status === "ACTIVE").length;
    const dailyLossLocked = mockAccounts.filter((a) => a.status === "DAILY_LOSS_LOCKED").length;
    const totalUsers = mockUsers.length;
    const purchases = mockPurchases.length;
    const avgPerUser = totalUsers === 0 ? 0 : total / totalUsers;
    const pct = (n: number) => (total === 0 ? "0.00%" : `${((n / total) * 100).toFixed(2)}%`);
    return {
      total,
      phase1,
      phase2,
      active,
      passed,
      blocked,
      dailyLossLocked,
      totalUsers,
      purchases,
      avgPerUser,
      pct,
    };
  }, []);

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

      {section === "accounts" && <AccountsSection stats={accountStats} />}
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

interface AccountsStats {
  total: number;
  phase1: number;
  phase2: number;
  active: number;
  passed: number;
  blocked: number;
  dailyLossLocked: number;
  totalUsers: number;
  purchases: number;
  avgPerUser: number;
  pct: (n: number) => string;
}

function AccountsSection({ stats }: { stats: AccountsStats }) {
  return (
    <div className="space-y-3">
      {/* Top row: accounts by lifecycle stage — all numbers reconcile against the same mock */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile label="Total Accounts" value={formatNumber(stats.total)} href="/users" hint="All evaluation + funded accounts" />
        <MetricTile label="Phase 1 (Evaluation)" value={formatNumber(stats.phase1)} href="/users?phase=1" hint={`${stats.pct(stats.phase1)} of total`} accent="info" />
        <MetricTile label="Phase 2 (Funded)" value={formatNumber(stats.phase2)} href="/users?phase=2" hint={`${stats.pct(stats.phase2)} of total`} accent="accent" />
        <MetricTile label="Active right now" value={formatNumber(stats.active)} href="/users?live=1" hint={`${stats.pct(stats.active)} of total`} accent="success" />
      </div>

      {/* Broker (Rithmic only - others come later) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetricTile label="Rithmic accounts" value={formatNumber(stats.total)} href="/users" accent="primary" hint="" />
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
        <MetricTile label="Daily DD Locked" value={stats.pct(stats.dailyLossLocked)} href="/risk" accent="warning" hint={`${stats.dailyLossLocked} account${stats.dailyLossLocked === 1 ? "" : "s"} locked today`} />
        <MetricTile label="Blocked accounts" value={stats.pct(stats.blocked)} href="/users?status=blocked" accent="warning" hint={`${stats.blocked} failed / paused / inactive`} />
        <MetricTile label="Passed accounts" value={stats.pct(stats.passed)} href="/users?status=passed" accent="success" hint={`${stats.passed} evaluation pass${stats.passed === 1 ? "" : "es"}`} />
        <MetricTile label="Purchases lifetime" value={formatNumber(stats.purchases)} href="/users?status=purchased" accent="info" hint="Receipts across all users" />
      </div>

      {/* Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetricTile label="Total Users" value={formatNumber(stats.totalUsers)} href="/users" hint="Unique traders" />
        <MetricTile label="Average accounts per user" value={stats.avgPerUser.toFixed(2)} hint={`${stats.total} accounts across ${stats.totalUsers} users`} />
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
