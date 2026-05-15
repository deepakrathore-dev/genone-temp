"use client";
import { Card, CardContent, cn, formatCurrency } from "@genone/ui";
import type { Account } from "@genone/types";
import { Check, Sparkles, Leaf } from "lucide-react";

export function GreenDaysTracker({ account }: { account: Account }) {
  const required = account.ruleSnapshot.greenDaysRequired;
  const threshold = account.ruleSnapshot.greenDayThresholdCents;
  const achieved = Math.min(required, account.greenDaysCount);
  const remaining = Math.max(0, required - achieved);
  const completed = achieved >= required;
  const todayQualifies = account.todayPnlCents >= threshold;
  const todayProgress = Math.min(100, Math.max(0, (account.todayPnlCents / threshold) * 100));

  // Ring math
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (achieved / Math.max(1, required)) * circumference;

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)] shrink-0">
              <Leaf className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
                Green days
              </div>
              <div className="text-sm text-[var(--text)] mt-0.5">
                Day qualifies at <span className="font-mono font-semibold">{formatCurrency(threshold)}</span>+ P&amp;L
              </div>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider shrink-0",
              completed
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]"
            )}
          >
            {completed ? <Sparkles className="h-3 w-3" /> : <Leaf className="h-3 w-3" />}
            {completed ? "Payout ready" : `${remaining} to go`}
          </span>
        </div>

        {/* Hero — ring + counter */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="relative shrink-0" style={{ height: size, width: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--surface-3)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--success)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dash}
                style={{ transition: "stroke-dashoffset 500ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="num-display text-2xl font-bold tabular-nums text-[var(--text)] leading-none">
                {achieved}
                <span className="text-sm text-[var(--text-muted)]">/{required}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)] font-semibold mt-1">
                days
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-sm text-[var(--text)] leading-relaxed">
              {completed
                ? "All five green days accumulated. You can submit a payout request."
                : `${remaining} more qualifying day${remaining === 1 ? "" : "s"} until you can request a payout.`}
            </div>
            <div className="text-xs text-[var(--text-muted)] font-mono">
              5 green days · {formatCurrency(threshold)}+ P&amp;L each
            </div>
          </div>
        </div>

        {/* Day pills — compact, no longer huge cards */}
        <div className="flex items-center gap-2">
          {Array.from({ length: required }).map((_, i) => {
            const filled = i < achieved;
            const isNext = !filled && i === achieved;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 h-9 rounded-full border flex items-center justify-center gap-1.5 text-[11px] font-mono font-semibold transition-all",
                  filled
                    ? "bg-[var(--success-soft)] border-[var(--success)]/40 text-[var(--success)]"
                    : isNext
                      ? "bg-[var(--surface-2)] border-[var(--success)]/40 text-[var(--text)] ring-1 ring-[var(--success)]/20"
                      : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-faint)]"
                )}
                title={filled ? `Day ${i + 1} — qualified` : isNext ? "Today's target" : `Day ${i + 1}`}
              >
                {filled ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Today snapshot — shown only while still accumulating */}
        {!completed && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3 space-y-2">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-faint)] font-semibold">
                  Today
                </span>
                {todayQualifies && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--success)]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    Qualifies
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-mono font-semibold tabular-nums",
                  account.todayPnlCents > 0
                    ? "text-[var(--success)]"
                    : account.todayPnlCents < 0
                      ? "text-[var(--danger)]"
                      : "text-[var(--text-muted)]"
                )}
              >
                {formatCurrency(account.todayPnlCents, { sign: true })}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  todayQualifies ? "bg-[var(--success)]" : "bg-[var(--primary)]"
                )}
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>{todayProgress.toFixed(0)}% of {formatCurrency(threshold)}</span>
              
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
