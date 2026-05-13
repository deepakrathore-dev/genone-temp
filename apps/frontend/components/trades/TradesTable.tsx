"use client";
import * as React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, formatCurrency, pnlColor, cn,
} from "@genone/ui";
import { Zap, ChevronLeft, ChevronRight, ArrowUpDown, Download } from "lucide-react";
import type { Trade } from "@genone/types";
import { format } from "date-fns";
import { toast } from "sonner";

type SortKey = "ts" | "instrument" | "side" | "size" | "pnlCents";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 25;

export function TradesTable({ trades }: { trades: Trade[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("ts");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(0);

  const sorted = React.useMemo(() => {
    const arr = [...trades];
    arr.sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [trades, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const slice = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const exportCsv = () => {
    // TODO(genone): wire to /api/exports/trades.csv when backend is up
    toast.success(`Exporting ${sorted.length} trades…`);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <span className="text-xs text-[var(--text-muted)]">{sorted.length} trades</span>
        <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-3.5 w-3.5" /> Export CSV</Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <Th label="Time" k="ts" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Th label="Instrument" k="instrument" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Th label="Side" k="side" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Th label="Size" k="size" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <TableHead>Entry</TableHead>
              <TableHead>Exit</TableHead>
              <Th label="P&L" k="pnlCents" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{format(new Date(t.ts), "MMM d, HH:mm")}</TableCell>
                <TableCell className="font-mono">{t.instrument}</TableCell>
                <TableCell>
                  <Badge variant={t.side === "BUY" ? "success" : "danger"}>{t.side}</Badge>
                </TableCell>
                <TableCell className="font-mono">{t.size}</TableCell>
                <TableCell className="font-mono text-xs">{(t.entryPriceCents / 100).toFixed(2)}</TableCell>
                <TableCell className="font-mono text-xs">{(t.exitPriceCents / 100).toFixed(2)}</TableCell>
                <TableCell className={cn("font-mono font-semibold tabular-nums", pnlColor(t.pnlCents))}>
                  {formatCurrency(t.pnlCents, { sign: true })}
                </TableCell>
                <TableCell>
                  {t.source === "PLATFORM_LIQUIDATION" ? (
                    <Badge variant="warning" className="gap-1"><Zap className="h-3 w-3" /> Auto-close</Badge>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">Trader</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {slice.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-xs text-[var(--text-muted)] py-8">No trades match the filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <ul className="md:hidden divide-y divide-[var(--border)]">
        {slice.map((t) => (
          <li key={t.id} className="px-3 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Badge variant={t.side === "BUY" ? "success" : "danger"}>{t.side}</Badge>
                <span className="font-mono">{t.instrument}</span>
                {t.source === "PLATFORM_LIQUIDATION" && <Zap className="h-3 w-3 text-[var(--warning)]" />}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                {t.size} ct · {format(new Date(t.ts), "MMM d, HH:mm")}
              </div>
            </div>
            <div className={cn("text-sm font-mono font-semibold tabular-nums", pnlColor(t.pnlCents))}>
              {formatCurrency(t.pnlCents, { sign: true })}
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 p-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
        <span>Page {page + 1} of {totalPages}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Th({
  label, k, sortKey, sortDir, onSort,
}: {
  label: string; k: SortKey; sortKey: SortKey; sortDir: SortDir; onSort: (k: SortKey) => void;
}) {
  const active = k === sortKey;
  return (
    <TableHead>
      <button
        onClick={() => onSort(k)}
        className={cn("inline-flex items-center gap-1 hover:text-[var(--text)]", active && "text-[var(--text)]")}
      >
        {label} <ArrowUpDown className="h-3 w-3 opacity-60" />
      </button>
    </TableHead>
  );
}
