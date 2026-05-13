"use client";
import { Check, X } from "lucide-react";
import { cn } from "@genone/ui";
import type { GateStatus } from "@genone/types";

type GateKey = keyof Omit<GateStatus, "details">;

const ROWS: Array<{ key: GateKey; label: string; sub: string }> = [
  { key: "kyc", label: "KYC verification", sub: "Veriff identity check + AML screening" },
  { key: "buffer", label: "Buffer built", sub: "Drawdown amount + $100" },
  { key: "greenDays", label: "5 green days", sub: "$200+ P&L per qualifying day" },
  { key: "consistency", label: "Consistency", sub: "No day > 50% of cumulative profit" },
  { key: "fraudFlags", label: "No fraud flags", sub: "Coordinated trading detection" },
  { key: "dailyCap", label: "Within daily cap", sub: "Cumulative payout under daily limit" },
];

export function GateChecklist({ gate, eligible }: { gate: GateStatus; eligible: boolean }) {
  return (
    <ul className="divide-y divide-[var(--border)]">
      {ROWS.map((r) => {
        const passed = gate[r.key] === "PASS";
        const detail = gate.details?.[r.key];
        return (
          <li key={r.key} className="flex items-start gap-3 py-3">
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                passed ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"
              )}
            >
              {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-xs text-[var(--text-muted)]">{r.sub}</div>
              {detail && !passed && (
                <div className="text-xs text-[var(--danger)] mt-0.5">{detail}</div>
              )}
            </div>
          </li>
        );
      })}
      <li className={cn("pt-3 text-xs font-mono", eligible ? "text-success" : "text-danger")}>
        {eligible
          ? "All gates passed - you can submit a payout request."
          : "Resolve the failing gates above before requesting a payout."}
      </li>
    </ul>
  );
}
