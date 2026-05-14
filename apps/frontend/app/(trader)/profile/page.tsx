"use client";
import * as React from "react";
import Link from "next/link";
import { useMe } from "@/lib/queries";
import {
  Badge, Button, Card, CardContent, Skeleton, Switch, Separator, CountryChip,
  formatCurrency, formatDate,
} from "@genone/ui";
import {
  Mail, Phone, MapPin, Calendar as CalendarIcon, ShieldCheck, ShieldAlert,
  Lock, Bell, Globe, ScrollText, Banknote, Users as UsersIcon, KeyRound,
  Pencil, ExternalLink, CheckCircle2, XCircle,
} from "lucide-react";
import { ProfileSection, Field } from "@/components/global/ProfileSection";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: me, isLoading } = useMe();
  if (isLoading || !me) return <Skeleton className="h-96 w-full" />;

  const fullAddress = [
    me.addressLine1,
    me.addressLine2,
    [me.city, me.region, me.postalCode].filter(Boolean).join(", "),
    me.country,
  ].filter(Boolean).join("\n");

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-xl font-semibold">
            {me.initials.replace(/\s/g, "").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{me.fullName}</h1>
              <CountryChip code={me.country} />
              {me.suspended ? <Badge variant="danger">Suspended</Badge> : <Badge variant="success">Active</Badge>}
            </div>
            <p className="text-sm text-[var(--text-muted)] font-mono">{me.email} · {me.id}</p>
            <p className="text-xs text-[var(--text-faint)] mt-1">
              Member since {formatDate(me.createdAt, "long")} · {me.timezone ?? "UTC"}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:text-right">
            <div>
              <div className="text-xs text-[var(--text-muted)]">Wallet</div>
              <div className="text-sm font-mono font-semibold">{formatCurrency(me.walletCreditCents)}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">Loyalty</div>
              <div className="text-sm font-mono font-semibold">{me.loyaltyTierPct}% off</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">Attempts</div>
              <div className="text-sm font-mono font-semibold">{me.loyaltyAttempts}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity */}
      <ProfileSection
        title="Personal information"
        description="Legal identity captured at registration and during verification. Locked after verification; contact support to change."
        action={<Button size="sm" variant="outline" onClick={() => toast.info("Contact support to update locked identity fields")}><Pencil className="h-3.5 w-3.5" /> Request change</Button>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Full legal name" value={me.fullName} />
          <Field label="Date of birth" value={me.dateOfBirth ? formatDate(me.dateOfBirth, "long") : null} />
          <Field label="Email" value={
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              {me.email}
              {me.emailVerified
                ? <Badge variant="success">Verified</Badge>
                : <Badge variant="warning">Unverified</Badge>}
            </span>
          } />
          <Field label="Phone" value={
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              {me.phone}
              {me.phoneVerified
                ? <Badge variant="success">Verified</Badge>
                : <Badge variant="warning">Unverified</Badge>}
            </span>
          } mono />
          <Field label="Country" value={<CountryChip code={me.country} showName />} />
          <Field label="Trader ID" value={me.id} mono />
        </div>
      </ProfileSection>

      {/* Address */}
      <ProfileSection
        title="Address"
        description="Used for KYC verification and tax reporting. Editable post-KYC; significant changes may trigger re-verification."
        action={<Button size="sm" variant="outline" onClick={() => toast.info("Edit-address form coming soon")}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
      >
        <div className="flex items-start gap-3 text-sm">
          <MapPin className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
          <pre className="font-sans whitespace-pre-wrap leading-relaxed">{fullAddress}</pre>
        </div>
      </ProfileSection>

      {/* Verification */}
      <ProfileSection
        title="Verification status"
        description="Identity, address, and source-of-funds checks. Required before your first payout."
      >
        <div className="space-y-3">
          <VerificationRow
            label="Email"
            description={me.email}
            verified={me.emailVerified}
            actionLabel="Resend verification"
            onAction={() => toast.success("Verification email sent")}
          />
          <Separator />
          <VerificationRow
            label="Phone"
            description={me.phone ?? "Not added"}
            verified={me.phoneVerified}
            actionLabel="Verify phone"
            onAction={() => toast.success("SMS code sent")}
          />
          <Separator />
          <VerificationRow
            label="KYC (Veriff)"
            description={
              me.kycStatus === "VERIFIED" && me.kycVerifiedAt
                ? `Verified ${formatDate(me.kycVerifiedAt)} · AML + PEP + sanctions`
                : me.kycStatus === "PENDING"
                  ? "Submitted. Under review, typically 1 to 2 business days."
                  : "Required before your first payout"
            }
            verified={me.kycStatus === "VERIFIED"}
            pending={me.kycStatus === "PENDING"}
            actionLabel={me.kycStatus === "VERIFIED" ? "View report" : "Start verification"}
            onAction={() => toast.info("Opens Veriff hosted page")}
          />
          {me.kycStatus === "VERIFIED" && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Field
                  label="PEP screening"
                  value={me.pepFlag
                    ? <Badge variant="warning">Politically exposed</Badge>
                    : <Badge variant="success">Clear</Badge>}
                />
                <Field
                  label="Sanctions screening"
                  value={me.sanctionsCleared
                    ? <Badge variant="success">Clear</Badge>
                    : <Badge variant="danger">Hit</Badge>}
                />
              </div>
            </>
          )}
        </div>
      </ProfileSection>

      {/* Security */}
      <ProfileSection
        title="Security"
        description="Password, two-factor authentication, recent sign-in activity."
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <Lock className="h-4 w-4 text-[var(--text-muted)] mt-0.5" />
              <div>
                <div className="text-sm font-medium">Password</div>
                <div className="text-xs text-[var(--text-muted)]">Argon2id hashed. Min 12 characters, breach-checked.</div>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.info("Password change form")}>Change password</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <KeyRound className="h-4 w-4 text-[var(--text-muted)] mt-0.5" />
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  Two-factor authentication
                  {me.totpEnabled
                    ? <Badge variant="success">Enabled</Badge>
                    : <Badge variant="warning">Disabled</Badge>}
                </div>
                <div className="text-xs text-[var(--text-muted)]">Recommended. Required if you become an admin.</div>
              </div>
            </div>
            <Button size="sm" variant={me.totpEnabled ? "ghost" : "primary"} onClick={() => toast.info("TOTP enrolment flow")}>
              {me.totpEnabled ? "Disable 2FA" : "Set up 2FA"}
            </Button>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Field label="Last sign-in" value={me.lastLoginAt ? formatDate(me.lastLoginAt, "datetime") : "Not available"} />
            <Field label="Last sign-in IP" value={me.lastLoginIp} mono />
          </div>
        </div>
      </ProfileSection>

      {/* Notification preferences */}
      <ProfileSection title="Notifications" description="Pick which emails Gen One sends you. In-platform notifications are always on.">
        <div className="space-y-2">
          {[
            { key: "passFailEmails", label: "Pass / fail events", hint: "Required for evaluation outcomes. Cannot be disabled." },
            { key: "payoutEmails", label: "Payout state changes", hint: "Required for regulatory record-keeping. Cannot be disabled." },
            { key: "retentionEmails", label: "Educational retention emails", hint: "Day-3 content tailored to your last failure mode" },
            { key: "productAnnouncements", label: "Product announcements", hint: "New tiers, features, scheduled maintenance" },
            { key: "loyaltyUpdates", label: "Loyalty tier updates", hint: "When you unlock a new discount tier" },
          ].map((row) => {
            const locked = row.key === "passFailEmails" || row.key === "payoutEmails";
            const enabled = locked ? true : Boolean(me.notificationPrefs?.[row.key as keyof typeof me.notificationPrefs]);
            return (
              <div key={row.key} className="flex items-center justify-between gap-3 py-1.5">
                <div>
                  <div className="text-sm font-medium">{row.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{row.hint}</div>
                </div>
                <Switch
                  checked={enabled}
                  disabled={locked}
                  onCheckedChange={() => toast.success("Notification preference updated")}
                />
              </div>
            );
          })}
        </div>
      </ProfileSection>

      {/* Locale / timezone */}
      <ProfileSection title="Locale & timezone">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Timezone" value={me.timezone ?? "UTC"} hint="Used for trading day boundaries on the dashboard" />
          <Field label="Locale" value={me.locale ?? "en"} hint="Display language and number/date formatting" />
        </div>
      </ProfileSection>

      {/* Legal */}
      <ProfileSection
        title="Legal & compliance"
        description="Audit trail of your acceptance, kept for regulatory record-keeping."
      >
        {me.riskDisclosure ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Risk disclosure accepted" value={formatDate(me.riskDisclosure.acceptedAt, "datetime")} />
            <Field label="Version" value={me.riskDisclosure.version} mono />
            <Field label="From IP" value={me.riskDisclosure.ip} mono />
            <Field label="User agent" value={me.riskDisclosure.userAgent} />
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">No risk disclosure record on file.</p>
        )}
      </ProfileSection>

      {/* Affiliate */}
      <ProfileSection
        title="Referral & affiliate"
        description="Your referral code (if any) and who referred you."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Your affiliate code"
            value={me.affiliateCode ? <span className="font-mono">{me.affiliateCode}</span> : "Not an affiliate yet"}
            hint={me.affiliateCode ? "Share to earn commission on every signup" : "Apply via the affiliate programme"}
          />
          <Field
            label="Referred by"
            value={me.referredBy ? <span className="font-mono">{me.referredBy}</span> : "Direct signup"}
          />
        </div>
      </ProfileSection>

      {/* Related quick links */}
      <Card>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
          <Link href="/profile/accounts" className="rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--surface-2)] transition-colors">
            <div className="text-sm font-medium flex items-center gap-2"><UsersIcon className="h-4 w-4 text-[var(--primary)]" /> Trading accounts <ExternalLink className="h-3 w-3 ml-auto opacity-60" /></div>
            <p className="text-xs text-[var(--text-muted)] mt-1">All evaluation and funded accounts.</p>
          </Link>
          <Link href="/profile/wallet" className="rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--surface-2)] transition-colors">
            <div className="text-sm font-medium flex items-center gap-2"><Banknote className="h-4 w-4 text-[var(--success)]" /> Wallet & loyalty <ExternalLink className="h-3 w-3 ml-auto opacity-60" /></div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Credit balance and discount tier progress.</p>
          </Link>
          <Link href="/payouts" className="rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--surface-2)] transition-colors">
            <div className="text-sm font-medium flex items-center gap-2"><ScrollText className="h-4 w-4 text-[var(--accent)]" /> Payout history <ExternalLink className="h-3 w-3 ml-auto opacity-60" /></div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Withdrawals + gate checklist.</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function VerificationRow({
  label, description, verified, pending, actionLabel, onAction,
}: {
  label: string;
  description: string;
  verified: boolean;
  pending?: boolean;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-start gap-3 min-w-0">
        {verified
          ? <CheckCircle2 className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
          : pending
            ? <ShieldAlert className="h-5 w-5 text-[var(--warning)] shrink-0 mt-0.5" />
            : <XCircle className="h-5 w-5 text-[var(--text-muted)] shrink-0 mt-0.5" />}
        <div>
          <div className="text-sm font-medium flex items-center gap-2">
            {label}
            {verified && <Badge variant="success">Verified</Badge>}
            {pending && <Badge variant="warning">Pending</Badge>}
            {!verified && !pending && <Badge variant="neutral">Not verified</Badge>}
          </div>
          <div className="text-xs text-[var(--text-muted)]">{description}</div>
        </div>
      </div>
      {!verified && (
        <Button size="sm" variant="outline" onClick={onAction}>{actionLabel}</Button>
      )}
      {verified && actionLabel && (
        <Button size="sm" variant="ghost" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
