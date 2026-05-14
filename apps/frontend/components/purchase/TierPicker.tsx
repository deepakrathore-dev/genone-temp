"use client";
import { cn, formatCurrency, Badge, InfoTip, RULE_HELP, type RuleHelpKey } from "@genone/ui";
import { Check } from "lucide-react";
import type { Challenge } from "@genone/types";

const ROWS: Array<{ key: RuleHelpKey; label: (c: Challenge) => string }> = [
  { key: "profitTarget",   label: (c) => `Profit target ${formatCurrency(c.profitTargetCents)}` },
  { key: "drawdown",       label: (c) => `Drawdown ${formatCurrency(c.drawdownCents)} (EOD)` },
  { key: "dailyLoss",      label: (c) => `Daily loss ${formatCurrency(c.dailyLossCents)}` },
  { key: "maxContracts",   label: (c) => `${c.maxContracts} max contracts` },
  { key: "firstPayoutCap", label: (c) => `First payout cap ${formatCurrency(c.firstPayoutCapCents)}` },
];

export function sizeLabel(c: Challenge) {
  return `${Math.round(c.startingBalanceCents / 100_000)}K`;
}

export function TierPicker({
  challenges,
  value,
  onChange,
  popularChallengeId,
}: {
  challenges: Challenge[];
  value: string | null;
  onChange: (challenge: Challenge) => void;
  popularChallengeId?: string;
}) {
  if (challenges.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-8 text-center">
        <div className="text-sm font-medium text-white">No challenges available in this category</div>
        <div className="text-xs text-white/55 mt-1">Pick a different challenge type above or check back shortly.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {challenges.map((c) => {
        const active = value === c.id;
        const isPopular = popularChallengeId === c.id;
        return (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            onClick={() => onChange(c)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(c);
              }
            }}
            className={cn(
              "relative text-left rounded-2xl border bg-white/[0.03] p-4 transition-all hover:bg-white/[0.05] hover:border-white/[0.20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BA8E5]/40 cursor-pointer",
              active
                ? "border-[#5BA8E5] bg-[#5BA8E5]/[0.08] shadow-[0_0_0_1px_rgba(91,168,229,0.35)]"
                : "border-white/[0.10]"
            )}
          >
            {active && (
              <span className="absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#5BA8E5] text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
            <div className="flex items-baseline justify-between gap-2 pr-7">
              <span className="text-sm font-semibold tracking-tight text-white">{sizeLabel(c)} Evaluation</span>
              {isPopular && <Badge variant="accent">Popular</Badge>}
            </div>
            <div className="mt-2 text-3xl font-mono font-bold tabular-nums text-white">{formatCurrency(c.evaluationFeeCents)}</div>
            <div className="text-[10px] text-white/45 font-mono uppercase tracking-wider">one-time</div>
            <ul className="mt-4 space-y-1.5 text-xs text-white/65 font-mono">
              {ROWS.map((row) => {
                const help = RULE_HELP[row.key];
                return (
                  <li key={row.key} className="flex items-center gap-1.5">
                    <span>{row.label(c)}</span>
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
