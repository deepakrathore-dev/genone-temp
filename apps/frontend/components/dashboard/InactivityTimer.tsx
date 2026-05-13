"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@genone/ui";
import { differenceInDays } from "date-fns";
import type { Account } from "@genone/types";

export function InactivityTimer({ account }: { account: Account }) {
  const reset = new Date(account.inactivityResetAt);
  const elapsed = Math.max(0, differenceInDays(new Date(), reset));
  const limit = account.ruleSnapshot.inactivityDays;
  const remaining = Math.max(0, limit - elapsed);
  const pct = Math.min(100, (elapsed / limit) * 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Inactivity Timer</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">
          Resets on any trade. Closes the evaluation after 30 idle days.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-mono font-semibold">{remaining}d</div>
          <div className="text-xs text-[var(--text-muted)] font-mono">{elapsed}/{limit} days</div>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
          <div
            className={pct > 75 ? "h-full bg-[var(--danger)]" : pct > 50 ? "h-full bg-[var(--warning)]" : "h-full bg-[var(--success)]"}
            style={{ width: `${pct}%`, transition: "width 500ms ease" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
