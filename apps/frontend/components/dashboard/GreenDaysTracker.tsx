"use client";
import { Card, CardHeader, CardTitle, CardContent, cn, formatCurrency } from "@genone/ui";
import type { Account } from "@genone/types";
import { CheckCircle2 } from "lucide-react";

export function GreenDaysTracker({ account }: { account: Account }) {
  const required = account.ruleSnapshot.greenDaysRequired;
  const achieved = Math.min(required, account.greenDaysCount);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Green Days</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">
          Day qualifies at {formatCurrency(account.ruleSnapshot.greenDayThresholdCents)}+ P&L.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {Array.from({ length: required }).map((_, i) => {
            const filled = i < achieved;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 h-10 rounded-lg border flex items-center justify-center text-xs font-mono font-medium transition-colors",
                  filled
                    ? "bg-[var(--success-soft)] border-[var(--success)]/40 text-[var(--success)]"
                    : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-faint)]"
                )}
              >
                {filled ? <CheckCircle2 className="h-4 w-4" /> : `Day ${i + 1}`}
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-[var(--text-muted)] font-mono">
          {achieved}/{required} accumulated - required before payout request.
        </div>
      </CardContent>
    </Card>
  );
}
