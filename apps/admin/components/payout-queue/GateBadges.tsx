"use client";
import { Tooltip, TooltipTrigger, TooltipContent, cn } from "@genone/ui";
import type { GateStatus } from "@genone/types";

const GATES: Array<{ key: keyof Omit<GateStatus, "details">; short: string }> = [
  { key: "kyc", short: "KYC" },
  { key: "buffer", short: "BUF" },
  { key: "greenDays", short: "GD" },
  { key: "consistency", short: "CON" },
  { key: "fraudFlags", short: "FF" },
  { key: "dailyCap", short: "DC" },
];

export function GateBadges({ gate }: { gate: GateStatus }) {
  return (
    <div className="flex gap-1">
      {GATES.map((g) => {
        const pass = gate[g.key] === "PASS";
        return (
          <Tooltip key={g.key}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border",
                  pass
                    ? "bg-[var(--success-soft)] text-[var(--success)] border-transparent"
                    : "bg-[var(--danger-soft)] text-[var(--danger)] border-transparent"
                )}
              >
                {g.short}
              </span>
            </TooltipTrigger>
            <TooltipContent>{gate.details?.[g.key] ?? (pass ? "Pass" : "Fail")}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
