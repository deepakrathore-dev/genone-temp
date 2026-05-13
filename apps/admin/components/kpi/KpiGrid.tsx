"use client";
import { StatTile, formatCurrency, formatNumber, formatPercent, Skeleton } from "@genone/ui";
import { useKpis } from "@/lib/queries";

export function KpiGrid() {
  const { data, isLoading } = useKpis();
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {data.map((k) => (
        <StatTile key={k.label} label={k.label} value={formatValue(k.value, k.formatter)} delta={k.delta} />
      ))}
    </div>
  );
}

function formatValue(value: number | string, formatter?: string): string {
  if (typeof value === "string") return value;
  if (formatter === "currency") return formatCurrency(value);
  if (formatter === "percent") return formatPercent(value);
  if (formatter === "number") return formatNumber(value);
  return String(value);
}
