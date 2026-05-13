"use client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  formatCurrency, formatNumber, cn,
} from "@genone/ui";
import type { LeaderboardRow } from "@genone/types";

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Trader</TableHead>
              <TableHead>Total P&L</TableHead>
              <TableHead>Win Rate</TableHead>
              <TableHead>Trades</TableHead>
              <TableHead>Avg Win</TableHead>
              <TableHead>Avg Loss</TableHead>
              <TableHead>Profit Factor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.userId}>
                <TableCell className="font-mono">#{r.rank}</TableCell>
                <TableCell>
                  <span className="font-mono">{r.initials}</span>{" "}
                  <span aria-label={r.country}>{r.countryFlag}</span>
                </TableCell>
                <TableCell className={cn("font-mono font-semibold", r.totalPnlCents >= 0 ? "text-success" : "text-danger")}>
                  {formatCurrency(r.totalPnlCents, { compact: true, sign: true })}
                </TableCell>
                <TableCell className="font-mono">{r.winRatePct}%</TableCell>
                <TableCell className="font-mono">{formatNumber(r.trades)}</TableCell>
                <TableCell className="font-mono text-success text-xs">{formatCurrency(r.avgWinCents)}</TableCell>
                <TableCell className="font-mono text-danger text-xs">{formatCurrency(r.avgLossCents)}</TableCell>
                <TableCell className="font-mono">{r.profitFactor.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <ul className="sm:hidden divide-y divide-[var(--border)]">
        {rows.map((r) => (
          <li key={r.userId} className="p-3 flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-muted)] w-8">#{r.rank}</span>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm">{r.initials} {r.countryFlag}</div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                {r.winRatePct}% WR · {r.trades} trades · PF {r.profitFactor}
              </div>
            </div>
            <div className={cn("text-sm font-mono font-semibold", r.totalPnlCents >= 0 ? "text-success" : "text-danger")}>
              {formatCurrency(r.totalPnlCents, { compact: true })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
