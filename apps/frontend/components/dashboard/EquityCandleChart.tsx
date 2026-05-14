"use client";
import * as React from "react";
import {
  Card, CardContent,
  Tabs, TabsList, TabsTrigger,
  formatCurrency, cn,
} from "@genone/ui";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { useCalendar } from "@/lib/queries";
import type { Account, CalendarDay } from "@genone/types";
import { format, parseISO } from "date-fns";

type Range = "7D" | "30D" | "90D";

const RANGE_DAYS: Record<Range, number> = { "7D": 7, "30D": 30, "90D": 90 };

interface CandleDatum {
  date: string;
  label: string;
  open: number;
  close: number;
  high: number;
  low: number;
  bodyLow: number;
  bodyHigh: number;
  pnl: number;
  trades: number;
  positive: boolean;
}

export function EquityCandleChart({ account }: { account: Account }) {
  const { data: days } = useCalendar(account.id);
  const [range, setRange] = React.useState<Range>("30D");

  const data = React.useMemo<CandleDatum[]>(() => {
    if (!days || days.length === 0) return [];
    const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
    const sliced = sorted.slice(-RANGE_DAYS[range]);
    // Walk backwards from current equity so the last close matches the live account.
    const closes: number[] = [];
    let close = account.currentEquityCents;
    for (let i = sliced.length - 1; i >= 0; i--) {
      closes[i] = close;
      close -= sliced[i]!.pnlCents;
    }
    return sliced.map((d, i): CandleDatum => {
      const closeC = closes[i]!;
      const openC = closeC - d.pnlCents;
      // Synthesize a plausible intraday range for the wick. Roughly 50% of the
      // body magnitude in each direction, with a floor so flat days still have
      // a visible wick.
      const wick = Math.max(Math.abs(d.pnlCents) * 0.4, account.startingBalanceCents * 0.002);
      const high = Math.max(openC, closeC) + wick;
      const low = Math.min(openC, closeC) - wick;
      const bodyLow = Math.min(openC, closeC);
      const bodyHigh = Math.max(openC, closeC);
      return {
        date: d.date,
        label: format(parseISO(d.date), "MMM d"),
        open: openC,
        close: closeC,
        high,
        low,
        bodyLow,
        bodyHigh,
        pnl: d.pnlCents,
        trades: d.tradesCount,
        positive: d.pnlCents >= 0,
      };
    });
  }, [days, range, account.currentEquityCents, account.startingBalanceCents]);

  const range_pnl = data.reduce((sum, d) => sum + d.pnl, 0);
  const wins = data.filter((d) => d.pnl > 0).length;
  const losses = data.filter((d) => d.pnl < 0).length;
  const winRate = data.length ? Math.round((wins / Math.max(1, wins + losses)) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
              Equity curve
            </div>
            <div className="mt-1 flex items-baseline gap-3 flex-wrap">
              <span className="num-display text-3xl font-bold text-[var(--text)] tabular-nums">
                {formatCurrency(account.currentEquityCents)}
              </span>
              <span className={cn(
                "font-mono text-sm font-semibold tabular-nums",
                range_pnl >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
              )}>
                {formatCurrency(range_pnl, { sign: true, compact: true })} over {range}
              </span>
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)] font-mono">
              {wins} winning · {losses} losing day{losses === 1 ? "" : "s"} · {winRate}% hit rate
            </div>
          </div>
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList>
              <TabsTrigger value="7D">7D</TabsTrigger>
              <TabsTrigger value="30D">30D</TabsTrigger>
              <TabsTrigger value="90D">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {data.length === 0 ? (
          <div className="h-64 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 flex items-center justify-center text-sm text-[var(--text-muted)]">
            No trading activity for this range yet.
          </div>
        ) : (
          <div className="h-72 w-full -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-faint)", fontSize: 11, fontFamily: "ui-monospace, monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  minTickGap={range === "90D" ? 32 : 12}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v, { compact: true })}
                  tick={{ fill: "var(--text-faint)", fontSize: 11, fontFamily: "ui-monospace, monospace" }}
                  tickLine={false}
                  axisLine={false}
                  width={68}
                  domain={["dataMin - 100", "dataMax + 100"]}
                />
                <ReferenceLine
                  y={account.startingBalanceCents}
                  stroke="var(--text-faint)"
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                  label={{
                    value: "Starting balance",
                    fill: "var(--text-faint)",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
                <ReferenceLine
                  y={account.drawdownFloorCents}
                  stroke="var(--danger)"
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                  label={{
                    value: "Drawdown floor",
                    fill: "var(--danger)",
                    fontSize: 10,
                    position: "insideBottomRight",
                  }}
                />
                {/* Wicks: full high → low range */}
                <Bar
                  dataKey={(d: CandleDatum) => [d.low, d.high]}
                  fill="transparent"
                  shape={(props: { x?: number; width?: number; payload?: CandleDatum; y?: number; height?: number }) => {
                    const { x = 0, width = 0, payload, y = 0, height = 0 } = props;
                    if (!payload) return <g />;
                    const cx = x + width / 2;
                    return (
                      <line
                        x1={cx}
                        x2={cx}
                        y1={y}
                        y2={y + height}
                        stroke={payload.positive ? "var(--success)" : "var(--danger)"}
                        strokeWidth={1.25}
                        opacity={0.85}
                      />
                    );
                  }}
                  isAnimationActive={false}
                />
                {/* Bodies: bodyLow → bodyHigh */}
                <Bar
                  dataKey={(d: CandleDatum) => [d.bodyLow, d.bodyHigh]}
                  barSize={Math.max(4, Math.min(18, 320 / Math.max(1, data.length)))}
                  radius={[3, 3, 3, 3]}
                  isAnimationActive={false}
                >
                  {data.map((d, i) => (
                    <Cell
                      key={`body-${i}`}
                      fill={d.positive ? "var(--success)" : "var(--danger)"}
                      fillOpacity={d.pnl === 0 ? 0.25 : 0.85}
                    />
                  ))}
                </Bar>
                {/* Equity line tracing the closes */}
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="var(--primary)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: "var(--primary)" }}
                  isAnimationActive={false}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border-strong)", strokeWidth: 1, strokeDasharray: "3 3" }}
                  content={<CandleTooltip />}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] font-mono">
          <Legend dot="var(--success)" label="Winning day" />
          <Legend dot="var(--danger)" label="Losing day" />
          <Legend dot="var(--primary)" label="Closing equity" />
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
      {label}
    </span>
  );
}

function CandleTooltip({
  active, payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CandleDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl shadow-[var(--shadow-pop)] p-3 text-xs min-w-[180px]">
      <div className="font-medium text-[var(--text)]">{format(parseISO(d.date), "EEE, MMM d")}</div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
        <span className="text-[var(--text-muted)]">Open</span>
        <span className="text-[var(--text)] text-right">{formatCurrency(d.open)}</span>
        <span className="text-[var(--text-muted)]">Close</span>
        <span className="text-[var(--text)] text-right">{formatCurrency(d.close)}</span>
        <span className="text-[var(--text-muted)]">P&L</span>
        <span className={cn("text-right font-semibold", d.positive ? "text-[var(--success)]" : "text-[var(--danger)]")}>
          {formatCurrency(d.pnl, { sign: true })}
        </span>
        <span className="text-[var(--text-muted)]">Trades</span>
        <span className="text-[var(--text)] text-right">{d.trades}</span>
      </div>
    </div>
  );
}
