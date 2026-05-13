"use client";
import * as React from "react";
import { usePayoutQueue } from "@/lib/queries";
import { useApprovePayout, useRejectPayout } from "@/lib/mutations";
import {
  Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button, Input, Label, Badge,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  formatCurrency, formatDate, Skeleton, StatTile,
} from "@genone/ui";
import { GateBadges } from "@/components/payout-queue/GateBadges";
import { Check, Download, X } from "lucide-react";
import type { Payout } from "@genone/types";
import { toast } from "sonner";

export default function PayoutsAdminPage() {
  const { data, isLoading } = usePayoutQueue();
  const pending = (data ?? []).filter((p) => p.status === "REQUESTED");
  const pendingValue = pending.reduce((s, p) => s + p.amountCents, 0);
  const approve = useApprovePayout();
  const reject = useRejectPayout();
  const [rejecting, setRejecting] = React.useState<Payout | null>(null);
  const [approving, setApproving] = React.useState<Payout | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payout queue</h1>
          <p className="text-sm text-[var(--text-muted)]">Approve or reject pending payouts. Every action is audit-logged.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Export queued (max 90 days)")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Pending Requests" value={String(pending.length)} />
        <StatTile label="Pending Value" value={formatCurrency(pendingValue)} />
        <StatTile label="Avg Gate Score" value="4.8/6" />
        <StatTile label="Approval SLA" value="< 24h" />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Gates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{formatDate(p.requestedAt, "datetime")}</TableCell>
                    <TableCell className="font-mono text-xs">{p.accountId}</TableCell>
                    <TableCell className="font-mono font-semibold">{formatCurrency(p.amountCents)}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell><GateBadges gate={p.gateStatus} /></TableCell>
                    <TableCell><Badge variant={p.status === "DISBURSED" ? "success" : p.status === "REJECTED" ? "danger" : p.status === "REQUESTED" ? "warning" : "info"}>{p.status}</Badge></TableCell>
                    <TableCell>
                      {p.status === "REQUESTED" && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="success" onClick={() => setApproving(p)}><Check className="h-3.5 w-3.5" /> Approve</Button>
                          <Button size="sm" variant="danger" onClick={() => setRejecting(p)}><X className="h-3.5 w-3.5" /> Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ApproveDialog payout={approving} onClose={() => setApproving(null)} onConfirm={(totp) => { approve.mutate({ id: approving!.id, totp }); setApproving(null); }} />
      <RejectDialog payout={rejecting} onClose={() => setRejecting(null)} onConfirm={(reason, totp) => { reject.mutate({ id: rejecting!.id, reason, totp }); setRejecting(null); }} />
    </div>
  );
}

function ApproveDialog({ payout, onClose, onConfirm }: { payout: Payout | null; onClose: () => void; onConfirm: (totp: string) => void; }) {
  const [totp, setTotp] = React.useState("");
  React.useEffect(() => { if (!payout) setTotp(""); }, [payout]);
  return (
    <Dialog open={!!payout} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve payout</DialogTitle>
          <DialogDescription>{payout && `${formatCurrency(payout.amountCents)} to ${payout.accountId}`}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1"><Label>TOTP code</Label><Input value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="6-digit code" /></div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="success" disabled={totp.length < 6} onClick={() => onConfirm(totp)}>Confirm approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({ payout, onClose, onConfirm }: { payout: Payout | null; onClose: () => void; onConfirm: (reason: string, totp: string) => void; }) {
  const [reason, setReason] = React.useState("");
  const [totp, setTotp] = React.useState("");
  React.useEffect(() => { if (!payout) { setReason(""); setTotp(""); } }, [payout]);
  return (
    <Dialog open={!!payout} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject payout</DialogTitle>
          <DialogDescription>This rejection is sent to the trader. Be specific.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Reason (required)</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          <div className="space-y-1"><Label>TOTP code</Label><Input value={totp} onChange={(e) => setTotp(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" disabled={!reason || totp.length < 6} onClick={() => onConfirm(reason, totp)}>Reject payout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
