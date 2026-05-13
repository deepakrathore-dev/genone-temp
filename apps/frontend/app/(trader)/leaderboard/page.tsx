"use client";
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, Skeleton } from "@genone/ui";
import { Podium } from "@/components/leaderboard/Podium";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { useLeaderboard } from "@/lib/queries";
import type { TimeWindow } from "@genone/types";

export default function LeaderboardPage() {
  const [win, setWin] = React.useState<TimeWindow>("MONTH");
  const { data, isLoading } = useLeaderboard(win);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          The top performers on Gen One Futures. Names are shown as initials to respect trader privacy.
        </p>
      </div>
      <Tabs value={win} onValueChange={(v) => setWin(v as TimeWindow)}>
        <TabsList>
          <TabsTrigger value="TODAY">Today</TabsTrigger>
          <TabsTrigger value="WEEK">Week</TabsTrigger>
          <TabsTrigger value="MONTH">Month</TabsTrigger>
          <TabsTrigger value="ALL_TIME">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading || !data ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <Podium top3={data.slice(0, 3)} />
          <LeaderboardTable rows={data.slice(0, 50)} />
        </>
      )}
    </div>
  );
}
