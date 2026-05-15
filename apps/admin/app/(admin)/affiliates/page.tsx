"use client";
import * as React from "react";
import { useAffiliates } from "@/lib/queries";
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Skeleton, formatCurrency, formatNumber, formatDate, StatTile,
} from "@genone/ui";
import { Download, ExternalLink, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/global/ConfirmActionDialog";

type AffiliateAction = "approve" | "suspend" | "reject" | "adjust";

interface PendingAction {
  action: AffiliateAction;
  id: string;
  name: string;
}

export default function AffiliatesPage() {
  const { data, isLoading } = useAffiliates();
  const totalCommission = (data ?? []).reduce((s, a) => s + a.totalCommissionCents, 0);
  const pendingCommission = (data ?? []).reduce((s, a) => s + a.pendingCommissionCents, 0);
  const activeCount = (data ?? []).filter((a) => a.status === "ACTIVE").length;
  const pendingApps = (data ?? []).filter((a) => a.status === "PENDING");
  const [pending, setPending] = React.useState<PendingAction | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Affiliate management</h1>
          <p className="text-sm text-[var(--text-muted)]">Approve, suspend, and adjust per-affiliate commission tiers.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Pending applications" value={String(pendingApps.length)} />
        <StatTile label="Active affiliates" value={String(activeCount)} />
        <StatTile label="Total commission paid" value={formatCurrency(totalCommission)} />
        <StatTile label="Pending payout (15th)" value={formatCurrency(pendingCommission)} />
      </div>

      {/* Pending applications — shown when there's something to review */}
      {pendingApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5 text-[var(--warning)]" />
              Pending applications ({pendingApps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApps.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">{a.email}</div>
                      {a.userId && (
                        <Badge variant="info" className="mt-1">Existing trader · {a.userId}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{a.primaryPlatform ?? "—"}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {a.audienceSize ? formatNumber(a.audienceSize) : "—"}
                    </TableCell>
                    <TableCell>
                      {a.socialUrl ? (
                        <a
                          href={a.socialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline text-xs font-mono max-w-[220px] truncate"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{a.socialUrl}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(a.appliedAt)}</TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      <Button size="sm" variant="success" onClick={() => setPending({ action: "approve", id: a.id, name: a.name })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPending({ action: "reject", id: a.id, name: a.name })}>
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All affiliates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Signups (mo)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{a.email}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.code}</TableCell>
                    <TableCell><Badge variant="primary">{a.tierPct}%</Badge></TableCell>
                    <TableCell className="font-mono">{formatNumber(a.monthSignups)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.totalCommissionCents)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.pendingCommissionCents)}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "ACTIVE" ? "success" : a.status === "SUSPENDED" ? "danger" : "warning"}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      {a.status === "PENDING" && (
                        <Button size="sm" variant="success" onClick={() => setPending({ action: "approve", id: a.id, name: a.name })}>
                          Approve
                        </Button>
                      )}
                      {a.status === "ACTIVE" && (
                        <Button size="sm" variant="danger" onClick={() => setPending({ action: "suspend", id: a.id, name: a.name })}>
                          Suspend
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setPending({ action: "adjust", id: a.id, name: a.name })}>
                        Adjust tier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={pending?.action === "approve"}
        onOpenChange={(o) => !o && setPending(null)}
        title="Approve affiliate"
        description={`${pending?.name ?? "This affiliate"} will move to Active and start earning commission on new sign-ups immediately. A unique referral link and promo code will be generated for them.`}
        confirmLabel="Approve affiliate"
        tone="success"
        onConfirm={() => {
          toast.success(`${pending?.name ?? "Affiliate"} approved`);
          setPending(null);
        }}
      />
      <ConfirmActionDialog
        open={pending?.action === "reject"}
        onOpenChange={(o) => !o && setPending(null)}
        title="Reject application"
        description={`Reject ${pending?.name ?? "this applicant"}. They'll receive an email explaining the decision and can reapply after 90 days.`}
        confirmLabel="Reject application"
        tone="danger"
        requireReason
        reasonLabel="Rejection reason"
        reasonPlaceholder="e.g. Audience too small / content doesn't align with brand values"
        onConfirm={(reason) => {
          toast.success(`${pending?.name ?? "Applicant"} rejected${reason ? ` — ${reason}` : ""}`);
          setPending(null);
        }}
      />
      <ConfirmActionDialog
        open={pending?.action === "suspend"}
        onOpenChange={(o) => !o && setPending(null)}
        title="Suspend affiliate"
        description={`Suspend ${pending?.name ?? "this affiliate"}. New sign-ups under their code will no longer attribute commission. Pending balance is held until the next review.`}
        confirmLabel="Suspend affiliate"
        tone="danger"
        requireReason
        reasonLabel="Suspension reason"
        reasonPlaceholder="e.g. Self-referrals detected across three accounts"
        onConfirm={(reason) => {
          toast.success(`${pending?.name ?? "Affiliate"} suspended${reason ? ` — ${reason}` : ""}`);
          setPending(null);
        }}
      />
      <ConfirmActionDialog
        open={pending?.action === "adjust"}
        onOpenChange={(o) => !o && setPending(null)}
        title="Adjust commission tier"
        description={`Open the tier review for ${pending?.name ?? "this affiliate"}. The change applies to future sign-ups only.`}
        confirmLabel="Open tier review"
        tone="primary"
        onConfirm={() => {
          toast.success(`Tier review opened for ${pending?.name ?? "affiliate"}`);
          setPending(null);
        }}
      />
    </div>
  );
}
