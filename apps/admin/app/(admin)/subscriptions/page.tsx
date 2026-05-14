"use client";
import * as React from "react";
import { useSubscriptions, useSubscriptionAttempts, useSubscriptionProducts } from "@/lib/queries";
import { useRetrySubscription, useCancelSubscription } from "@/lib/mutations";
import { RoleGate, useCan } from "@/components/global/RoleGate";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, StatTile, Skeleton, formatCurrency, formatDate,
} from "@genone/ui";
import { Repeat, RotateCcw, X } from "lucide-react";
import type { SubscriptionStatus } from "@genone/types";

const STATUS_VARIANT: Record<SubscriptionStatus, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success",
  PAST_DUE: "warning",
  CANCELLED: "neutral",
  SUSPENDED: "danger",
};

export default function SubscriptionsAdminPage() {
  return (
    <RoleGate permission="subscriptions.view" fallback="deny">
      <Inner />
    </RoleGate>
  );
}

function Inner() {
  const { data: subs, isLoading } = useSubscriptions();
  const { data: attempts } = useSubscriptionAttempts();
  const { data: products } = useSubscriptionProducts();
  const canWrite = useCan("subscriptions.write");
  const retry = useRetrySubscription();
  const cancel = useCancelSubscription();

  const active = (subs ?? []).filter((s) => s.status === "ACTIVE");
  const mrrCents = active.reduce((sum, s) => sum + s.priceCents, 0);
  const pastDue = (subs ?? []).filter((s) => s.status === "PAST_DUE");
  const cancelled = (subs ?? []).filter((s) => s.status === "CANCELLED");

  // Naive churn: cancelled in last 30d / active 30d ago
  const churnPct = active.length === 0 ? 0 : Math.round((cancelled.length / Math.max(1, active.length + cancelled.length)) * 100);

  const failedAttempts = (attempts ?? []).filter((a) => a.result === "FAILED");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Recurring add-on products billed monthly. Failed charges enter a three-attempt dunning cycle before the subscription is suspended.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Active subs" value={String(active.length)} />
        <StatTile label="MRR" value={formatCurrency(mrrCents)} />
        <StatTile label="Past due" value={String(pastDue.length)} hint="Dunning in progress" />
        <StatTile label="Churn (30d)" value={`${churnPct}%`} />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed payments ({failedAttempts.length})</TabsTrigger>
          <TabsTrigger value="products">Products ({products?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="all">All ({(subs ?? []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card><CardContent className="p-0">
            {isLoading ? <Skeleton className="h-64 m-4" /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Next billing</TableHead><TableHead>Started</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.userId}</TableCell>
                      <TableCell>{s.productName}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(s.priceCents)}/mo</TableCell>
                      <TableCell className="font-mono text-xs">{formatDate(s.nextBillingAt)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatDate(s.startedAt)}</TableCell>
                      <TableCell>
                        {canWrite && (
                          <Button size="sm" variant="ghost" onClick={() => cancel.mutate(s.id)}>
                            <X className="h-3.5 w-3.5" /> Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead><TableHead>Subscription</TableHead><TableHead>Amount</TableHead><TableHead>Reason</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedAttempts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{formatDate(a.ts, "datetime")}</TableCell>
                    <TableCell className="font-mono text-xs">{a.subscriptionId}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.amountCents)}</TableCell>
                    <TableCell><Badge variant="danger">{a.failureReason}</Badge></TableCell>
                    <TableCell>
                      {canWrite && (
                        <Button size="sm" variant="outline" onClick={() => retry.mutate(a.subscriptionId)}>
                          <RotateCcw className="h-3.5 w-3.5" /> Retry charge
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {failedAttempts.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-xs text-[var(--text-muted)] py-6">No failed payments - dunning queue is empty.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(products ?? []).map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <Badge variant={p.active ? "success" : "neutral"}>{p.active ? "Active" : "Disabled"}</Badge>
                  </div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold">{formatCurrency(p.priceCents)}<span className="text-sm font-normal text-[var(--text-muted)]">/{p.cadence.toLowerCase()}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Failed attempts</TableHead><TableHead>Next billing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(subs ?? []).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.userId}</TableCell>
                    <TableCell>{s.productName}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(s.priceCents)}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[s.status]}>{s.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="font-mono">{s.failedAttempts}</TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(s.nextBillingAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
