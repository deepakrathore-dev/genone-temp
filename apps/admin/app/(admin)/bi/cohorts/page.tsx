"use client";
import { useCohortRetention, usePayoutCohort } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Button } from "@genone/ui";
import { CohortHeatmap } from "@/components/bi/CohortHeatmap";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function CohortsPage() {
  const retention = useCohortRetention();
  const payoutCohort = usePayoutCohort();

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cohort analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">Daily computation at 02:00 UTC.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Retention by signup month</CardTitle>
          <p className="text-xs text-[var(--text-muted)]">% of cohort still trading by time-since-signup bucket. Intensity scales to breach rate.</p>
        </CardHeader>
        <CardContent>
          {retention.isLoading || !retention.data ? <Skeleton className="h-48" /> : (
            <CohortHeatmap rows={retention.data} label="Signup month →" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payout progression by cohort</CardTitle>
          <p className="text-xs text-[var(--text-muted)]">% of cohort that reached each payout sequence.</p>
        </CardHeader>
        <CardContent>
          {payoutCohort.isLoading || !payoutCohort.data ? <Skeleton className="h-48" /> : (
            <CohortHeatmap rows={payoutCohort.data} label="Signup month →" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
