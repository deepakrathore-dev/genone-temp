"use client";
import Image from "next/image";
import {
  Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  formatCurrency, formatNumber, cn, CountryChip,
} from "@genone/ui";
import type { LeaderboardRow } from "@genone/types";

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Trader</TableHead>
                <TableHead className="text-right">Total P&L</TableHead>
                <TableHead className="text-right">Win rate</TableHead>
                <TableHead className="text-right">Trades</TableHead>
                <TableHead className="text-right">Avg win</TableHead>
                <TableHead className="text-right">Avg loss</TableHead>
                <TableHead className="text-right">Profit factor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.userId}>
                  <TableCell>
                    <RankPill rank={r.rank} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar row={r} size={36} />
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text)] truncate">{r.initials}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <CountryChip code={r.country} size="xs" />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={cn("text-right font-mono font-semibold tabular-nums", r.totalPnlCents >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]")}>
                    {formatCurrency(r.totalPnlCents, { compact: true, sign: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <WinRateBar pct={r.winRatePct} />
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatNumber(r.trades)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-[var(--success)] tabular-nums">{formatCurrency(r.avgWinCents)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-[var(--danger)] tabular-nums">{formatCurrency(r.avgLossCents)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold tabular-nums">{r.profitFactor.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile */}
        <ul className="md:hidden divide-y divide-[var(--border)]">
          {rows.map((r) => (
            <li key={r.userId} className="p-4 flex items-center gap-3">
              <RankPill rank={r.rank} />
              <Avatar row={r} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text)]">{r.initials}</span>
                  <CountryChip code={r.country} size="xs" />
                </div>
                <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                  {r.winRatePct}% WR · {r.trades} trades · PF {r.profitFactor.toFixed(2)}
                </div>
              </div>
              <div className={cn("text-sm font-mono font-semibold tabular-nums", r.totalPnlCents >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]")}>
                {formatCurrency(r.totalPnlCents, { compact: true })}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RankPill({ rank }: { rank: number }) {
  const top = rank <= 3;
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-[40px] items-center justify-center rounded-full px-2 text-[11px] font-mono font-semibold tabular-nums",
        top
          ? rank === 1
            ? "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#0c0b10]"
            : rank === 2
              ? "bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border-strong)]"
              : "bg-[#b4530933] text-[#f5b400] border border-[#b4530966]"
          : "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]"
      )}
    >
      #{rank}
    </span>
  );
}

function WinRateBar({ pct }: { pct: number }) {
  return (
    <div className="inline-flex items-center gap-2 justify-end">
      <div className="font-mono tabular-nums w-12 text-right">{pct}%</div>
      <div className="h-1.5 w-20 rounded-full bg-[var(--surface-3)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            background: pct >= 60 ? "var(--success)" : pct >= 50 ? "var(--primary)" : "var(--warning)",
          }}
        />
      </div>
    </div>
  );
}

function Avatar({ row, size }: { row: LeaderboardRow; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-[var(--surface-2)] border border-[var(--border)]"
      style={{ height: size, width: size }}
    >
      {row.avatarUrl ? (
        <Image
          src={row.avatarUrl}
          alt={`${row.initials} avatar`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white"
          style={{ background: avatarGradient(row.userId) }}
        >
          {row.initials.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

function avatarGradient(userId: string): string {
  const palette = [
    "linear-gradient(135deg, #5BA8E5, #3B7BAA)",
    "linear-gradient(135deg, #f59e0b, #b45309)",
    "linear-gradient(135deg, #10b981, #047857)",
    "linear-gradient(135deg, #ec4899, #9d174d)",
    "linear-gradient(135deg, #8b5cf6, #5b21b6)",
    "linear-gradient(135deg, #06b6d4, #155e75)",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length]!;
}
