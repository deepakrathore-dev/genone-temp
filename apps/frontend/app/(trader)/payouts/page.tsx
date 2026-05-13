"use client";
import { useAccountState, usePayouts } from "@/lib/queries";
import { useSelectedAccount } from "@/lib/stores/selected-account.store";
import { PayoutRequestForm } from "@/components/payouts/PayoutRequestForm";
import { PayoutHistoryTable } from "@/components/payouts/PayoutHistoryTable";
import { Skeleton, EmptyState } from "@genone/ui";
import { Banknote } from "lucide-react";

export default function PayoutsPage() {
  const { accountId } = useSelectedAccount();
  const { data: account, isLoading: a } = useAccountState(accountId);
  const { data: payouts, isLoading: b } = usePayouts();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payouts</h1>
        <p className="text-sm text-[var(--text-muted)]">Request a withdrawal and review every disbursement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          {a || !account ? (
            <Skeleton className="h-96 w-full" />
          ) : account.type === "FUNDED" ? (
            <PayoutRequestForm account={account} />
          ) : (
            <EmptyState
              icon={Banknote}
              title="Payouts available only on funded accounts"
              description="Pass an evaluation first - your loyalty credit auto-applies on the next purchase."
            />
          )}
        </div>
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">History</h2>
          {b ? <Skeleton className="h-64 w-full" /> : <PayoutHistoryTable payouts={payouts ?? []} />}
        </div>
      </div>
    </div>
  );
}
