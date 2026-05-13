"use client";
import { useMySubscriptions, useSubscriptionProducts } from "@/lib/queries";
import { useSubscribe, useCancelMySubscription } from "@/lib/mutations";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Skeleton, formatCurrency, formatDate, EmptyState,
} from "@genone/ui";
import { Repeat, Sparkles } from "lucide-react";
import type { SubscriptionStatus } from "@genone/types";

const STATUS_VARIANT: Record<SubscriptionStatus, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success",
  PAST_DUE: "warning",
  CANCELLED: "neutral",
  SUSPENDED: "danger",
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELLED: "Cancelled",
  SUSPENDED: "Suspended",
};

export default function TraderSubscriptionsPage() {
  const { data: subs, isLoading: loadingSubs } = useMySubscriptions();
  const { data: products, isLoading: loadingProducts } = useSubscriptionProducts();
  const subscribe = useSubscribe();
  const cancel = useCancelMySubscription();

  const subscribedProductIds = new Set((subs ?? []).filter((s) => s.status === "ACTIVE" || s.status === "PAST_DUE").map((s) => s.productId));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add-ons & subscriptions</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Optional monthly tools and data services. Billed via NMI on the 1st of each month.
        </p>
      </div>

      {/* My subscriptions */}
      <section>
        <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">My subscriptions</h2>
        {loadingSubs ? <Skeleton className="h-32" /> : (subs ?? []).length === 0 ? (
          <EmptyState icon={Repeat} title="No active subscriptions" description="Browse the catalogue below and pick something useful." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(subs ?? []).map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold">{s.productName}</span>
                    <Badge variant={STATUS_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono space-y-0.5">
                    <div>{formatCurrency(s.priceCents)}/month · started {formatDate(s.startedAt)}</div>
                    <div>
                      {s.status === "CANCELLED"
                        ? `Cancelled ${s.cancelledAt ? formatDate(s.cancelledAt) : ""}`
                        : `Next charge ${formatDate(s.nextBillingAt)}`}
                    </div>
                    {s.failedAttempts > 0 && (
                      <div className="text-warning">{s.failedAttempts} failed attempt{s.failedAttempts === 1 ? "" : "s"} - update card to retry.</div>
                    )}
                  </div>
                  {(s.status === "ACTIVE" || s.status === "PAST_DUE") && (
                    <Button size="sm" variant="ghost" onClick={() => cancel.mutate(s.id)}>
                      Cancel subscription
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Catalogue */}
      <section>
        <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 mt-6">Available add-ons</h2>
        {loadingProducts ? <Skeleton className="h-48" /> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(products ?? []).map((p) => {
              const subscribed = subscribedProductIds.has(p.id);
              return (
                <Card key={p.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                      {p.name}
                    </CardTitle>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    <div className="text-3xl font-mono font-bold">
                      {formatCurrency(p.priceCents)}<span className="text-sm font-normal text-[var(--text-muted)]">/mo</span>
                    </div>
                    <Button
                      className="w-full"
                      disabled={subscribed || subscribe.isPending}
                      onClick={() => subscribe.mutate(p.id)}
                    >
                      {subscribed ? "Already subscribed" : "Subscribe"}
                    </Button>
                    <p className="text-[10px] text-[var(--text-faint)]">
                      Cancel anytime. No mid-cycle refund by default.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
