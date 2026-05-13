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
    <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]", className)}>
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
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
          <span className={cn("text-xs font-medium", delta >= 0 ? "text-success" : "text-danger")}>
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-[var(--text-faint)]">{hint}</div>}
    </div>
  );
}
