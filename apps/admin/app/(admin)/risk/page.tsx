"use client";
import * as React from "react";
import Link from "next/link";
import { useFlaggedUsers } from "@/lib/queries";
import {
  Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Skeleton,
} from "@genone/ui";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/global/ConfirmActionDialog";

const REASONS = [
  "Copy account coordinated trading",
  "Rapid-fire payout requests",
  "IP cluster overlap (3 accounts)",
  "Device fingerprint match",
  "Payment source overlap",
  "Order timing correlation > 0.85",
];

type Action = "investigate" | "clear" | "suspend";

interface PendingAction {
  action: Action;
  userId: string;
  userName: string;
}

const ACTION_COPY: Record<Action, {
  title: string;
  description: (name: string) => string;
  confirmLabel: string;
  tone: "primary" | "success" | "danger";
  requireReason: boolean;
  successToast: (name: string) => string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}> = {
  investigate: {
    title: "Open investigation",
    description: (n) => `Mark ${n} for deeper review. The user keeps trading but every action they take is highlighted in the audit log until the case is closed.`,
    confirmLabel: "Start investigation",
    tone: "primary",
    requireReason: true,
    reasonLabel: "What are you investigating?",
    reasonPlaceholder: "e.g. Five accounts on the same fingerprint, trading correlated NQ entries",
    successToast: (n) => `Investigation opened for ${n}`,
  },
  clear: {
    title: "Clear flag",
    description: (n) => `Remove ${n} from the risk queue. The flag will be archived but stays searchable in the audit log.`,
    confirmLabel: "Clear flag",
    tone: "success",
    requireReason: false,
    successToast: (n) => `Flag cleared for ${n}`,
  },
  suspend: {
    title: "Suspend user",
    description: (n) => `Immediately block ${n} from trading and disable login. This action is reversible from the user detail page but is audit-logged.`,
    confirmLabel: "Suspend user",
    tone: "danger",
    requireReason: true,
    reasonLabel: "Suspension reason",
    reasonPlaceholder: "e.g. Confirmed copy trading across accounts ABC and DEF",
    successToast: (n) => `${n} suspended`,
  },
};

export default function RiskPage() {
  const { data, isLoading } = useFlaggedUsers();
  const [pending, setPending] = React.useState<PendingAction | null>(null);
  const copy = pending ? ACTION_COPY[pending.action] : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Risk & suspicious activity</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Auto-flagged for review by the platform&apos;s risk engine. Investigate, clear, or suspend.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead><TableHead>Reason</TableHead><TableHead>Accounts</TableHead><TableHead>Flagged at</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((u, i) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/users/${u.id}`} className="hover:underline">
                        <div className="text-sm font-medium">{u.fullName}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">{u.email}</div>
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="danger">{REASONS[i % REASONS.length]}</Badge></TableCell>
                    <TableCell className="font-mono">{u.accountsCount}</TableCell>
                    <TableCell className="font-mono text-xs">2 hours ago</TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setPending({ action: "investigate", userId: u.id, userName: u.fullName })}>Investigate</Button>
                      <Button size="sm" variant="ghost" onClick={() => setPending({ action: "clear", userId: u.id, userName: u.fullName })}>Clear</Button>
                      <Button size="sm" variant="danger" onClick={() => setPending({ action: "suspend", userId: u.id, userName: u.fullName })}>Suspend</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pending && copy && (
        <ConfirmActionDialog
          open
          onOpenChange={(o) => !o && setPending(null)}
          title={copy.title}
          description={copy.description(pending.userName)}
          confirmLabel={copy.confirmLabel}
          tone={copy.tone}
          requireReason={copy.requireReason}
          reasonLabel={copy.reasonLabel}
          reasonPlaceholder={copy.reasonPlaceholder}
          onConfirm={(reason) => {
            const msg = copy.successToast(pending.userName);
            toast.success(reason ? `${msg} — ${reason}` : msg);
            setPending(null);
          }}
        />
      )}
    </div>
  );
}
