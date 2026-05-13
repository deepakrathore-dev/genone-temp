"use client";
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@genone/ui";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

const INSTRUMENTS = ["", "ES 03-2026", "NQ 03-2026", "CL 03-2026", "GC 03-2026", "6E 03-2026", "NGX25", "ZB 03-2026"];

export function TradeFilters() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const setParam = (k: string, v?: string) => {
    const p = new URLSearchParams(params.toString());
    if (!v) p.delete(k); else p.set(k, v);
    router.replace(`${path}?${p.toString()}`);
  };
  const reset = () => router.replace(path);
  const instrument = params.get("instrument") ?? "";
  const side = params.get("side") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const active = Boolean(instrument || side || from || to);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Instrument</label>
        <Select value={instrument} onValueChange={(v) => setParam("instrument", v || undefined)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            {INSTRUMENTS.map((s) => <SelectItem key={s || "all"} value={s || "ALL"}>{s || "All"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Side</label>
        <Select value={side} onValueChange={(v) => setParam("side", v === "ALL" ? undefined : v)}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="BUY">Buy</SelectItem>
            <SelectItem value="SELL">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">From</label>
        <Input type="date" value={from} onChange={(e) => setParam("from", e.target.value || undefined)} className="w-[150px]" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">To</label>
        <Input type="date" value={to} onChange={(e) => setParam("to", e.target.value || undefined)} className="w-[150px]" />
      </div>
      {active && (
        <Button variant="ghost" size="sm" onClick={reset}>
          <X className="h-3.5 w-3.5" /> Reset
        </Button>
      )}
    </div>
  );
}
