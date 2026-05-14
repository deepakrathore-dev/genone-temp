"use client";
import * as React from "react";
import Link from "next/link";
import { cn } from "@genone/ui";

/**
 * Card-style metric tile used on the dashboard overview. Big stat on the left,
 * "VIEW MORE" pill on the right, and a delta line at the bottom.
 */
export function MetricTile({
  label,
  value,
  href,
  delta,
  hint,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  href?: string;
  delta?: number;
  hint?: string;
  accent?: "primary" | "info" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const accentBg =
    accent === "info" ? "bg-[var(--info-soft)] text-[var(--info)]" :
    accent === "accent" ? "bg-[var(--accent-soft)] text-[var(--accent)]" :
    accent === "success" ? "bg-[var(--success-soft)] text-[var(--success)]" :
    accent === "warning" ? "bg-[var(--warning-soft)] text-[var(--warning)]" :
    accent === "danger" ? "bg-[var(--danger-soft)] text-[var(--danger)]" :
    "bg-[var(--primary-soft)] text-[var(--primary)]";

  const body = (
    <div className={cn("h-full flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] p-4 card-hover", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-[var(--text-muted)] font-medium leading-snug">{label}</span>
        {href && (
          <span className={cn("inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md", accentBg)}>
            View more
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight font-mono tabular-nums text-[var(--text)]">
        {value}
      </div>
      {(typeof delta === "number" || hint) && (
        <div className="mt-auto pt-3 text-xs text-[var(--text-muted)] flex items-baseline gap-1.5">
          {typeof delta === "number" && (
            <span className={delta >= 0 ? "text-[var(--success)] font-mono font-semibold" : "text-[var(--danger)] font-mono font-semibold"}>
              {delta >= 0 ? "+" : ""}{delta.toFixed(2)}%
            </span>
          )}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {body}
      </Link>
    );
  }
  return body;
}
