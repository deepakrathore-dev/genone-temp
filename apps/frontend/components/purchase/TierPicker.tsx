"use client";
import { TIERS } from "@genone/mock-data";
import { cn, formatCurrency, Badge } from "@genone/ui";
import { Check } from "lucide-react";

export function TierPicker({ value, onChange }: { value: string | null; onChange: (tier: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TIERS.map((t) => {
        const active = value === t.tier;
        return (
          <button
            key={t.tier}
            type="button"
            onClick={() => onChange(t.tier)}
            className={cn(
              "relative text-left rounded-xl border bg-[var(--surface)] p-4 transition-colors hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
              active ? "border-[var(--primary)] ring-2 ring-[var(--ring)]" : "border-[var(--border)]"
            )}
          >
            {active && (
              <span className="absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold tracking-tight">{t.tier} Evaluation</span>
              {t.tier === "100K" && <Badge variant="accent">Popular</Badge>}
            </div>
            <div className="mt-2 text-3xl font-mono font-bold">{formatCurrency(t.evaluationFeeCents)}</div>
            <div className="text-[10px] text-[var(--text-faint)] font-mono">one-time</div>
            <ul className="mt-3 space-y-1 text-xs text-[var(--text-muted)] font-mono">
              <li>Profit target {formatCurrency(t.profitTargetCents)}</li>
              <li>Drawdown {formatCurrency(t.drawdownCents)} (EOD)</li>
              <li>Daily loss {formatCurrency(t.dailyLossCents)}</li>
              <li>{t.maxContracts} max contracts</li>
              <li>First payout cap {formatCurrency(t.firstPayoutCapCents)}</li>
            </ul>
          </button>
        );
      })}
    </div>
  );
}
