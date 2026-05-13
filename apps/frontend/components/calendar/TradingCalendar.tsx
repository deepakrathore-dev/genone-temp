"use client";
import * as React from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Button, cn, formatCurrency,
  Tooltip, TooltipContent, TooltipTrigger,
} from "@genone/ui";
import { ChevronLeft, ChevronRight, Zap, Flag, Trophy, Banknote, Clock } from "lucide-react";
import type { CalendarDay } from "@genone/types";
import { addMonths, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { useRouter } from "next/navigation";

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FORCE_LIQUIDATION: Zap,
  HOLIDAY: Flag,
  MILESTONE_PASS: Trophy,
  MILESTONE_PAYOUT: Banknote,
  INACTIVITY_WARNING: Clock,
};

export function TradingCalendar({ accountId, days }: { accountId: string; days: CalendarDay[] }) {
  const router = useRouter();
  const [view, setView] = React.useState<"PNL" | "EVENTS">("PNL");
  const [cursor, setCursor] = React.useState<Date>(new Date("2026-05-01"));

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const firstDayOfWeek = getDay(monthStart);

  const daysInMonth: CalendarDay[] = [];
  for (let d = monthStart.getDate(); d <= monthEnd.getDate(); d++) {
    const dateStr = format(new Date(monthStart.getFullYear(), monthStart.getMonth(), d), "yyyy-MM-dd");
    const found = days.find((x) => x.date === dateStr);
    daysInMonth.push(
      found ?? { date: dateStr, pnlCents: 0, tradesCount: 0, events: [] }
    );
  }

  const maxAbs = Math.max(1, ...daysInMonth.map((d) => Math.abs(d.pnlCents)));

  const goToTradesForDay = (dateStr: string) => {
    router.push(`/dashboard/${accountId}/trades?from=${dateStr}&to=${dateStr}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCursor((c) => addMonths(c, -1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-base font-mono">{format(cursor, "MMMM yyyy")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="PNL">PNL</TabsTrigger>
            <TabsTrigger value="EVENTS">Events</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {/* Desktop grid */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`pad-${i}`} className="h-20 rounded-md bg-[var(--surface-2)]/40" />
            ))}
            {daysInMonth.map((d) => {
              const intensity = Math.min(1, Math.abs(d.pnlCents) / maxAbs);
              const bg = d.pnlCents === 0
                ? "bg-[var(--surface-2)]"
                : d.pnlCents > 0
                  ? `var(--success-soft)`
                  : `var(--danger-soft)`;
              return (
                <Tooltip key={d.date}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => goToTradesForDay(d.date)}
                      className={cn(
                        "relative h-20 rounded-md p-2 border text-left transition-colors hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
                        d.pnlCents > 0
                          ? "border-[var(--success)]/30"
                          : d.pnlCents < 0
                            ? "border-[var(--danger)]/30"
                            : "border-[var(--border)]"
                      )}
                      style={{
                        backgroundColor: bg,
                        opacity: view === "PNL" ? 0.4 + intensity * 0.6 : 1,
                      }}
                    >
                      <div className="text-[11px] font-mono font-medium">{Number(d.date.slice(-2))}</div>
                      {view === "PNL" ? (
                        d.pnlCents !== 0 && (
                          <div
                            className={cn(
                              "absolute bottom-1 left-2 right-2 text-[11px] font-mono font-semibold truncate",
                              d.pnlCents > 0 ? "text-success" : "text-danger"
                            )}
                          >
                            {formatCurrency(d.pnlCents, { sign: true, compact: true })}
                          </div>
                        )
                      ) : (
                        <div className="absolute bottom-1 left-2 right-2 flex gap-1 flex-wrap">
                          {d.events.slice(0, 3).map((ev) => {
                            const Icon = EVENT_ICONS[ev] ?? Flag;
                            return <Icon key={ev} className="h-3 w-3 text-[var(--text-muted)]" />;
                          })}
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="font-medium">{format(new Date(d.date), "MMM d, yyyy")}</div>
                    <div className="font-mono">
                      {d.tradesCount} trade{d.tradesCount === 1 ? "" : "s"} · {formatCurrency(d.pnlCents, { sign: true })}
                    </div>
                    {d.events.length > 0 && (
                      <div className="text-[var(--text-muted)] mt-1">{d.events.join(", ")}</div>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Mobile vertical list */}
        <ul className="sm:hidden divide-y divide-[var(--border)]">
          {daysInMonth.map((d) => (
            <li key={d.date}>
              <button
                onClick={() => goToTradesForDay(d.date)}
                className="w-full flex items-center justify-between gap-3 py-3 text-left"
              >
                <div>
                  <div className="text-sm font-medium">{format(new Date(d.date), "EEE, MMM d")}</div>
                  <div className="text-xs text-[var(--text-muted)] font-mono">{d.tradesCount} trades</div>
                </div>
                <div className={cn(
                  "text-sm font-mono font-semibold",
                  d.pnlCents > 0 ? "text-success" : d.pnlCents < 0 ? "text-danger" : "text-[var(--text-muted)]"
                )}>
                  {formatCurrency(d.pnlCents, { sign: true })}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
