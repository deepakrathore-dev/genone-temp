"use client";
import * as React from "react";
import Image from "next/image";
import { Card, CardContent, Tabs, TabsList, TabsTrigger, Skeleton, formatCurrency, formatNumber, CountryChip, cn } from "@genone/ui";
import { Podium } from "@/components/leaderboard/Podium";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { useLeaderboard } from "@/lib/queries";
import type { LeaderboardRow, TimeWindow } from "@genone/types";
import { Users } from "lucide-react";

const WINDOWS: Array<{ key: TimeWindow; label: string }> = [
  { key: "TODAY",    label: "Today" },
  { key: "WEEK",     label: "This week" },
  { key: "MONTH",    label: "This month" },
  { key: "ALL_TIME", label: "All time" },
];

export default function LeaderboardPage() {
  const [win, setWin] = React.useState<TimeWindow>("MONTH");
  const { data, isLoading } = useLeaderboard(win);

  const stats = React.useMemo(() => {
    if (!data || data.length === 0) return null;
    const totalTraders = data.length;
    const totalPnl = data.reduce((sum, r) => sum + r.totalPnlCents, 0);
    const totalTrades = data.reduce((sum, r) => sum + r.trades, 0);
    const avgWinRate = Math.round(data.reduce((sum, r) => sum + r.winRatePct, 0) / data.length);
    const topMover = [...data].sort((a, b) => b.totalPnlCents - a.totalPnlCents)[0];
    return { totalTraders, totalPnl, totalTrades, avgWinRate, topMover };
  }, [data]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Leaderboard</h1>
        </div>
        <Tabs value={win} onValueChange={(v) => setWin(v as TimeWindow)}>
          <TabsList>
            {WINDOWS.map((w) => (
              <TabsTrigger key={w.key} value={w.key}>{w.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <Podium top3={data.slice(0, 3)} />
            <LeaderboardTable rows={data.slice(0, 50)} />
          </div>

          {stats && (
            <div className="space-y-5">
              <TopMoverCard row={stats.topMover} />
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
                    Snapshot
                  </div>
                  <SummaryRow label="Total traders" value={formatNumber(stats.totalTraders)} icon={Users} />
                  <SummaryRow label="Combined P&L" value={formatCurrency(stats.totalPnl, { compact: true, sign: true })} tone={stats.totalPnl >= 0 ? "success" : "danger"} />
                  <SummaryRow label="Trades placed" value={formatNumber(stats.totalTrades)} />
                  <SummaryRow label="Avg win rate" value={`${stats.avgWinRate}%`} />
                </CardContent>
              </Card>
              <TopFiveCard rows={data.slice(0, 5)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{label}</span>
      </div>
      <div className={cn(
        "text-sm font-mono font-semibold tabular-nums",
        tone === "success" && "text-[var(--success)]",
        tone === "danger" && "text-[var(--danger)]",
        !tone && "text-[var(--text)]"
      )}>
        {value}
      </div>
    </div>
  );
}

function TopMoverCard({ row }: { row: LeaderboardRow | undefined }) {
  if (!row) return null;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)] mb-3">
          Top mover
        </div>
        <div className="flex items-center gap-3">
          <RowAvatar row={row} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-[var(--text)]">{row.initials}</span>
              <CountryChip code={row.country} size="xs" />
            </div>
            <div className={cn(
              "mt-1 font-mono font-semibold tabular-nums",
              row.totalPnlCents >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
            )}>
              {formatCurrency(row.totalPnlCents, { compact: true, sign: true })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopFiveCard({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
          Top five
        </div>
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.userId} className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-mono font-semibold text-[var(--text-muted)] border border-[var(--border)]">
                {r.rank}
              </span>
              <RowAvatar row={r} size={32} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[var(--text)] truncate flex items-center gap-1.5">
                  {r.initials}
                  <CountryChip code={r.country} size="xs" />
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)]">{r.winRatePct}% WR</div>
              </div>
              <div className={cn(
                "text-xs font-mono font-semibold tabular-nums",
                r.totalPnlCents >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
              )}>
                {formatCurrency(r.totalPnlCents, { compact: true, sign: true })}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RowAvatar({ row, size }: { row: LeaderboardRow; size: number }) {
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
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[var(--text)] font-mono">
          {row.initials.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
