"use client";
import { Card, CardHeader, CardTitle, CardContent, formatCurrency } from "@genone/ui";
import type { Account } from "@genone/types";

export function ProfitTargetRing({ account }: { account: Account }) {
  const target = account.ruleSnapshot.profitTargetCents;
  const progress = Math.max(0, account.cumulativePnlCents);
  const pct = Math.min(100, (progress / target) * 100);
  const r = 56;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = pct >= 100 ? "var(--success)" : pct >= 50 ? "var(--primary)" : "var(--accent)";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Profit Target</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">
          Pass the evaluation by reaching the target without breaching rules.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle cx="70" cy="70" r={r} stroke="var(--surface-3)" strokeWidth="12" fill="none" />
              <circle
                cx="70"
                cy="70"
                r={r}
                stroke={color}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c}`}
                style={{ transition: "stroke-dasharray 600ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-mono font-bold">{pct.toFixed(0)}%</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">to target</div>
            </div>
          </div>
          <div className="flex flex-col gap-1 font-mono text-sm">
            <span>
              <span className="text-[var(--text-muted)]">Current </span>
              <span className="font-semibold">{formatCurrency(progress)}</span>
            </span>
            <span>
              <span className="text-[var(--text-muted)]">Target </span>
              <span className="font-semibold">{formatCurrency(target)}</span>
            </span>
            <span>
              <span className="text-[var(--text-muted)]">Remaining </span>
              <span className="font-semibold">{formatCurrency(Math.max(0, target - progress))}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
