"use client";
import * as React from "react";
import {
  Card, CardContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  cn, formatCurrency,
  Tooltip, TooltipContent, TooltipTrigger,
} from "@genone/ui";
import {
  ChevronLeft, ChevronRight, Zap, Flag, Trophy, Banknote, Clock,
} from "lucide-react";
import type { CalendarDay, CalendarEvent } from "@genone/types";
import { addMonths, endOfMonth, format, getDay, isSameDay, parseISO, startOfMonth } from "date-fns";
import { useRouter } from "next/navigation";

type ViewMode = "Monthly" | "Weekly" | "Daily";

interface FilterCategory {
  key: "wins" | "losses" | "flat" | "events";
  label: string;
  color: string;
}

const FILTERS: FilterCategory[] = [
  { key: "wins",   label: "Winning days", color: "var(--success)" },
  { key: "losses", label: "Losing days",  color: "var(--danger)" },
  { key: "flat",   label: "No trades",    color: "var(--text-faint)" },
  { key: "events", label: "Key events",   color: "var(--info)" },
];

const EVENT_META: Record<CalendarEvent, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  FORCE_LIQUIDATION:   { icon: Zap,      label: "Force liquidation", color: "var(--danger)" },
  HOLIDAY:             { icon: Flag,     label: "Market holiday",    color: "var(--warning)" },
  MILESTONE_PASS:      { icon: Trophy,   label: "Evaluation passed", color: "var(--success)" },
  MILESTONE_PAYOUT:    { icon: Banknote, label: "Payout milestone",  color: "var(--primary)" },
  INACTIVITY_WARNING:  { icon: Clock,    label: "Inactivity warning", color: "var(--warning)" },
};

export function TradingCalendar({ accountId, days }: { accountId: string; days: CalendarDay[] }) {
  const router = useRouter();
  const [view, setView] = React.useState<ViewMode>("Monthly");
  const [cursor, setCursor] = React.useState<Date>(new Date("2026-05-01"));
  const [enabled, setEnabled] = React.useState<Record<FilterCategory["key"], boolean>>({
    wins: true, losses: true, flat: true, events: true,
  });

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const firstDayOfWeek = getDay(monthStart);

  const daysInMonth: CalendarDay[] = React.useMemo(() => {
    const out: CalendarDay[] = [];
    for (let d = monthStart.getDate(); d <= monthEnd.getDate(); d++) {
      const dateStr = format(new Date(monthStart.getFullYear(), monthStart.getMonth(), d), "yyyy-MM-dd");
      const found = days.find((x) => x.date === dateStr);
      out.push(found ?? { date: dateStr, pnlCents: 0, tradesCount: 0, events: [] });
    }
    return out;
  }, [days, monthStart, monthEnd]);

  const stats = React.useMemo(() => {
    let wins = 0, losses = 0, flat = 0, events = 0, totalPnl = 0;
    for (const d of daysInMonth) {
      if (d.pnlCents > 0) wins++;
      else if (d.pnlCents < 0) losses++;
      else flat++;
      events += d.events.length;
      totalPnl += d.pnlCents;
    }
    return { wins, losses, flat, events, totalPnl };
  }, [daysInMonth]);

  const maxAbs = Math.max(1, ...daysInMonth.map((d) => Math.abs(d.pnlCents)));

  const goToTradesForDay = (dateStr: string) => {
    router.push(`/dashboard/${accountId}/trades?from=${dateStr}&to=${dateStr}`);
  };

  const isDayVisible = (d: CalendarDay) => {
    if (d.events.length > 0 && enabled.events) return true;
    if (d.pnlCents > 0) return enabled.wins;
    if (d.pnlCents < 0) return enabled.losses;
    return enabled.flat;
  };

  const today = new Date();
  const isToday = (dateStr: string) => isSameDay(parseISO(dateStr), today);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
      <Card className="overflow-hidden">
        <CardContent className="p-5 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCursor(new Date())}
                className="h-9 inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-3)] hover:border-[var(--border-strong)]"
              >
                Today
              </button>
              <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-0.5">
                <button
                  onClick={() => setCursor((c) => addMonths(c, -1))}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCursor((c) => addMonths(c, 1))}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="text-base sm:text-lg font-semibold tracking-tight text-[var(--text)]">
                {format(cursor, "MMMM yyyy")}
              </div>
              <Select value={view} onValueChange={(v) => setView(v as ViewMode)}>
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 text-[11px] uppercase tracking-wider text-[var(--text-faint)] font-semibold">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`pad-${i}`} className="h-24 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40" />
            ))}
            {daysInMonth.map((d) => {
              const visible = isDayVisible(d);
              const positive = d.pnlCents > 0;
              const negative = d.pnlCents < 0;
              const intensity = Math.min(1, Math.abs(d.pnlCents) / maxAbs);
              const dayNum = Number(d.date.slice(-2));
              const todayRing = isToday(d.date);

              return (
                <Tooltip key={d.date}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => goToTradesForDay(d.date)}
                      disabled={!visible}
                      className={cn(
                        "relative h-24 rounded-xl p-2 border text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] min-w-0",
                        !visible && "opacity-30 cursor-not-allowed",
                        positive && visible && "border-[var(--success)]/30 hover:border-[var(--success)]/60",
                        negative && visible && "border-[var(--danger)]/30 hover:border-[var(--danger)]/60",
                        !positive && !negative && "border-[var(--border)] hover:border-[var(--border-strong)]",
                        todayRing && "ring-2 ring-[var(--primary)]"
                      )}
                      style={{
                        backgroundColor: positive
                          ? "var(--success-soft)"
                          : negative
                            ? "var(--danger-soft)"
                            : "var(--surface-2)",
                        opacity: visible ? Math.max(0.55, 0.4 + intensity * 0.6) : 0.3,
                      }}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className={cn(
                          "text-[12px] font-mono font-semibold",
                          todayRing ? "text-[var(--primary)]" : "text-[var(--text)]"
                        )}>
                          {dayNum}
                        </div>
                        {d.events.length > 0 && (
                          <div className="flex gap-0.5">
                            {d.events.slice(0, 2).map((ev) => {
                              const meta = EVENT_META[ev];
                              const Icon = meta.icon;
                              return (
                                <span
                                  key={ev}
                                  className="inline-flex h-4 w-4 items-center justify-center rounded-full"
                                  style={{ color: meta.color, background: "var(--surface)" }}
                                >
                                  <Icon className="h-2.5 w-2.5" />
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {d.pnlCents !== 0 && (
                        <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-0.5">
                          <span
                            className={cn(
                              "text-[12px] font-mono font-semibold truncate",
                              positive ? "text-[var(--success)]" : "text-[var(--danger)]"
                            )}
                          >
                            {formatCurrency(d.pnlCents, { sign: true, compact: true })}
                          </span>
                          {d.tradesCount > 0 && (
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">
                              {d.tradesCount} trade{d.tradesCount === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="font-medium">{format(parseISO(d.date), "EEEE, MMM d")}</div>
                    <div className="font-mono text-xs mt-0.5">
                      {d.tradesCount} trade{d.tradesCount === 1 ? "" : "s"} · {formatCurrency(d.pnlCents, { sign: true })}
                    </div>
                    {d.events.length > 0 && (
                      <div className="text-[var(--text-muted)] text-xs mt-1">
                        {d.events.map((e) => EVENT_META[e].label).join(", ")}
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Mobile vertical list */}
          <ul className="sm:hidden divide-y divide-[var(--border)]">
            {daysInMonth.filter(isDayVisible).map((d) => (
              <li key={d.date}>
                <button
                  onClick={() => goToTradesForDay(d.date)}
                  className="w-full flex items-center justify-between gap-3 py-3 text-left"
                >
                  <div>
                    <div className="text-sm font-medium">{format(parseISO(d.date), "EEE, MMM d")}</div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">{d.tradesCount} trade{d.tradesCount === 1 ? "" : "s"}</div>
                  </div>
                  <div className={cn(
                    "text-sm font-mono font-semibold",
                    d.pnlCents > 0 ? "text-[var(--success)]" : d.pnlCents < 0 ? "text-[var(--danger)]" : "text-[var(--text-muted)]"
                  )}>
                    {formatCurrency(d.pnlCents, { sign: true })}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Right rail */}
      <div className="space-y-5">
        <MiniMonth cursor={cursor} onPick={(d) => setCursor(d)} daysWithActivity={daysInMonth} />

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
              This month
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <SummaryRow label="Total P&L" value={formatCurrency(stats.totalPnl, { sign: true, compact: true })} tone={stats.totalPnl >= 0 ? "success" : "danger"} />
              <SummaryRow label="Wins" value={`${stats.wins} day${stats.wins === 1 ? "" : "s"}`} tone="success" />
              <SummaryRow label="Losses" value={`${stats.losses} day${stats.losses === 1 ? "" : "s"}`} tone="danger" />
              <SummaryRow label="Events" value={String(stats.events)} tone="muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
              Filters
            </div>
            <ul className="space-y-1.5">
              {FILTERS.map((f) => {
                const on = enabled[f.key];
                return (
                  <li key={f.key}>
                    <button
                      type="button"
                      onClick={() => setEnabled((e) => ({ ...e, [f.key]: !e[f.key] }))}
                      aria-pressed={on}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-left transition-colors",
                        on ? "text-[var(--text)] hover:bg-[var(--surface-2)]" : "text-[var(--text-faint)] hover:bg-[var(--surface-2)]"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn("h-4 w-4 rounded-md border flex items-center justify-center transition-colors")}
                        style={{
                          backgroundColor: on ? f.color : "transparent",
                          borderColor: on ? f.color : "var(--border-strong)",
                        }}
                      >
                        {on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </span>
                      <span className="flex-1">{f.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
              Event legend
            </div>
            <ul className="space-y-2">
              {(Object.keys(EVENT_META) as CalendarEvent[]).map((ev) => {
                const meta = EVENT_META[ev];
                const Icon = meta.icon;
                return (
                  <li key={ev} className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ color: meta.color, background: "var(--surface-2)" }}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <span>{meta.label}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone: "success" | "danger" | "muted" }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)] font-semibold">{label}</div>
      <div className={cn(
        "mt-1 font-mono font-semibold tabular-nums",
        tone === "success" && "text-[var(--success)]",
        tone === "danger" && "text-[var(--danger)]",
        tone === "muted" && "text-[var(--text)]"
      )}>
        {value}
      </div>
    </div>
  );
}

function MiniMonth({
  cursor,
  onPick,
  daysWithActivity,
}: {
  cursor: Date;
  onPick: (d: Date) => void;
  daysWithActivity: CalendarDay[];
}) {
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const firstDayOfWeek = getDay(monthStart);
  const today = new Date();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-[var(--text)]">{format(cursor, "MMM yyyy")}</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPick(addMonths(cursor, -1))}
              className="h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onPick(addMonths(cursor, 1))}
              className="h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
              aria-label="Next month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wider text-[var(--text-faint)] font-semibold mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`mini-pad-${i}`} />
          ))}
          {Array.from({ length: monthEnd.getDate() }).map((_, i) => {
            const dayNum = i + 1;
            const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNum);
            const dateStr = format(date, "yyyy-MM-dd");
            const activity = daysWithActivity.find((d) => d.date === dateStr);
            const positive = (activity?.pnlCents ?? 0) > 0;
            const negative = (activity?.pnlCents ?? 0) < 0;
            const isToday = isSameDay(date, today);
            return (
              <button
                key={dayNum}
                onClick={() => onPick(date)}
                className={cn(
                  "relative h-7 w-7 mx-auto inline-flex items-center justify-center rounded-full text-[11px] font-mono",
                  isToday
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold"
                    : "text-[var(--text)] hover:bg-[var(--surface-2)]"
                )}
              >
                {dayNum}
                {(positive || negative) && !isToday && (
                  <span
                    aria-hidden
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                    style={{ backgroundColor: positive ? "var(--success)" : "var(--danger)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Check({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
