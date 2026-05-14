"use client";
import * as React from "react";
import { Card, CardContent, cn, formatCurrency, formatNumber } from "@genone/ui";
import { Wallet, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Account } from "@genone/types";

export function HeadlineMetrics({ account }: { account: Account }) {
  const pnlPositive = account.todayPnlCents > 0;
  const pnlNegative = account.todayPnlCents < 0;
  const cumulativePositive = account.cumulativePnlCents >= 0;
  const equityDelta = account.currentEquityCents - account.startingBalanceCents;
  const equityPct = (equityDelta / account.startingBalanceCents) * 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Tile
        label="Current equity"
        icon={Wallet}
        accent="primary"
        value={formatCurrency(account.currentEquityCents)}
        chip={
          <DeltaChip
            value={formatCurrency(equityDelta, { sign: true, compact: true })}
            tone={equityDelta >= 0 ? "success" : "danger"}
            secondary={`${equityPct >= 0 ? "+" : ""}${equityPct.toFixed(2)}% vs start`}
          />
        }
        footer={`Starting balance ${formatCurrency(account.startingBalanceCents)}`}
      />
      <Tile
        label="Today P&L"
        icon={TrendingUp}
        accent={pnlPositive ? "success" : pnlNegative ? "danger" : "muted"}
        valueClassName={
          pnlPositive ? "text-[var(--success)]"
          : pnlNegative ? "text-[var(--danger)]"
          : undefined
        }
        value={formatCurrency(account.todayPnlCents, { sign: true })}
        chip={
          <DeltaChip
            value={formatCurrency(account.cumulativePnlCents, { sign: true, compact: true })}
            tone={cumulativePositive ? "success" : "danger"}
            secondary="cumulative"
          />
        }
        footer={
          pnlPositive ? "On the green side today"
          : pnlNegative ? "In the red - daily loss watch"
          : "Flat session"
        }
      />
      <Tile
        label="Today trades"
        icon={Activity}
        accent="info"
        value={formatNumber(account.todayTradesCount)}
        chip={
          <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            Max {account.ruleSnapshot.maxContracts} contracts
          </span>
        }
        footer={
          account.todayTradesCount === 0
            ? "No trades placed yet today"
            : `${account.todayTradesCount} trade${account.todayTradesCount === 1 ? "" : "s"} executed`
        }
      />
    </div>
  );
}

const ACCENT_BG: Record<"primary" | "success" | "danger" | "info" | "muted", string> = {
  primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  danger:  "bg-[var(--danger-soft)]  text-[var(--danger)]",
  info:    "bg-[var(--info-soft)]    text-[var(--info)]",
  muted:   "bg-[var(--surface-2)]    text-[var(--text-muted)]",
};

const ACCENT_BORDER: Record<"primary" | "success" | "danger" | "info" | "muted", string> = {
  primary: "var(--primary)",
  success: "var(--success)",
  danger:  "var(--danger)",
  info:    "var(--info)",
  muted:   "var(--border-strong)",
};

function Tile({
  label, value, icon: Icon, accent, chip, footer, valueClassName,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "success" | "danger" | "info" | "muted";
  chip?: React.ReactNode;
  footer?: string;
  valueClassName?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: ACCENT_BORDER[accent], opacity: 0.6 }}
      />
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
            {label}
          </span>
          <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl", ACCENT_BG[accent])}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className={cn("num-display text-3xl font-bold tabular-nums text-[var(--text)]", valueClassName)}>
          {value}
        </div>
        {chip && <div>{chip}</div>}
        {footer && <div className="text-xs text-[var(--text-muted)] leading-relaxed">{footer}</div>}
      </CardContent>
    </Card>
  );
}

function DeltaChip({
  value, tone, secondary,
}: {
  value: string;
  tone: "success" | "danger";
  secondary?: string;
}) {
  const Icon = tone === "success" ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono font-semibold tabular-nums",
          tone === "success" ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"
        )}
      >
        <Icon className="h-3 w-3" />
        {value}
      </span>
      {secondary && <span className="text-[11px] text-[var(--text-muted)] font-mono">{secondary}</span>}
    </div>
  );
}
