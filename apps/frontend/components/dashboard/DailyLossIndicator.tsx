"use client";
import { Card, CardContent, cn, formatCurrency } from "@genone/ui";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Account } from "@genone/types";
import { ShieldAlert } from "lucide-react";

export function DailyLossIndicator({ account }: { account: Account }) {
  const limit = account.ruleSnapshot.dailyLossCents;
  const used = Math.max(0, -account.todayPnlCents);
  const remaining = Math.max(0, limit - used);
  const pct = limit === 0 ? 0 : Math.min(100, (used / limit) * 100);
  const tone =
    pct < 50 ? "var(--success)"
    : pct < 80 ? "var(--warning)"
    : "var(--danger)";
  const toneLabel =
    pct < 50 ? "Comfortable"
    : pct < 80 ? "Tighten up"
    : "Near lockout";

  const data = used === 0 && remaining === 0
    ? [{ name: "Remaining", value: 1 }]
    : [
        { name: "Used", value: used },
        { name: "Remaining", value: Math.max(remaining, used === 0 ? limit : 0.0001) },
      ];

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
              Daily loss limit
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
              Soft cap. Account locks for the rest of the session at breach - resumes 6:00 PM ET.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: `color-mix(in srgb, ${tone} 18%, transparent)`, color: tone }}
          >
            <ShieldAlert className="h-3 w-3" />
            {toneLabel}
          </span>
        </div>

        <div className="grid grid-cols-[160px_1fr] gap-5 items-center">
          <div className="relative h-40 w-40 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius="68%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={used > 0 && remaining > 0 ? 2 : 0}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {data.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.name === "Used" ? tone : "var(--surface-3)"}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)] font-semibold">Used</div>
              <div className={cn("num-display text-2xl font-bold tabular-nums")} style={{ color: tone }}>
                {pct.toFixed(0)}%
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">of limit</div>
            </div>
          </div>

          <div className="space-y-3">
            <LegendRow
              dot={tone}
              label="Used today"
              value={used > 0 ? `-${formatCurrency(used)}` : formatCurrency(0)}
              valueClass="text-[var(--danger)]"
            />
            <LegendRow
              dot="var(--surface-3)"
              ring
              label="Remaining"
              value={formatCurrency(remaining)}
              valueClass="text-[var(--text)]"
            />
            <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] font-mono flex items-center justify-between">
              <span>Daily allowance</span>
              <span className="text-[var(--text)] font-semibold">{formatCurrency(limit)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LegendRow({
  dot, ring, label, value, valueClass,
}: {
  dot: string;
  ring?: boolean;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span
          aria-hidden
          className={cn("h-2.5 w-2.5 rounded-full", ring && "border border-[var(--border-strong)]")}
          style={{ background: ring ? "transparent" : dot }}
        />
        {label}
      </span>
      <span className={cn("font-mono font-semibold tabular-nums text-sm", valueClass)}>{value}</span>
    </div>
  );
}
