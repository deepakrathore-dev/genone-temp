"use client";
import * as React from "react";
import {
  Card, CardContent,
  formatCurrency, cn,
} from "@genone/ui";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useCalendar } from "@/lib/queries";
import type { Account } from "@genone/types";
import { format, parseISO } from "date-fns";

interface Point {
  date: string;
  label: string;
  distance: number;
  pnl: number;
  zone: "safe" | "watch" | "danger";
}

export function DrawdownIndicator({ account }: { account: Account }) {
  const { data: days } = useCalendar(account.id);

  const series = React.useMemo<Point[]>(() => {
    if (!days || days.length === 0) return [];
    const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
    // Walk backwards so the last point matches the live distance-to-floor.
    const equities: number[] = [];
    let eq = account.currentEquityCents;
    for (let i = sorted.length - 1; i >= 0; i--) {
      equities[i] = eq;
      eq -= sorted[i]!.pnlCents;
    }
    return sorted.map((d, i): Point => {
      const distance = equities[i]! - account.drawdownFloorCents;
      const distancePct = (distance / account.ruleSnapshot.drawdownCents) * 100;
      const zone: Point["zone"] =
        distancePct > 60 ? "safe" : distancePct > 30 ? "watch" : "danger";
      return {
        date: d.date,
        label: format(parseISO(d.date), "MMM d"),
        distance: Math.max(0, distance),
        pnl: d.pnlCents,
        zone,
      };
    });
  }, [days, account.currentEquityCents, account.drawdownFloorCents, account.ruleSnapshot.drawdownCents]);

  const currentDistance = account.currentEquityCents - account.drawdownFloorCents;
  const currentDistancePct = Math.max(0, Math.min(100,
    (currentDistance / account.ruleSnapshot.drawdownCents) * 100
  ));
  const zone: Point["zone"] =
    currentDistancePct > 60 ? "safe" : currentDistancePct > 30 ? "watch" : "danger";
  const zoneColor: Record<Point["zone"], string> = {
    safe: "var(--success)",
    watch: "var(--warning)",
    danger: "var(--danger)",
  };
  const zoneLabel: Record<Point["zone"], string> = {
    safe: "Plenty of room",
    watch: "Watch closely",
    danger: "Approaching the floor",
  };
  const dangerThreshold = account.ruleSnapshot.drawdownCents * 0.3;

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
              EOD drawdown headroom
            </div>
            
          </div>
         
        </div>

        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <span className="num-display text-3xl font-bold tabular-nums" style={{ color: zoneColor[zone] }}>
              {formatCurrency(currentDistance, { sign: true })}
            </span>
            <span className="ml-2 text-sm text-[var(--text-muted)] font-mono">to the floor</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] font-mono">
            Floor {formatCurrency(account.drawdownFloorCents)} · Allowance {formatCurrency(account.ruleSnapshot.drawdownCents)}
          </div>
        </div>

        {series.length === 0 ? (
          <div className="h-44 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 flex items-center justify-center text-sm text-[var(--text-muted)]">
            No 30-day history yet.
          </div>
        ) : (
          <div className="h-44 w-full -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dd-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  minTickGap={28}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v, { compact: true })}
                  tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  domain={[0, "dataMax + 50"]}
                />
                <ReferenceLine
                  y={dangerThreshold}
                  stroke="var(--danger)"
                  strokeDasharray="3 3"
                  label={{
                    value: "Danger zone",
                    position: "insideBottomLeft",
                    fill: "var(--danger)",
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="distance"
                  stroke="var(--primary)"
                  strokeWidth={1.75}
                  fill="url(#dd-fill)"
                  isAnimationActive={false}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border-strong)", strokeWidth: 1, strokeDasharray: "3 3" }}
                  content={<DDTooltip />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-[var(--text-muted)]">
          <ZoneChip color="var(--success)" label="Safe" hint=">60% room" active={zone === "safe"} />
          <ZoneChip color="var(--warning)" label="Watch" hint="30 – 60%" active={zone === "watch"} />
          <ZoneChip color="var(--danger)"  label="Danger" hint="<30%" active={zone === "danger"} />
        </div>
      </CardContent>
    </Card>
  );
}

function ZoneChip({ color, label, hint, active }: { color: string; label: string; hint: string; active: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2.5 py-2 transition-colors",
        active ? "border-[var(--border-strong)] bg-[var(--surface-2)]" : "border-[var(--border)] bg-transparent opacity-60"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <span style={{ color: active ? color : "var(--text-muted)" }} className="font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-0.5 text-[10px]">{hint}</div>
    </div>
  );
}

function DDTooltip({
  active, payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0]!.payload;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl shadow-[var(--shadow-pop)] p-3 text-xs min-w-[170px]">
      <div className="font-medium text-[var(--text)]">{format(parseISO(p.date), "EEE, MMM d")}</div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
        <span className="text-[var(--text-muted)]">Room</span>
        <span className="text-[var(--text)] text-right">{formatCurrency(p.distance)}</span>
        <span className="text-[var(--text-muted)]">P&L</span>
        <span className={cn("text-right font-semibold", p.pnl >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]")}>
          {formatCurrency(p.pnl, { sign: true })}
        </span>
      </div>
    </div>
  );
}
