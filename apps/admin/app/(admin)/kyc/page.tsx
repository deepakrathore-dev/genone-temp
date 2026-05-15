"use client";
import * as React from "react";
import { useKycQueue } from "@/lib/queries";
import Link from "next/link";
import {
  Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Skeleton, CountryChip, formatDate,
} from "@genone/ui";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/global/ConfirmActionDialog";

type PendingAction =
  | { kind: "approve"; userId: string; userName: string }
  | { kind: "reject";  userId: string; userName: string };

export default function KycPage() {
  const { data, isLoading } = useKycQueue();
  const [pending, setPending] = React.useState<PendingAction | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">KYC queue</h1>
        <p className="text-sm text-[var(--text-muted)]">Users pending Veriff verification. Required before first payout.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead><TableHead>Country</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/users/${u.id}`} className="hover:underline">
                        <div className="text-sm font-medium">{u.fullName}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">{u.email}</div>
                      </Link>
                    </TableCell>
                    <TableCell><CountryChip code={u.country} showName /></TableCell>
                    <TableCell><Badge variant="warning">{u.kycStatus}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      <Button size="sm" variant="success" onClick={() => setPending({ kind: "approve", userId: u.id, userName: u.fullName })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setPending({ kind: "reject", userId: u.id, userName: u.fullName })}>
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(data ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-[var(--text-muted)] py-6">No users pending verification.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={pending?.kind === "approve"}
        onOpenChange={(o) => !o && setPending(null)}
        title="Approve KYC verification"
        description={`Mark ${pending?.userName ?? "this user"} as verified. They'll be eligible for payouts immediately.`}
        confirmLabel="Approve user"
        tone="success"
        onConfirm={() => {
          toast.success(`${pending?.userName ?? "User"} approved`);
          setPending(null);
        }}
      />
      <ConfirmActionDialog
        open={pending?.kind === "reject"}
        onOpenChange={(o) => !o && setPending(null)}
        title="Reject KYC verification"
        description={`Reject ${pending?.userName ?? "this user"}'s KYC submission. They'll be asked to re-submit with corrected documents.`}
        confirmLabel="Reject user"
        tone="danger"
        requireReason
        reasonLabel="Rejection reason"
        reasonPlaceholder="e.g. Document does not match name on file"
        onConfirm={(reason) => {
          toast.success(`${pending?.userName ?? "User"} rejected${reason ? ` — ${reason}` : ""}`);
          setPending(null);
        }}
      />
    </div>
  );
}
