"use client";
import * as React from "react";
import { cn } from "./cn";

export function Progress({
  value,
  className,
  indicatorClassName,
  max = 100,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
  max?: number;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]", className)}>
      <div
        className={cn("h-full transition-all duration-500", indicatorClassName ?? "bg-[var(--primary)]")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
