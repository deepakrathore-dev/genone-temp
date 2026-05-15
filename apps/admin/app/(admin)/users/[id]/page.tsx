"use client";
import * as React from "react";
import { useUser, useUserAccounts, useUserPayouts, useUserPurchases, useAudit } from "@/lib/queries";
import { useSuspendUser, useManualCredit } from "@/lib/mutations";
import {
  Card, CardContent, CardHeader, CardTitle,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Input, Label, Skeleton, CountryChip, cn,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  formatCurrency, formatDate,
} from "@genone/ui";
import { ShieldAlert, Wallet, ShieldCheck, ShieldX, Mail, Phone, MapPin, KeyRound, Bell } from "lucide-react";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: user, isLoading } = useUser(id);
  const { data: accounts } = useUserAccounts(id);
  const { data: payouts } = useUserPayouts(id);
  const { data: purchases } = useUserPurchases(id);
  const { data: audit } = useAudit();
  const userAudit = (audit ?? []).filter((a) => a.entity === id).slice(0, 100);

  if (isLoading || !user) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{user.fullName}</h1>
            <CountryChip code={user.country} />
            {user.suspended ? <Badge variant="danger">Suspended</Badge> : <Badge variant="success">Active</Badge>}
            <Badge variant={user.kycStatus === "VERIFIED" ? "success" : "warning"}>KYC: {user.kycStatus}</Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-mono">{user.email} · {user.id}</p>
        </div>
        <div className="flex gap-2">
          <ManualCreditButton userId={user.id} />
          <SuspendButton userId={user.id} suspended={user.suspended} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts ({accounts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="purchases">Purchases ({purchases?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({payouts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
          <TabsTrigger value="audit">Audit ({userAudit.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Wallet" value={formatCurrency(user.walletCreditCents)} />
              <Stat label="Loyalty attempts" value={String(user.loyaltyAttempts)} />
              <Stat label="Loyalty discount" value={`${user.loyaltyTierPct}%`} />
              <Stat label="Joined" value={formatDate(user.createdAt)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Row label="Full name" value={user.fullName} />
                  <Row label="Email" value={user.email} status={user.emailVerified ? "verified" : "pending"} />
                  <Row label="Phone" value={user.phone} status={user.phoneVerified ? "verified" : "pending"} icon={Phone} />
                  <Row label="Date of birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : "—"} />
                  <Row label="Country" value={user.country} extra={<CountryChip code={user.country} size="xs" />} />
                  <Row label="Locale" value={user.locale} />
                  <Row label="Timezone" value={user.timezone} />
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Row label="Street" value={user.addressLine1} />
                  {user.addressLine2 && <Row label="Apt / Suite" value={user.addressLine2} />}
                  <Row label="City" value={user.city} />
                  <Row label="Region" value={user.region} />
                  <Row label="Postal code" value={user.postalCode} />
                </CardContent>
              </Card>

              {/* KYC + compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {user.kycStatus === "VERIFIED" ? (
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
                    ) : (
                      <ShieldX className="h-3.5 w-3.5 text-[var(--warning)]" />
                    )}{" "}
                    KYC & compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Row
                    label="Status"
                    extra={
                      <Badge variant={user.kycStatus === "VERIFIED" ? "success" : user.kycStatus === "PENDING" ? "warning" : "neutral"}>
                        {user.kycStatus}
                      </Badge>
                    }
                  />
                  {user.kycVerifiedAt && <Row label="Verified at" value={formatDate(user.kycVerifiedAt)} />}
                  <Row
                    label="PEP flag"
                    extra={
                      <Badge variant={user.pepFlag ? "danger" : "neutral"}>
                        {user.pepFlag ? "Flagged" : "Clear"}
                      </Badge>
                    }
                  />
                  <Row
                    label="Sanctions"
                    extra={
                      <Badge variant={user.sanctionsCleared ? "success" : "danger"}>
                        {user.sanctionsCleared ? "Cleared" : "Blocked"}
                      </Badge>
                    }
                  />
                  <Row
                    label="Account status"
                    extra={
                      <Badge variant={user.suspended ? "danger" : "success"}>
                        {user.suspended ? "Suspended" : "Active"}
                      </Badge>
                    }
                  />
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Row
                    label="2FA"
                    extra={
                      <Badge variant={user.totpEnabled ? "success" : "warning"}>
                        {user.totpEnabled ? "Enabled" : "Not configured"}
                      </Badge>
                    }
                  />
                  <Row label="Last login" value={user.lastLoginAt ? formatDate(user.lastLoginAt, "datetime") : "—"} />
                  <Row label="Last login IP" value={user.lastLoginIp ?? "—"} mono />
                  {user.riskDisclosure && (
                    <>
                      <Row label="Disclosure version" value={user.riskDisclosure.version} mono />
                      <Row label="Disclosure accepted" value={formatDate(user.riskDisclosure.acceptedAt, "datetime")} />
                      <Row label="Disclosure IP" value={user.riskDisclosure.ip} mono />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Notifications */}
              {user.notificationPrefs && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Notification preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                      <PrefChip on={!!user.notificationPrefs.passFailEmails} label="Pass / fail emails" />
                      <PrefChip on={!!user.notificationPrefs.payoutEmails} label="Payout emails" />
                      <PrefChip on={!!user.notificationPrefs.retentionEmails} label="Retention emails" />
                      <PrefChip on={!!user.notificationPrefs.productAnnouncements} label="Product announcements" />
                      <PrefChip on={!!user.notificationPrefs.loyaltyUpdates} label="Loyalty updates" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead><TableHead>Tier</TableHead><TableHead>Type</TableHead>
                  <TableHead>Status</TableHead><TableHead>Equity</TableHead><TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(accounts ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.id}</TableCell>
                    <TableCell><Badge variant="primary">{a.tier}</Badge></TableCell>
                    <TableCell>{a.type}</TableCell>
                    <TableCell><Badge variant={a.status === "ACTIVE" ? "success" : a.status === "FAILED" ? "danger" : "neutral"}>{a.status}</Badge></TableCell>
                    <TableCell className="font-mono">{formatCurrency(a.currentEquityCents)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(a.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead><TableHead>Product</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(purchases ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{formatDate(p.ts)}</TableCell>
                    <TableCell>{p.product}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(p.amountCents)}</TableCell>
                    <TableCell><Badge variant={p.status === "PAID" ? "success" : p.status === "REFUNDED" ? "warning" : "danger"}>{p.status}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline">Refund</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payouts ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{formatDate(p.requestedAt)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(p.amountCents)}</TableCell>
                    <TableCell><Badge>{p.status}</Badge></TableCell>
                    <TableCell>{p.method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="affiliate">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Affiliate attribution</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-[var(--text-muted)] text-xs">Referred by</dt><dd className="font-mono">{user.referredBy ?? "Direct"}</dd></div>
                <div><dt className="text-[var(--text-muted)] text-xs">Own affiliate code</dt><dd className="font-mono">{user.affiliateCode ?? "-"}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Time</TableHead><TableHead>Admin</TableHead><TableHead>Action</TableHead><TableHead>IP</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {userAudit.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{formatDate(a.ts, "datetime")}</TableCell>
                    <TableCell className="text-sm">{a.adminUserName}</TableCell>
                    <TableCell><Badge variant="outline">{a.action}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{a.ip}</TableCell>
                  </TableRow>
                ))}
                {userAudit.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-xs text-[var(--text-muted)] py-6">No admin actions logged for this user.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card><CardContent>
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-xl font-mono font-semibold">{value}</div>
    </CardContent></Card>
  );
}

function Row({
  label, value, extra, mono, status, icon: Icon,
}: {
  label: string;
  value?: string;
  extra?: React.ReactNode;
  mono?: boolean;
  status?: "verified" | "pending";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 first:pt-0 last:pb-0 border-b border-[var(--border)] last:border-b-0">
      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className="flex items-center gap-2 text-right min-w-0">
        {value && (
          <span className={cn("text-sm text-[var(--text)] truncate", mono && "font-mono text-xs")}>{value}</span>
        )}
        {status && (
          <Badge variant={status === "verified" ? "success" : "warning"}>
            {status === "verified" ? "Verified" : "Pending"}
          </Badge>
        )}
        {extra}
      </span>
    </div>
  );
}

function PrefChip({ on, label }: { on: boolean; label: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2.5 py-2 transition-colors",
        on
          ? "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]"
          : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-[var(--success)]" : "bg-[var(--text-faint)]")} />
        <span className="font-semibold uppercase tracking-wider text-[10px]">{on ? "On" : "Off"}</span>
      </div>
      <div className="mt-0.5 text-[11px] leading-snug text-[var(--text)]">{label}</div>
    </div>
  );
}

function SuspendButton({ userId, suspended }: { userId: string; suspended: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [totp, setTotp] = React.useState("");
  const m = useSuspendUser();
  return (
    <>
      <Button variant={suspended ? "outline" : "danger"} onClick={() => setOpen(true)}>
        <ShieldAlert className="h-4 w-4" /> {suspended ? "Reinstate" : "Suspend"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{suspended ? "Reinstate user" : "Suspend user"}</DialogTitle>
            <DialogDescription>This action is audit-logged and requires TOTP confirmation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Reason (required)</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            <div className="space-y-1"><Label>TOTP code</Label><Input value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="6-digit code" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={!reason || totp.length < 6}
              onClick={() => { m.mutate({ id: userId, reason, totp }); setOpen(false); }}
            >Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ManualCreditButton({ userId }: { userId: string }) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(50);
  const [reason, setReason] = React.useState("");
  const [totp, setTotp] = React.useState("");
  const m = useManualCredit();
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Wallet className="h-4 w-4" /> Issue credit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue wallet credit</DialogTitle>
            <DialogDescription>Non-withdrawable. Auto-applies at next checkout.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Amount (USD)</Label><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>Reason (required)</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            <div className="space-y-1"><Label>TOTP code</Label><Input value={totp} onChange={(e) => setTotp(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={!amount || !reason || totp.length < 6}
              onClick={() => { m.mutate({ id: userId, amountCents: Math.round(amount * 100), reason, totp }); setOpen(false); }}
            >Issue credit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
