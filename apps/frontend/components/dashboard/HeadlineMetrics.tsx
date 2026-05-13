"use client";
import { StatTile, formatCurrency, formatNumber } from "@genone/ui";
import type { Account } from "@genone/types";

export function HeadlineMetrics({ account }: { account: Account }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatTile
        label="Current Equity"
        value={formatCurrency(account.currentEquityCents)}
        hint={`Starting balance ${formatCurrency(account.startingBalanceCents)}`}
      />
      <StatTile
        label="Today P&L"
        value={formatCurrency(account.todayPnlCents, { sign: true })}
        hint={`Cumulative ${formatCurrency(account.cumulativePnlCents, { sign: true })}`}
        className={
          account.todayPnlCents > 0
            ? "border-[var(--success)]/30"
            : account.todayPnlCents < 0
              ? "border-[var(--danger)]/30"
              : undefined
        }
      />
      <StatTile
        label="Today Trades"
        value={formatNumber(account.todayTradesCount)}
        hint={`Max contracts ${account.ruleSnapshot.maxContracts}`}
      />
    </div>
  );
}
