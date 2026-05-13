"use client";
import { Progress, Card, CardHeader, CardTitle, CardContent, formatCurrency } from "@genone/ui";
import type { Account } from "@genone/types";

export function DailyLossIndicator({ account }: { account: Account }) {
  const used = Math.max(0, -account.todayPnlCents);
  const pct = Math.min(100, (used / account.ruleSnapshot.dailyLossCents) * 100);
  const tone = pct < 50 ? "bg-[var(--success)]" : pct < 80 ? "bg-[var(--warning)]" : "bg-[var(--danger)]";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Daily Loss (SOFT)</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">
          Account locks out for the rest of the session at breach.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-mono font-semibold text-danger">
            {used > 0 ? `-${formatCurrency(used)}` : formatCurrency(0)}
          </div>
          <div className="text-xs text-[var(--text-muted)] font-mono">limit {formatCurrency(account.ruleSnapshot.dailyLossCents)}</div>
        </div>
        <Progress value={pct} indicatorClassName={tone} />
        <div className="mt-2 flex justify-between text-[10px] text-[var(--text-faint)] font-mono">
          <span>Next session at 6:00 PM ET</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
