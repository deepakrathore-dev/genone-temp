"use client";
import { useAccountState } from "@/lib/queries";
import { useSelectedAccount } from "@/lib/stores/selected-account.store";
import { useDashboardWs } from "@/lib/ws/use-dashboard-ws";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { HeadlineMetrics } from "@/components/dashboard/HeadlineMetrics";
import { DrawdownIndicator } from "@/components/dashboard/DrawdownIndicator";
import { DailyLossIndicator } from "@/components/dashboard/DailyLossIndicator";
import { ProfitTargetRing } from "@/components/dashboard/ProfitTargetRing";
import { GreenDaysTracker } from "@/components/dashboard/GreenDaysTracker";
import { BufferIndicator } from "@/components/dashboard/BufferIndicator";
import { InactivityTimer } from "@/components/dashboard/InactivityTimer";
import { ConsistencyStatus } from "@/components/dashboard/ConsistencyStatus";
import { RecentTradesList } from "@/components/dashboard/RecentTradesList";
import { RulesPanel } from "@/components/dashboard/RulesPanel";
import { Button, EmptyState, Skeleton } from "@genone/ui";
import { LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { accountId } = useSelectedAccount();
  const { data: account, isLoading } = useAccountState(accountId);
  useDashboardWs(accountId);

  if (!accountId) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="No account yet"
        description="Buy your first evaluation to start trading. Already have one? Pick it from the account switcher above."
        action={
          <Button asChild>
            <Link href="/purchase">
              <Plus className="h-4 w-4" /> Buy a challenge
            </Link>
          </Button>
        }
      />
    );
  }

  if (isLoading || !account) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-4">
        <StatusBanner account={account} />
        <HeadlineMetrics account={account} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DrawdownIndicator account={account} />
          <DailyLossIndicator account={account} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ProfitTargetRing account={account} />
          <GreenDaysTracker account={account} />
        </div>
        {account.type === "FUNDED" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BufferIndicator account={account} />
            <ConsistencyStatus account={account} />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InactivityTimer account={account} />
          <div className="hidden md:block" />
        </div>
        <RecentTradesList accountId={account.id} />
      </div>
      <RulesPanel account={account} />
    </div>
  );
}
