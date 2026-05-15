"use client";
import { useMe } from "@/lib/queries";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Progress, Badge, formatCurrency, Skeleton,
  Table, TableHeader, TableRow, TableBody, TableHead, TableCell,
} from "@genone/ui";

const LOYALTY_TIERS = [
  { attempts: 3, pct: 2 },
  { attempts: 5, pct: 5 },
  { attempts: 10, pct: 10 },
];

// Fake credit history derived from defaults so the page is full of data
const CREDIT_HISTORY = [
  { date: "2026-04-21", source: "Pass credit · 100K", amountCents: 4400, type: "credit" as const },
  { date: "2026-04-02", source: "Applied at checkout · 50K", amountCents: -3000, type: "debit" as const },
  { date: "2026-03-19", source: "Pass credit · 50K", amountCents: 2580, type: "credit" as const },
  { date: "2026-03-04", source: "Admin promo · welcome back", amountCents: 1500, type: "credit" as const },
  { date: "2026-02-12", source: "Pass credit · 50K", amountCents: 2580, type: "credit" as const },
];

export default function WalletPage() {
  const { data: me, isLoading } = useMe();
  if (isLoading || !me) return <Skeleton className="h-64 w-full" />;

  const next = LOYALTY_TIERS.find((t) => t.attempts > me.loyaltyAttempts) ?? null;
  const toNext = next ? Math.max(0, next.attempts - me.loyaltyAttempts) : 0;
  const lastTier = LOYALTY_TIERS.filter((t) => t.attempts <= me.loyaltyAttempts).at(-1);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wallet & Loyalty</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Non-withdrawable credits and your loyalty progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Credit balance</CardTitle>
            <CardDescription>Auto-applied at checkout before card charge.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono font-bold">{formatCurrency(me.walletCreditCents)}</div>
            <div className="mt-2 text-xs text-[var(--text-muted)] font-mono">Non-withdrawable. Use on any tier purchase.</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty tier</CardTitle>
            <CardDescription>Cumulative attempts unlock a permanent discount.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-2xl font-mono font-semibold">{me.loyaltyTierPct}% off</div>
              <Badge variant="primary">{me.loyaltyAttempts} attempts</Badge>
            </div>
            <Progress
              value={next ? me.loyaltyAttempts : 10}
              max={next ? next.attempts : 10}
              indicatorClassName="bg-[var(--accent)]"
            />
            <div className="mt-2 text-xs text-[var(--text-muted)] font-mono">
              {next ? `${toNext} more attempt${toNext === 1 ? "" : "s"} to ${next.pct}%` : "Max tier reached"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop — horizontally scrollable if needed */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CREDIT_HISTORY.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{h.date}</TableCell>
                    <TableCell className="text-sm">{h.source}</TableCell>
                    <TableCell className={`text-right font-mono whitespace-nowrap ${h.amountCents > 0 ? "text-success" : "text-danger"}`}>
                      {formatCurrency(h.amountCents, { sign: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile — card list */}
          <ul className="md:hidden divide-y divide-[var(--border)]">
            {CREDIT_HISTORY.map((h, i) => (
              <li key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[var(--text)] truncate">{h.source}</div>
                  <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{h.date}</div>
                </div>
                <div className={`text-sm font-mono font-semibold tabular-nums shrink-0 ${h.amountCents > 0 ? "text-success" : "text-danger"}`}>
                  {formatCurrency(h.amountCents, { sign: true })}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
