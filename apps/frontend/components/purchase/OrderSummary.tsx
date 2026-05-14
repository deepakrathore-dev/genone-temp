"use client";
import { Card, CardHeader, CardTitle, CardContent, Separator, cn, formatCurrency } from "@genone/ui";

export interface PriceBreakdown {
  tier: string;
  subtotalCents: number;
  loyaltyDiscountCents: number;
  loyaltyPct: number;
  promoDiscountCents: number;
  promoLabel?: string;
  creditAppliedCents: number;
  walletCents: number;
  totalCents: number;
}

export function OrderSummary({ breakdown }: { breakdown: PriceBreakdown }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row label={breakdown.tier} value={formatCurrency(breakdown.subtotalCents)} />
        {breakdown.loyaltyDiscountCents > 0 && (
          <Row
            label={`Loyalty discount (${breakdown.loyaltyPct}%)`}
            value={`-${formatCurrency(breakdown.loyaltyDiscountCents)}`}
            tone="success"
          />
        )}
        {breakdown.promoDiscountCents > 0 && (
          <Row
            label={breakdown.promoLabel ?? "Promo code"}
            value={`-${formatCurrency(breakdown.promoDiscountCents)}`}
            tone="success"
          />
        )}
        {breakdown.creditAppliedCents > 0 && (
          <Row
            label={`Wallet credit applied`}
            value={`-${formatCurrency(breakdown.creditAppliedCents)}`}
            tone="primary"
          />
        )}
        <Separator />
        <Row label="Total due today" value={formatCurrency(breakdown.totalCents)} bold />
        {breakdown.walletCents > 0 && breakdown.creditAppliedCents === 0 && (
          <div className="rounded-md bg-[var(--info-soft)] text-[var(--info)] text-[11px] font-mono px-2 py-1.5">
            You have {formatCurrency(breakdown.walletCents)} in wallet credit available.
          </div>
        )}
        <div className="text-[10px] text-[var(--text-faint)] leading-relaxed pt-2">
          Card data is captured by NMI on a hosted page - it never touches our servers.
          Loyalty discount → promo code → wallet credit are applied before the card charge.
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, tone, bold }: { label: string; value: string; tone?: "success" | "primary"; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm">
      <span className={cn("text-[var(--text-muted)]", bold && "text-[var(--text)] font-medium")}>{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums",
          bold && "text-base font-semibold",
          tone === "success" && "text-success",
          tone === "primary" && "text-[var(--primary)]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
