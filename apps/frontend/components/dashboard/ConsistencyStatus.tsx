"use client";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@genone/ui";
import type { Account } from "@genone/types";

export function ConsistencyStatus({ account }: { account: Account }) {
  if (account.type !== "FUNDED") return null;
  const cap = account.ruleSnapshot.consistencyPct;
  const max = account.consistencyMaxDayPct;
  const ok = max <= cap;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Consistency</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">
          No single day may exceed {cap}% of cumulative profit since last payout.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-mono font-semibold">{max}%</div>
            <div className="text-xs text-[var(--text-faint)] font-mono">peak single-day share</div>
          </div>
          {ok ? <Badge variant="success">Compliant</Badge> : <Badge variant="danger">Blocking payout</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
