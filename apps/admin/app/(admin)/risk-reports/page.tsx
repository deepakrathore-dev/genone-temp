"use client";
import * as React from "react";
import { useChallenges } from "@/lib/queries";
import { RoleGate } from "@/components/global/RoleGate";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Tabs, TabsList, TabsTrigger, Button,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Skeleton, formatCurrency, formatNumber, Badge,
} from "@genone/ui";
import { Download, TrendingUp, DollarSign, Clock, Banknote, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const REPORTS = [
  { key: "challenge",     label: "Challenge Vs Payouts" },
  { key: "size",          label: "Account Size Vs Payouts" },
  { key: "country",       label: "Country-Wise Payouts" },
  { key: "earners",       label: "Highest Earners" },
  { key: "unprofitable",  label: "Unprofitable Countries" },
  { key: "group",         label: "Group Vs Payouts" },
] as const;
type Report = typeof REPORTS[number]["key"];

const WINDOWS = ["YTD", "30D", "90D", "180D", "ALL"] as const;
type Win = typeof WINDOWS[number];
const WIN_LABEL: Record<Win, string> = {
  YTD: "YTD",
  "30D": "Last 30 Days",
  "90D": "Last 90 Days",
  "180D": "Last 180 Days",
  ALL: "All",
};

export default function RiskReportsPage() {
  return (
    <RoleGate permission="reports.view" fallback="deny">
      <Inner />
    </RoleGate>
  );
}

function Inner() {
  const [report, setReport] = React.useState<Report>("challenge");
  const [win, setWin] = React.useState<Win>("ALL");
  const { data: challenges, isLoading } = useChallenges();

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Risk reports</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Operating reports for the leadership team. Slice the business by challenge, account size, country, or peer group.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col lg:flex-row lg:items-center gap-3 p-3">
          <Tabs value={report} onValueChange={(v) => setReport(v as Report)} className="overflow-x-auto">
            <TabsList>
              {REPORTS.map((r) => (
                <TabsTrigger key={r.key} value={r.key}>{r.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="lg:ml-auto">
            <Tabs value={win} onValueChange={(v) => setWin(v as Win)}>
              <TabsList>
                {WINDOWS.map((w) => (
                  <TabsTrigger key={w} value={w}>{WIN_LABEL[w]}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
            Key metrics
          </CardTitle>
          <CardDescription>Live snapshot for the {WIN_LABEL[win].toLowerCase()} window.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <KeyMetric
            icon={TrendingUp}
            label="Evaluation pass rate"
            value="30.00%"
            description="Share of evaluation accounts that hit the profit target within the selected range."
          />
          <KeyMetric
            icon={DollarSign}
            label="Payout-to-revenue ratio"
            value="0.34"
            description="Ratio of payouts disbursed to evaluation revenue in the selected range."
          />
          <KeyMetric
            icon={Clock}
            label="Funded account lifespan"
            value="46 days"
            description="Median number of days from funding to breach for funded accounts."
          />
          <KeyMetric
            icon={Banknote}
            label="Avg payouts per account"
            value="1.8"
            description="Average number of payouts a funded account makes before it breaches."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{REPORTS.find((r) => r.key === report)!.label}</CardTitle>
          <CardDescription>Detailed breakdown for the selected slice.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <>
              {report === "challenge" && <ChallengeTable challenges={challenges ?? []} />}
              {report === "size" && <SizeTable />}
              {report === "country" && <CountryTable />}
              {report === "earners" && <EarnersTable />}
              {report === "unprofitable" && <UnprofitableTable />}
              {report === "group" && <GroupTable />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KeyMetric({
  icon: Icon, label, value, description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-4 bg-[var(--surface)]">
      <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-medium">
        <Icon className="h-4 w-4 text-[var(--primary)]" />
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold font-mono tabular-nums text-[var(--text)]">{value}</div>
      <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">{description}</p>
    </div>
  );
}

function ChallengeTable({ challenges }: { challenges: import("@genone/types").Challenge[] }) {
  // Simulated business numbers per challenge for the demo
  const rows = challenges.slice(0, 8).map((c, i) => {
    const revenue = 1_200_000 + i * 320_000;
    const payouts = 850_000 + i * 110_000;
    const margin = revenue - payouts;
    return {
      title: c.name,
      revenueCents: revenue,
      payoutsCents: payouts,
      marginCents: margin,
      marginPct: revenue === 0 ? 0 : (margin / revenue) * 100,
      payoutCount: 3 + i,
      payoutPct: 5 + i * 8,
      fundedCount: 2 + i,
    };
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Challenge</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Total payouts (after split)</TableHead>
          <TableHead>Profit margin</TableHead>
          <TableHead>Payout count</TableHead>
          <TableHead>Payout %</TableHead>
          <TableHead>Funded accounts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.title}>
            <TableCell className="font-medium">{r.title}</TableCell>
            <TableCell className="font-mono">{formatCurrency(r.revenueCents)}</TableCell>
            <TableCell className="font-mono">{formatCurrency(r.payoutsCents)}</TableCell>
            <TableCell className={`font-mono ${r.marginCents >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {formatCurrency(r.marginCents)} ({r.marginPct.toFixed(0)}%)
            </TableCell>
            <TableCell className="font-mono">{r.payoutCount}</TableCell>
            <TableCell className="font-mono">{r.payoutPct.toFixed(2)}%</TableCell>
            <TableCell className="font-mono">{r.fundedCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SizeTable() {
  const rows = [
    { size: "50K",  revenue: 1_840_000_00, payouts:   810_000_00, count: 412 },
    { size: "100K", revenue: 2_120_000_00, payouts: 1_260_000_00, count: 286 },
    { size: "150K", revenue: 1_490_000_00, payouts:   980_000_00, count: 144 },
  ];
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Account size</TableHead><TableHead>Revenue</TableHead><TableHead>Payouts</TableHead><TableHead>Net margin</TableHead><TableHead>Funded accounts</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.size}>
            <TableCell><Badge variant="primary">{r.size}</Badge></TableCell>
            <TableCell className="font-mono">{formatCurrency(r.revenue)}</TableCell>
            <TableCell className="font-mono">{formatCurrency(r.payouts)}</TableCell>
            <TableCell className="font-mono text-[var(--success)]">{formatCurrency(r.revenue - r.payouts)}</TableCell>
            <TableCell className="font-mono">{formatNumber(r.count)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CountryTable() {
  const rows = [
    { country: "US", revenue: 2_840_000_00, payouts: 1_280_000_00, traders: 1432 },
    { country: "IN", revenue: 1_490_000_00, payouts:   620_000_00, traders: 982 },
    { country: "GB", revenue:   910_000_00, payouts:   410_000_00, traders: 412 },
    { country: "CA", revenue:   650_000_00, payouts:   280_000_00, traders: 318 },
    { country: "DE", revenue:   480_000_00, payouts:   190_000_00, traders: 226 },
  ];
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Country</TableHead><TableHead>Revenue</TableHead><TableHead>Payouts</TableHead><TableHead>Net</TableHead><TableHead>Traders</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.country}>
            <TableCell><Badge>{r.country}</Badge></TableCell>
            <TableCell className="font-mono">{formatCurrency(r.revenue)}</TableCell>
            <TableCell className="font-mono">{formatCurrency(r.payouts)}</TableCell>
            <TableCell className="font-mono text-[var(--success)]">{formatCurrency(r.revenue - r.payouts)}</TableCell>
            <TableCell className="font-mono">{formatNumber(r.traders)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EarnersTable() {
  const rows = [
    { initials: "B.M.", country: "US", payouts: 124_000_00, accounts: 3 },
    { initials: "S.C.", country: "GB", payouts:  98_000_00, accounts: 2 },
    { initials: "A.R.", country: "CA", payouts:  82_000_00, accounts: 2 },
    { initials: "P.K.", country: "IN", payouts:  76_000_00, accounts: 2 },
    { initials: "M.G.", country: "AU", payouts:  64_000_00, accounts: 1 },
  ];
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Trader</TableHead><TableHead>Country</TableHead><TableHead>Lifetime payouts</TableHead><TableHead>Funded accounts</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="font-mono">{r.initials}</TableCell>
            <TableCell><Badge>{r.country}</Badge></TableCell>
            <TableCell className="font-mono text-[var(--success)]">{formatCurrency(r.payouts)}</TableCell>
            <TableCell className="font-mono">{r.accounts}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function UnprofitableTable() {
  const rows = [
    { country: "TR", revenue: 84_000_00, payouts: 142_000_00, net: -58_000_00 },
    { country: "AE", revenue: 68_000_00, payouts:  98_000_00, net: -30_000_00 },
    { country: "PH", revenue: 56_000_00, payouts:  74_000_00, net: -18_000_00 },
  ];
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Country</TableHead><TableHead>Revenue</TableHead><TableHead>Payouts</TableHead><TableHead>Net (loss)</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.country}>
            <TableCell><Badge>{r.country}</Badge></TableCell>
            <TableCell className="font-mono">{formatCurrency(r.revenue)}</TableCell>
            <TableCell className="font-mono">{formatCurrency(r.payouts)}</TableCell>
            <TableCell className="font-mono text-[var(--danger)]">{formatCurrency(r.net)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function GroupTable() {
  const rows = [
    { group: "Affiliate-acquired", revenue: 1_240_000_00, payouts: 540_000_00, traders: 928 },
    { group: "Organic",            revenue: 2_180_000_00, payouts: 960_000_00, traders: 1840 },
    { group: "Returning",          revenue:   840_000_00, payouts: 410_000_00, traders: 612 },
  ];
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Group</TableHead><TableHead>Revenue</TableHead><TableHead>Payouts</TableHead><TableHead>Net</TableHead><TableHead>Traders</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.group}>
            <TableCell className="font-medium">{r.group}</TableCell>
            <TableCell className="font-mono">{formatCurrency(r.revenue)}</TableCell>
            <TableCell className="font-mono">{formatCurrency(r.payouts)}</TableCell>
            <TableCell className="font-mono text-[var(--success)]">{formatCurrency(r.revenue - r.payouts)}</TableCell>
            <TableCell className="font-mono">{formatNumber(r.traders)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
