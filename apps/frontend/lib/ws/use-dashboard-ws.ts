"use client";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectWs } from "./ws-client";
import { queryKeys } from "../queries";
import type { Account, Trade } from "@genone/types";

export function useDashboardWs(accountId: string | null | undefined) {
  const qc = useQueryClient();
  const [latestTrade, setLatestTrade] = React.useState<Trade | null>(null);

  React.useEffect(() => {
    if (!accountId) return;
    const dispose = connectWs(accountId, (event) => {
      if (event.type === "trade") {
        setLatestTrade(event.payload);
        // Optimistically merge trade into the account state cache
        qc.setQueryData<Account>(queryKeys.accountState(accountId), (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentEquityCents: prev.currentEquityCents + event.payload.pnlCents,
            todayPnlCents: prev.todayPnlCents + event.payload.pnlCents,
            todayTradesCount: prev.todayTradesCount + 1,
            cumulativePnlCents: prev.cumulativePnlCents + event.payload.pnlCents,
          };
        });
        // prepend into the trades list for the no-filter view
        qc.setQueryData<Trade[] | undefined>(queryKeys.trades(accountId, {}), (prev) =>
          prev ? [event.payload, ...prev] : prev
        );
      }
    });
    return dispose;
  }, [accountId, qc]);

  return { latestTrade };
}
