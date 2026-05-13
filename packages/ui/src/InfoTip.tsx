"use client";
import * as React from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { cn } from "./cn";

/**
 * Tiny (i) icon that opens a popover with a plain-English explanation.
 * Works on touch (click-to-toggle) and keyboard (focus + Enter).
 */
export function InfoTip({
  title,
  children,
  className,
  size = "sm",
  side = "top",
  align = "center",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="More info"
          className={cn(
            "inline-flex items-center justify-center rounded-full text-[var(--text-faint)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors",
            sizeClass,
            className
          )}
        >
          <Info className={iconSize} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="text-xs leading-relaxed">
        {title && (
          <div className="text-sm font-semibold text-[var(--text)] mb-1">{title}</div>
        )}
        <div className="text-[var(--text-muted)]">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
