"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./cn";

export interface StatTileProps {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  className?: string;
}

export function StatTile({ label, value, delta, hint, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "card-hover rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] font-semibold">{label}</div>
      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="text-2xl font-semibold font-mono tabular-nums tracking-tight text-[var(--text)]"
          >
            {value}
          </motion.div>
        </AnimatePresence>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
              delta >= 0
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            )}
          >
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <div className="mt-1.5 text-xs text-[var(--text-faint)] leading-snug">{hint}</div>}
    </div>
  );
}
