"use client";
import { Crown, Trophy, Shield } from "lucide-react";
import { cn, formatCurrency, CountryChip } from "@genone/ui";
import type { LeaderboardRow } from "@genone/types";

export function Podium({ top3 }: { top3: LeaderboardRow[] }) {
  const [first, second, third] = top3;
  return (
    <div className="grid grid-cols-3 gap-3 items-end">
      <PodiumCard row={second} place={2} className="order-1 sm:order-1 h-44" icon={Trophy} bgClass="from-slate-500/30 to-slate-500/0" />
      <PodiumCard row={first} place={1} className="order-2 sm:order-2 h-56" icon={Crown} bgClass="from-yellow-500/40 to-yellow-500/0" />
      <PodiumCard row={third} place={3} className="order-3 sm:order-3 h-36" icon={Shield} bgClass="from-amber-700/30 to-amber-700/0" />
    </div>
  );
}

function PodiumCard({
  row, place, className, icon: Icon, bgClass,
}: {
  row?: LeaderboardRow; place: number; className?: string;
  icon: React.ComponentType<{ className?: string }>; bgClass: string;
}) {
  if (!row) return <div className={className} />;
  return (
    <div className={cn("relative rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden p-4 flex flex-col items-center justify-end text-center", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-t opacity-50", bgClass)} />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <Icon className={cn(
          "h-6 w-6",
          place === 1 ? "text-yellow-400" : place === 2 ? "text-slate-300" : "text-amber-500"
        )} />
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">#{place}</div>
        <div className="text-base font-semibold flex items-center gap-2 flex-wrap justify-center">
          <span className="font-mono">{row.initials}</span>
          <CountryChip code={row.country} />
        </div>
        <div className="text-sm text-success font-mono">{formatCurrency(row.totalPnlCents, { compact: true })}</div>
      </div>
    </div>
  );
}
