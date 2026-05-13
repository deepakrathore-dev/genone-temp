"use client";
import * as React from "react";
import { useCalendar } from "@/lib/queries";
import { TradingCalendar } from "@/components/calendar/TradingCalendar";
import { Skeleton } from "@genone/ui";

export default function CalendarPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = React.use(params);
  const { data, isLoading } = useCalendar(accountId);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trading Calendar</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Daily P&L and key account events. Click a day to jump to its trades.
        </p>
      </div>
      {isLoading ? <Skeleton className="h-96 w-full" /> : <TradingCalendar accountId={accountId} days={data ?? []} />}
    </div>
  );
}
