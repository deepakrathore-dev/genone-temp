"use client";
import * as React from "react";
import { useNotifications } from "@/lib/queries";
import { useMarkNotificationRead } from "@/lib/mutations";
import {
  Card, CardContent,
  Tabs, TabsList, TabsTrigger,
  Badge, Button, cn, Skeleton, EmptyState,
} from "@genone/ui";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NotificationKind } from "@genone/types";

const KIND_LABEL: Record<NotificationKind, string> = {
  SYSTEM: "System",
  ALERT: "Alert",
  PASS: "Pass",
  FAIL: "Fail",
  PAYOUT: "Payout",
  LOYALTY: "Loyalty",
};

const KIND_VARIANT: Record<NotificationKind, "neutral" | "warning" | "info" | "danger" | "success" | "primary"> = {
  SYSTEM: "neutral",
  ALERT: "warning",
  PASS: "success",
  FAIL: "danger",
  PAYOUT: "info",
  LOYALTY: "primary",
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const mark = useMarkNotificationRead();
  const [filter, setFilter] = React.useState<string>("ALL");

  const filtered = (data ?? []).filter((n) => (filter === "ALL" ? true : n.kind === filter));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Account events, payouts, and system messages - retained for 90 days.
          </p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="SYSTEM">System</TabsTrigger>
          <TabsTrigger value="ALERT">Alerts</TabsTrigger>
          <TabsTrigger value="PASS">Pass</TabsTrigger>
          <TabsTrigger value="FAIL">Fail</TabsTrigger>
          <TabsTrigger value="PAYOUT">Payout</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title="Nothing here" description="Notifications appear when there's something to know." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-[var(--border)]">
              {filtered.map((n) => (
                <li key={n.id} className={cn("flex items-start gap-3 p-4", !n.readAt && "bg-[var(--surface-2)]/40")}>
                  <Badge variant={KIND_VARIANT[n.kind]} className="shrink-0">{KIND_LABEL[n.kind]}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{n.body}</div>
                    <div className="text-[10px] text-[var(--text-faint)] mt-1 font-mono">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  {!n.readAt && (
                    <Button size="sm" variant="ghost" onClick={() => mark.mutate(n.id)}>
                      <CheckCheck className="h-3.5 w-3.5" /> Mark read
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
