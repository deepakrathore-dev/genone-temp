"use client";
import Image from "next/image";
import { Crown } from "lucide-react";
import { cn, formatCurrency, CountryChip } from "@genone/ui";
import type { LeaderboardRow } from "@genone/types";

interface PodiumStyle {
  ringClass: string;
  chipClass: string;
  glowStyle: React.CSSProperties;
}

const STYLES: Record<1 | 2 | 3, PodiumStyle> = {
  1: {
    ringClass: "ring-[#f5b400]/55",
    chipClass: "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#0c0b10]",
    glowStyle: {
      background:
        "radial-gradient(circle at 50% 0%, rgba(245,191,21,0.30), transparent 65%)",
    },
  },
  2: {
    ringClass: "ring-[var(--text-muted)]/35",
    chipClass: "bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border-strong)]",
    glowStyle: {
      background:
        "radial-gradient(circle at 50% 0%, rgba(148,163,184,0.22), transparent 65%)",
    },
  },
  3: {
    ringClass: "ring-[#b45309]/45",
    chipClass: "bg-[#b45309]/20 text-[#f5b400] border border-[#b45309]/50",
    glowStyle: {
      background:
        "radial-gradient(circle at 50% 0%, rgba(180,83,9,0.22), transparent 65%)",
    },
  },
};

export function Podium({ top3 }: { top3: LeaderboardRow[] }) {
  const [first, second, third] = top3;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
      <PodiumCard row={second} place={2} elevated={false} />
      <PodiumCard row={first}  place={1} elevated={true} />
      <PodiumCard row={third}  place={3} elevated={false} />
    </div>
  );
}

function PodiumCard({
  row,
  place,
  elevated,
}: {
  row?: LeaderboardRow;
  place: 1 | 2 | 3;
  elevated: boolean;
}) {
  if (!row) return <div className="hidden sm:block" />;
  const style = STYLES[place];
  const avatarSize = elevated ? 88 : 72;
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden p-6 flex flex-col items-center text-center transition-transform",
        elevated && "sm:-mt-4"
      )}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-32" style={style.glowStyle} />

      {place === 1 && (
        <Crown
          aria-hidden
          className="absolute top-3 left-1/2 -translate-x-1/2 h-5 w-5 text-[#f5b400]"
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 pt-3">
        <div
          className={cn(
            "relative rounded-full ring-4 overflow-hidden bg-[var(--surface-2)]",
            style.ringClass
          )}
          style={{ height: avatarSize, width: avatarSize }}
        >
          {row.avatarUrl ? (
            <Image
              src={row.avatarUrl}
              alt={`${row.initials} avatar`}
              fill
              sizes={`${avatarSize}px`}
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[var(--text)] font-mono">
              {row.initials}
            </div>
          )}
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
            style.chipClass
          )}
        >
          Rank #{place}
        </span>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="font-mono font-semibold text-[var(--text)]">{row.initials}</span>
          <CountryChip code={row.country} />
        </div>

        <div
          className={cn(
            "font-mono font-semibold tabular-nums",
            elevated ? "text-2xl" : "text-xl",
            row.totalPnlCents >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
          )}
        >
          {formatCurrency(row.totalPnlCents, { compact: true, sign: true })}
        </div>

        <div className="text-[11px] text-[var(--text-muted)] font-mono">
          {row.winRatePct}% WR · PF {row.profitFactor.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
