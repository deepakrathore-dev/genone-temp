"use client";
import * as React from "react";
import { useTrades } from "@/lib/queries";
import { TradesTable } from "@/components/trades/TradesTable";
import { TradeFilters } from "@/components/trades/TradeFilters";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@genone/ui";

export default function TradesPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = React.use(params);
  const search = useSearchParams();
  const instrument = search.get("instrument") ?? undefined;
  const side = search.get("side") ?? undefined;
  const from = search.get("from") ?? undefined;
  const to = search.get("to") ?? undefined;

  const filters = React.useMemo(
    () => ({
      instrument: instrument && instrument !== "ALL" ? instrument : undefined,
      side: side && side !== "ALL" ? side : undefined,
      from,
      to,
    }),
    [instrument, side, from, to]
  );

  const { data, isLoading } = useTrades(accountId, filters);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trade history</h1>
        <p className="text-sm text-[var(--text-muted)]">Every executed and force-closed trade on this account.</p>
      </div>
      <TradeFilters />
      {isLoading ? <Skeleton className="h-64 w-full" /> : <TradesTable trades={data ?? []} />}
    </div>
  );
}
