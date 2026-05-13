"use client";
import { TIERS } from "@genone/mock-data";
import { cn, formatCurrency, Badge, InfoTip, RULE_HELP, type RuleHelpKey } from "@genone/ui";
import { Check } from "lucide-react";

const ROWS: Array<{ key: RuleHelpKey; label: (t: typeof TIERS[number]) => string }> = [
  { key: "profitTarget",   label: (t) => `Profit target ${formatCurrency(t.profitTargetCents)}` },
  { key: "drawdown",       label: (t) => `Drawdown ${formatCurrency(t.drawdownCents)} (EOD)` },
  { key: "dailyLoss",      label: (t) => `Daily loss ${formatCurrency(t.dailyLossCents)}` },
  { key: "maxContracts",   label: (t) => `${t.maxContracts} max contracts` },
  { key: "firstPayoutCap", label: (t) => `First payout cap ${formatCurrency(t.firstPayoutCapCents)}` },
];

export function TierPicker({ value, onChange }: { value: string | null; onChange: (tier: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TIERS.map((t) => {
        const active = value === t.tier;
        return (
          <div
            key={t.tier}
            role="button"
            tabIndex={0}
            onClick={() => onChange(t.tier)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(t.tier);
              }
            }}
            className={cn(
              "relative text-left rounded-xl border bg-[var(--surface)] p-4 transition-colors hover:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer",
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
            <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-muted)] font-mono">
              {ROWS.map((row) => {
                const help = RULE_HELP[row.key];
                return (
                  <li key={row.key} className="flex items-center gap-1.5">
                    <span>{row.label(t)}</span>
                    {/* Stop the parent's click handler so opening the info popover doesn't also re-select the tier */}
                    <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <InfoTip title={help.title} side="top">
                        {help.body}
                      </InfoTip>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
