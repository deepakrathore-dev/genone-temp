"use client";
import * as React from "react";
import { useSymbolAnalytics } from "@/lib/queries";
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button, Input, Skeleton, formatCurrency, formatNumber, cn,
} from "@genone/ui";
import { ArrowUpDown, Download } from "lucide-react";
import { toast } from "sonner";
import type { SymbolAnalyticsRow } from "@genone/types";

type SortKey = keyof SymbolAnalyticsRow;

export default function SymbolsPage() {
  const { data, isLoading } = useSymbolAnalytics();
  const [sortKey, setSortKey] = React.useState<SortKey>("totalTrades");
  const [dir, setDir] = React.useState<"asc" | "desc">("desc");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const rows = React.useMemo(() => {
    const arr = [...(data ?? [])];
    arr.sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [data, sortKey, dir]);

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <TableHead>
      <button onClick={() => { if (k === sortKey) setDir((d) => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setDir("desc"); } }} className={cn("inline-flex items-center gap-1", k === sortKey && "text-[var(--text)]")}>
        {label} <ArrowUpDown className="h-3 w-3 opacity-60" />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Symbol analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">Per-symbol trade metrics across the platform.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 space-y-0">
          <CardTitle className="text-sm">Date range</CardTitle>
          <div className="flex gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <Th k="symbol" label="Symbol" />
                  <Th k="totalTrades" label="Total Trades" />
                  <Th k="totalProfitCents" label="Total Profit" />
                  <Th k="totalLossCents" label="Total Loss" />
                  <Th k="avgProfitCents" label="Avg Profit" />
                  <Th k="avgLossCents" label="Avg Loss" />
                  <Th k="lossToProfitRatio" label="L/P Ratio" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.symbol}>
                    <TableCell className="font-mono">{r.symbol}</TableCell>
                    <TableCell className="font-mono">{formatNumber(r.totalTrades)}</TableCell>
                    <TableCell className="font-mono text-success">{formatCurrency(r.totalProfitCents)}</TableCell>
                    <TableCell className="font-mono text-danger">{formatCurrency(r.totalLossCents)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(r.avgProfitCents)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(r.avgLossCents)}</TableCell>
                    <TableCell className="font-mono">{r.lossToProfitRatio.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
