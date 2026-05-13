"use client";
import { Progress, Card, CardHeader, CardTitle, CardContent, formatCurrency } from "@genone/ui";
import type { Account } from "@genone/types";

export function DrawdownIndicator({ account }: { account: Account }) {
  const distance = account.currentEquityCents - account.drawdownFloorCents;
  const distancePct = Math.max(0, Math.min(100, (distance / account.ruleSnapshot.drawdownCents) * 100));
  const tone = distancePct > 60 ? "bg-[var(--success)]" : distancePct > 30 ? "bg-[var(--warning)]" : "bg-[var(--danger)]";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">EOD Drawdown</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">
          Fixed floor - never moves. Your wins are protected.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-mono font-semibold">{formatCurrency(distance, { sign: true })}</div>
          <div className="text-xs text-[var(--text-muted)] font-mono">floor {formatCurrency(account.drawdownFloorCents)}</div>
        </div>
        <Progress value={distancePct} indicatorClassName={tone} />
        <div className="mt-2 flex justify-between text-[10px] text-[var(--text-faint)] font-mono">
          <span>Drawdown {formatCurrency(account.ruleSnapshot.drawdownCents)}</span>
          <span>{distancePct.toFixed(0)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
