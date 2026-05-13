"use client";
import { Card, CardHeader, CardTitle, CardContent, Progress, formatCurrency } from "@genone/ui";
import type { Account } from "@genone/types";

export function BufferIndicator({ account }: { account: Account }) {
  if (account.type !== "FUNDED") return null;
  const target = account.ruleSnapshot.bufferCents;
  const built = Math.min(target, account.buffersBuiltCents);
  const pct = Math.min(100, (built / target) * 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Buffer</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">
          Drawdown + $100. Required before first payout.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-mono font-semibold">{formatCurrency(built)}</div>
          <div className="text-xs text-[var(--text-muted)] font-mono">target {formatCurrency(target)}</div>
        </div>
        <Progress value={pct} indicatorClassName="bg-[var(--accent)]" />
        <div className="mt-2 text-[10px] text-[var(--text-faint)] font-mono">{pct.toFixed(0)}% built</div>
      </CardContent>
    </Card>
  );
}
