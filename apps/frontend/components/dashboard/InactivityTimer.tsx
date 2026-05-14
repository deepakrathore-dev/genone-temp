"use client";
import { Card, CardContent, cn, formatDate } from "@genone/ui";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { differenceInDays, formatDistanceToNowStrict } from "date-fns";
import type { Account } from "@genone/types";

export function InactivityTimer({ account }: { account: Account }) {
  const reset = new Date(account.inactivityResetAt);
  const elapsed = Math.max(0, differenceInDays(new Date(), reset));
  const limit = account.ruleSnapshot.inactivityDays;
  const remaining = Math.max(0, limit - elapsed);
  const pct = limit === 0 ? 0 : Math.min(100, (elapsed / limit) * 100);

  const zoneColor =
    pct < 50 ? "var(--success)"
    : pct < 75 ? "var(--warning)"
    : "var(--danger)";
  const zoneLabel =
    pct < 50 ? "Healthy cadence"
    : pct < 75 ? "Approaching the gap"
    : "At risk of closure";
  const ZoneIcon =
    pct < 50 ? CheckCircle2
    : pct < 75 ? Clock
    : AlertTriangle;

  // Ring geometry
  const size = 132;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;
  const lastActiveAgo = formatDistanceToNowStrict(reset, { addSuffix: true });

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
              Inactivity countdown
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed max-w-[28ch]">
              Any trade resets the clock. After {limit} idle days the evaluation closes automatically.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: `color-mix(in srgb, ${zoneColor} 18%, transparent)`, color: zoneColor }}
          >
            <ZoneIcon className="h-3 w-3" />
            {zoneLabel}
          </span>
        </div>

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
                stroke={zoneColor}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 500ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="num-display text-3xl font-bold tabular-nums text-[var(--text)] leading-none">
                {remaining}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">
                day{remaining === 1 ? "" : "s"} left
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1 min-w-[180px]">
            <Row
              label="Idle for"
              value={`${elapsed} / ${limit} days`}
            />
            <Row
              label="Last trade"
              value={lastActiveAgo}
            />
            <Row
              label="Resets"
              value="on next trade"
              hint={formatDate(account.inactivityResetAt)}
            />
            <div
              className="mt-1 h-1.5 rounded-full overflow-hidden bg-[var(--surface-3)]"
              role="progressbar"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: zoneColor }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={cn("text-right")}>
        <span className="text-[var(--text)] font-medium">{value}</span>
        {hint && <span className="block text-[10px] text-[var(--text-faint)] font-mono">{hint}</span>}
      </span>
    </div>
  );
}
