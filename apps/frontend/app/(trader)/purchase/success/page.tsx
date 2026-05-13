"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Badge, Separator, Skeleton, formatCurrency,
} from "@genone/ui";
import { CheckCircle2, KeyRound, LayoutDashboard, Mail, Download } from "lucide-react";
import { toast } from "sonner";

export default function PurchaseSuccessPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <SuccessInner />
    </React.Suspense>
  );
}

function SuccessInner() {
  const search = useSearchParams();
  const id = search.get("id") ?? "-";
  const accountId = search.get("accountId") ?? "";
  const tier = (search.get("tier") ?? "100K") as "50K" | "100K" | "150K";
  const totalCents = Number(search.get("total") ?? 0);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="text-center">
        <CardHeader className="items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)] mb-2">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Payment confirmed</CardTitle>
          <CardDescription>
            Your {tier} evaluation is being provisioned. Rithmic credentials are on their way.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-left">
            <Field label="Receipt" value={id} mono />
            <Field label="Account" value={accountId} mono />
            <Field label="Tier" value={`${tier} Evaluation`} />
            <Field label="Charged" value={formatCurrency(totalCents)} mono />
          </div>
          <Separator />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" /> Open dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile/accounts">
                <KeyRound className="h-4 w-4" /> Show credentials
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => toast.success("Receipt emailed")}>
              <Mail className="h-4 w-4" /> Email receipt
            </Button>
            <Button variant="ghost" onClick={() => toast.success("PDF downloaded")}>
              <Download className="h-4 w-4" /> PDF receipt
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What happens next</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Step n={1} title="Connect your front-end" body="Use the Rithmic credentials we just emailed in R|Trader Pro, NinjaTrader, Quantower, TradeSea, Onyx Trader, or any other Rithmic-compatible platform." />
          <Step n={2} title="Hit your profit target" body={`Reach the ${tier === "50K" ? "$3,000" : tier === "100K" ? "$6,000" : "$9,000"} target without breaching the EOD drawdown or the daily loss limit.`} />
          <Step n={3} title="Get funded" body="On pass, your funded account is auto-created and we'll email you. Funded rules + buffer kick in immediately." />
          <Step n={4} title="Request payouts" body="Once you've built buffer + 5 green days, request payouts straight from the dashboard. Bank transfer in 2–3 business days." />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-[var(--text-faint)]">
        A copy of this receipt has been sent to your email. <Badge variant="outline">SAQ-A</Badge> Card data was tokenised by NMI.
      </p>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5 rounded-lg border border-[var(--border)] p-3 bg-[var(--surface-2)]/40">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm font-medium"}>{value}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold">{n}</span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-[var(--text-muted)] leading-relaxed">{body}</div>
      </div>
    </div>
  );
}
