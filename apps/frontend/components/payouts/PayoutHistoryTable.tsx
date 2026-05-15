"use client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, formatCurrency, cn,
} from "@genone/ui";
import type { Payout } from "@genone/types";
import { format } from "date-fns";

const STATUS: Record<Payout["status"], { label: string; variant: "success" | "warning" | "info" | "danger" | "neutral" }> = {
  REQUESTED: { label: "Requested", variant: "warning" },
  APPROVED: { label: "Approved", variant: "info" },
  PROCESSED: { label: "Processed", variant: "info" },
  DISBURSED: { label: "Disbursed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
};

export function PayoutHistoryTable({ payouts }: { payouts: Payout[] }) {
  if (payouts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
        No payout history yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Full table — scrolls horizontally on mobile so every column is reachable. */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timeline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs">#{p.sequence}</TableCell>
              <TableCell className="font-mono text-xs">{format(new Date(p.requestedAt), "MMM d, yyyy")}</TableCell>
              <TableCell className="font-mono font-semibold">{formatCurrency(p.amountCents)}</TableCell>
              <TableCell className="text-xs text-[var(--text-muted)]">{p.method}</TableCell>
              <TableCell><Badge variant={STATUS[p.status].variant}>{STATUS[p.status].label}</Badge></TableCell>
              <TableCell>
                <Timeline payout={p} />
                {p.rejectionReason && (
                  <div className="text-[11px] text-danger mt-1 font-mono">{p.rejectionReason}</div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Timeline({ payout }: { payout: Payout }) {
  const steps = [
    { key: "REQUESTED", label: "Requested", done: !!payout.requestedAt },
    { key: "APPROVED", label: "Approved", done: !!payout.approvedAt },
    { key: "PROCESSED", label: "Processed", done: !!payout.processedAt },
    { key: "DISBURSED", label: "Disbursed", done: !!payout.disbursedAt },
  ];
  if (payout.status === "REJECTED") {
    return <span className="text-xs text-danger font-mono">Rejected</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <span key={s.key} className="flex items-center gap-1">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              s.done ? "bg-[var(--success)]" : "bg-[var(--surface-3)]"
            )}
            aria-label={s.label}
            title={s.label}
          />
          {i < steps.length - 1 && (
            <span className={cn("h-px w-4", s.done ? "bg-[var(--success)]" : "bg-[var(--surface-3)]")} />
          )}
        </span>
      ))}
    </div>
  );
}
