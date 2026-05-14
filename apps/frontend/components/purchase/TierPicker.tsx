"use client";
import { cn, formatCurrency, InfoTip, RULE_HELP, type RuleHelpKey } from "@genone/ui";
import { Check } from "lucide-react";
import type { Challenge } from "@genone/types";

interface FeatureRow {
  key: RuleHelpKey;
  label: (c: Challenge) => string;
}

const EVAL_ROWS: FeatureRow[] = [
  { key: "profitTarget",   label: (c) => `Profit target ${formatCurrency(c.profitTargetCents)}` },
  { key: "drawdown",       label: (c) => `EOD drawdown ${formatCurrency(c.drawdownCents)}` },
  { key: "dailyLoss",      label: (c) => `Daily loss limit ${formatCurrency(c.dailyLossCents)}` },
  { key: "maxContracts",   label: (c) => `Up to ${c.maxContracts} contracts` },
];

const FUNDED_ROWS: FeatureRow[] = [
  { key: "firstPayoutCap", label: (c) => `First payout cap ${formatCurrency(c.firstPayoutCapCents)}` },
  { key: "drawdown",       label: (c) => `Buffer ${formatCurrency(c.bufferCents)}` },
  { key: "maxContracts",   label: () => `80 / 20 profit split` },
];

export function sizeLabel(c: Challenge) {
  return `${Math.round(c.startingBalanceCents / 100_000)}K`;
}

export function TierPicker({
  challenges,
  value,
  onChange,
  popularChallengeId,
  discountLabel,
  fullWidth = false,
}: {
  challenges: Challenge[];
  value: string | null;
  onChange: (challenge: Challenge) => void;
  popularChallengeId?: string;
  discountLabel?: string;
  fullWidth?: boolean;
}) {
  if (challenges.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <div className="text-sm font-medium text-[var(--text)]">No challenges available in this category</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">Pick a different challenge type above or check back shortly.</div>
      </div>
    );
  }

  const gridClass = fullWidth
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    : "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4";

  return (
    <div className={gridClass}>
      {challenges.map((c) => {
        const active = value === c.id;
        const isPopular = popularChallengeId === c.id;
        return (
          <article
            key={c.id}
            onClick={() => onChange(c)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(c);
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-[var(--surface)] p-6 transition-all cursor-pointer min-w-0",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              active
                ? "border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)] bg-[var(--primary-soft)]/40"
                : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
            )}
          >
            {active && (
              <span className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}

            {(discountLabel || isPopular) && (
              <div className="mb-5 flex items-center gap-2 flex-wrap">
                {discountLabel && (
                  <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--text)]">
                    {discountLabel}
                  </span>
                )}
                {isPopular && (
                  <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Most popular
                  </span>
                )}
              </div>
            )}

            <div className="text-sm font-medium text-[var(--text)]">{sizeLabel(c)} Evaluation</div>

            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="num-display text-4xl font-bold tracking-tight text-[var(--text)]">{formatCurrency(c.evaluationFeeCents)}</span>
              <span className="text-sm text-[var(--text-muted)]">/ one-time</span>
            </div>

            <div className="mt-1.5 text-xs text-[var(--text-muted)] truncate">
              Starting balance {formatCurrency(c.startingBalanceCents)}
            </div>

            <Section title="Evaluation rules" rows={EVAL_ROWS} challenge={c} />
            <Section title="When you're funded" rows={FUNDED_ROWS} challenge={c} />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(c);
              }}
              className={cn(
                "mt-7 inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-all",
                active
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-95"
                  : "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-3)] hover:border-[var(--border-strong)]"
              )}
            >
              {active ? "Selected" : `Choose ${sizeLabel(c)}`}
            </button>
          </article>
        );
      })}
    </div>
  );
}

function Section({ title, rows, challenge }: { title: string; rows: FeatureRow[]; challenge: Challenge }) {
  return (
    <div className="mt-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-faint)] mb-3">
        {title}
      </div>
      <ul className="space-y-2.5 text-[13px] text-[var(--text-muted)] leading-relaxed">
        {rows.map((row, i) => {
          const help = RULE_HELP[row.key];
          return (
            <li key={`${title}-${i}`} className="flex items-start gap-2 min-w-0">
              <span aria-hidden className="mt-[7px] h-1 w-1 rounded-full bg-[var(--primary)] shrink-0" />
              <span className="flex-1 min-w-0 break-words">{row.label(challenge)}</span>
              <span
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
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
}
