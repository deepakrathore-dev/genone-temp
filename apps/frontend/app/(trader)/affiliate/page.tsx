"use client";
import * as React from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Input, Label, Textarea, Skeleton,
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell,
  formatCurrency, formatNumber, formatDate, cn,
} from "@genone/ui";
import { useMyAffiliate, useMyAffiliateReferrals } from "@/lib/queries";
import { useApplyForAffiliate } from "@/lib/mutations";
import {
  Megaphone, Sparkles, Copy, Link as LinkIcon, Video, Globe, Hourglass,
  ShieldAlert, CheckCircle2, TrendingUp, Users, DollarSign, Percent,
} from "lucide-react";
import { toast } from "sonner";
import type { AffiliateRow } from "@genone/types";

const PLATFORMS: NonNullable<AffiliateRow["primaryPlatform"]>[] = [
  "YouTube", "TikTok", "X", "Instagram", "Discord", "Other",
];

export default function AffiliatePage() {
  const { data: affiliate, isLoading } = useMyAffiliate();

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Affiliate program</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Refer traders to Gen One Futures and earn commission on every evaluation they purchase — for life.
        </p>
      </div>

      {!affiliate && <ApplyState />}
      {affiliate?.status === "PENDING" && <PendingState affiliate={affiliate} />}
      {affiliate?.status === "ACTIVE" && <DashboardState affiliate={affiliate} />}
      {affiliate?.status === "SUSPENDED" && <SuspendedState affiliate={affiliate} />}
    </div>
  );
}

/* ─────────────────────────  STATE 1: APPLY  ───────────────────────── */

function ApplyState() {
  const apply = useApplyForAffiliate();
  const [platform, setPlatform] = React.useState<NonNullable<AffiliateRow["primaryPlatform"]>>("YouTube");
  const [socialUrl, setSocialUrl] = React.useState("");
  const [audienceSize, setAudienceSize] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const audienceN = Number(audienceSize.replace(/[^0-9]/g, "")) || 0;
  const canSubmit = socialUrl.trim().length > 8 && audienceN > 0 && !apply.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
      {/* Application form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[var(--primary)]" /> Apply to join
          </CardTitle>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Application-based programme. We approve creators with a verified presence and a clear alignment with the Gen One brand.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Primary platform</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PLATFORMS.map((p) => {
                const active = platform === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "h-9 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                      active
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                        : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Profile URL</Label>
            <Input
              placeholder="https://youtube.com/@yourchannel"
              value={socialUrl}
              onChange={(e) => setSocialUrl(e.target.value)}
            />
            <p className="text-[11px] text-[var(--text-faint)]">
              Direct link to your channel / profile so we can verify content presence.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Audience size</Label>
            <Input
              inputMode="numeric"
              placeholder="e.g. 25000"
              value={audienceSize}
              onChange={(e) => setAudienceSize(e.target.value)}
            />
            <p className="text-[11px] text-[var(--text-faint)]">
              Followers / subscribers on your primary platform.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>About your audience (optional)</Label>
            <Textarea
              rows={3}
              placeholder="What kind of content do you publish? Who watches you trade?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            disabled={!canSubmit}
            onClick={() =>
              apply.mutate({
                primaryPlatform: platform,
                socialUrl: socialUrl.trim(),
                audienceSize: audienceN,
                notes: notes.trim() || undefined,
              })
            }
            className="w-full"
          >
            {apply.isPending ? "Submitting…" : "Submit application"}
          </Button>
          <p className="text-[11px] text-[var(--text-faint)] text-center">
            Reviews typically complete within 2 business days. We'll email you the result.
          </p>
        </CardContent>
      </Card>

      {/* Programme overview */}
      <div className="space-y-4">
        <ProgramTile
          icon={Percent}
          label="Commission"
          value="15% base, up to 25%"
          hint="Tier auto-upgrades on the 1st of each month based on signups."
        />
        <ProgramTile
          icon={DollarSign}
          label="Payouts"
          value="Monthly, 15th"
          hint="Bank transfer or USDC/USDT. $100 minimum."
        />
        <ProgramTile
          icon={Hourglass}
          label="Cookie window"
          value="60 days"
          hint="Attribution lasts 60 days from first click. Promo code wins ties."
        />
        <ProgramTile
          icon={Sparkles}
          label="Lifetime value"
          value="Every purchase, forever"
          hint="Commission on the first evaluation AND every repurchase by your referrals."
        />
      </div>
    </div>
  );
}

/* ─────────────────────────  STATE 2: PENDING  ───────────────────────── */

function PendingState({ affiliate }: { affiliate: AffiliateRow }) {
  return (
    <Card>
      <CardContent className="p-8 text-center max-w-xl mx-auto space-y-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--warning-soft)] text-[var(--warning)] mx-auto">
          <Hourglass className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[var(--text)]">Application under review</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            We received your application on <span className="font-mono">{formatDate(affiliate.appliedAt)}</span>.
            Reviews typically complete within 2 business days. We&apos;ll email you the result.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left space-y-2 text-sm">
          <Row label="Platform" value={affiliate.primaryPlatform ?? "—"} />
          <Row label="Audience" value={affiliate.audienceSize ? formatNumber(affiliate.audienceSize) : "—"} />
          <Row label="Profile" value={affiliate.socialUrl ?? "—"} mono />
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Need to update your application? Email <span className="font-mono">partners@genone.example</span>.
        </p>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────  STATE 3: ACTIVE DASHBOARD  ───────────────────────── */

function DashboardState({ affiliate }: { affiliate: AffiliateRow }) {
  const { data: referrals } = useMyAffiliateReferrals();
  const referralUrl = `https://genone.example/?aff=${affiliate.code}`;
  const conversionRate =
    affiliate.monthClicks === 0
      ? 0
      : Math.round((affiliate.monthSignups / affiliate.monthClicks) * 1000) / 10;
  const nextTierAt = affiliate.tierPct < 20 ? 20 : affiliate.tierPct < 25 ? 50 : null;
  const nextTierPct = affiliate.tierPct < 20 ? 20 : affiliate.tierPct < 25 ? 25 : null;
  const progress = nextTierAt
    ? Math.min(100, Math.round((affiliate.monthSignups / nextTierAt) * 100))
    : 100;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied");
  };
  const copyCode = () => {
    navigator.clipboard.writeText(affiliate.code);
    toast.success(`Promo code ${affiliate.code} copied`);
  };

  return (
    <div className="space-y-6">
      {/* Hero — referral link + code */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
                  Affiliate status
                </div>
                <div className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
                  Active
                  <Badge variant="primary">{affiliate.tierPct}% commission</Badge>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">
              Approved {affiliate.approvedAt ? formatDate(affiliate.approvedAt) : "—"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-2">
              <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)] flex items-center gap-1.5">
                <LinkIcon className="h-3 w-3" /> Your referral link
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="flex-1 min-w-0 text-sm font-mono text-[var(--text)] truncate">{referralUrl}</code>
                <Button size="sm" variant="outline" onClick={copyReferral}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-2">
              <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
                Promo code
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono font-semibold text-[var(--text)]">{affiliate.code}</code>
                <Button size="sm" variant="outline" onClick={copyCode}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Month signups" value={formatNumber(affiliate.monthSignups)} icon={Users} accent="primary" hint={`${formatNumber(affiliate.monthClicks)} clicks · ${conversionRate}% conv.`} />
        <StatTile label="Lifetime referrals" value={formatNumber(affiliate.totalSignups)} icon={TrendingUp} accent="info" hint="All time signups" />
        <StatTile label="Commission earned" value={formatCurrency(affiliate.totalCommissionCents)} icon={DollarSign} accent="success" hint="Paid + pending" />
        <StatTile label="Pending payout" value={formatCurrency(affiliate.pendingCommissionCents)} icon={Hourglass} accent="warning" hint="Disbursed on the 15th" />
      </div>

      {/* Tier progress */}
      {nextTierAt && nextTierPct && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">
                  Next tier
                </div>
                <div className="mt-1 text-sm text-[var(--text)]">
                  <span className="font-mono font-semibold">{affiliate.monthSignups}</span>
                  <span className="text-[var(--text-muted)]"> of </span>
                  <span className="font-mono font-semibold">{nextTierAt}</span>
                  <span className="text-[var(--text-muted)]"> signups this month to unlock </span>
                  <span className="font-mono font-semibold text-[var(--primary)]">{nextTierPct}%</span>
                </div>
              </div>
              <Badge variant="primary">{progress}%</Badge>
            </div>
            <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5BA8E5] to-[#3B7BAA] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Tiers auto-upgrade on the 1st based on the previous month&apos;s signups.
              20+ unlocks 20%, 50+ unlocks 25%.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Referrals + share section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trader</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(referrals ?? []).slice(0, 20).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.referredUserInitials}</TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(r.signupAt)}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "FUNDED" ? "success" : r.status === "PURCHASED" ? "primary" : "neutral"}>
                        {r.status === "FUNDED" ? "Funded" : r.status === "PURCHASED" ? "Purchased" : "Signed up"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {r.totalPurchasesCents > 0 ? formatCurrency(r.totalPurchasesCents) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--success)]">
                      {r.commissionEarnedCents > 0 ? formatCurrency(r.commissionEarnedCents) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {(referrals ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-[var(--text-muted)] py-8">
                      No referrals yet — share your link to start earning.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Video className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Your profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Platform" value={affiliate.primaryPlatform ?? "—"} />
              <Row label="Audience" value={affiliate.audienceSize ? formatNumber(affiliate.audienceSize) : "—"} />
              <Row label="Profile" value={affiliate.socialUrl ?? "—"} mono link />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Payout schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Next payout" value="15th of next month" />
              <Row label="Method" value="Bank transfer or USDC/USDT" />
              <Row label="Minimum" value="$100" mono />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────  STATE 4: SUSPENDED  ───────────────────────── */

function SuspendedState({ affiliate }: { affiliate: AffiliateRow }) {
  return (
    <Card>
      <CardContent className="p-8 text-center max-w-xl mx-auto space-y-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)] mx-auto">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[var(--text)]">Account suspended</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Your affiliate account is currently suspended. New sign-ups under your code are not attributing commission.
          </p>
          {affiliate.notes && (
            <p className="text-sm text-[var(--text)] mt-2 font-mono">&quot;{affiliate.notes}&quot;</p>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Contact <span className="font-mono">partners@genone.example</span> to discuss reinstatement.
        </p>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────  HELPERS  ───────────────────────── */

function ProgramTile({
  icon: Icon, label, value, hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">{label}</span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="text-base font-semibold text-[var(--text)]">{value}</div>
      <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">{hint}</p>
    </div>
  );
}

function StatTile({
  icon: Icon, label, value, hint, accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  accent: "primary" | "info" | "success" | "warning";
}) {
  const ACCENT: Record<typeof accent, string> = {
    primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  };
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--text-faint)]">{label}</span>
          <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl", ACCENT[accent])}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="num-display text-2xl font-bold tabular-nums text-[var(--text)]">{value}</div>
        {hint && <div className="text-[11px] text-[var(--text-muted)]">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      {link && value !== "—" ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className={cn("text-sm text-[var(--primary)] truncate hover:underline", mono && "font-mono text-xs")}
        >
          {value}
        </a>
      ) : (
        <span className={cn("text-sm text-[var(--text)] truncate", mono && "font-mono text-xs")}>{value}</span>
      )}
    </div>
  );
}
