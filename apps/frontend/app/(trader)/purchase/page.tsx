"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Checkbox, Skeleton, formatCurrency,
} from "@genone/ui";
import { TierPicker } from "@/components/purchase/TierPicker";
import { OrderSummary, type PriceBreakdown } from "@/components/purchase/OrderSummary";
import { PromoField } from "@/components/purchase/PromoField";
import { NmiHostedPanel } from "@/components/purchase/NmiHostedPanel";
import { useMe } from "@/lib/queries";
import { useCreatePurchase } from "@/lib/mutations";
import { TIERS } from "@genone/mock-data";
import type { PromoResult } from "@/lib/api/api-client";

export default function PurchasePage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <PurchaseInner />
    </React.Suspense>
  );
}

function PurchaseInner() {
  const router = useRouter();
  const search = useSearchParams();
  const initialTier = (search.get("tier") ?? "100K") as "50K" | "100K" | "150K";

  const { data: me, isLoading } = useMe();
  const [tier, setTier] = React.useState<string>(initialTier);
  const [promo, setPromo] = React.useState<Extract<PromoResult, { ok: true }> | null>(null);
  const [useCredit, setUseCredit] = React.useState(true);
  const create = useCreatePurchase();

  const tierCfg = TIERS.find((t) => t.tier === tier)!;
  const subtotal = tierCfg.evaluationFeeCents;
  const loyaltyPct = me?.loyaltyTierPct ?? 0;
  const loyaltyDiscount = Math.round(subtotal * (loyaltyPct / 100));
  const afterLoyalty = subtotal - loyaltyDiscount;
  const promoDiscount = !promo
    ? 0
    : promo.kind === "PERCENT"
      ? Math.round(afterLoyalty * (promo.value / 100))
      : promo.value;
  const afterPromo = Math.max(0, afterLoyalty - promoDiscount);
  const wallet = me?.walletCreditCents ?? 0;
  const creditApplied = useCredit ? Math.min(wallet, afterPromo) : 0;
  const total = Math.max(0, afterPromo - creditApplied);

  const breakdown: PriceBreakdown = {
    tier,
    subtotalCents: subtotal,
    loyaltyDiscountCents: loyaltyDiscount,
    loyaltyPct,
    promoDiscountCents: promoDiscount,
    promoLabel: promo?.label,
    creditAppliedCents: creditApplied,
    walletCents: wallet,
    totalCents: total,
  };

  const submit = async () => {
    const receipt = await create.mutateAsync({
      tier,
      promoCode: promo?.code,
      useCredit,
    });
    router.push(`/purchase/success?id=${receipt.id}&accountId=${receipt.accountId}&tier=${receipt.tier}&total=${receipt.totalCents}`);
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buy a challenge</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Pick a tier, apply discounts, and pay. Your funded account auto-provisions on pass.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          {/* Step 1 - tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold">1</span>
                Choose your tier
              </CardTitle>
              <CardDescription>Each tier has its own rules and pricing. Pick one to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <TierPicker value={tier} onChange={setTier} />
            </CardContent>
          </Card>

          {/* Step 2 - discounts & credit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold">2</span>
                Discounts & wallet credit
              </CardTitle>
              <CardDescription>
                Loyalty discount auto-applies based on your attempt count. Promo code and wallet credit are optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loyaltyPct > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary-soft)] px-3 py-2 text-sm">
                  <span className="font-semibold text-[var(--primary)]">{loyaltyPct}% loyalty discount</span>
                  <span className="text-[var(--text-muted)] text-xs ml-auto font-mono">auto-applied</span>
                </div>
              )}
              <PromoField
                tier={tier}
                applied={promo}
                onApply={setPromo}
                onClear={() => setPromo(null)}
              />
              {wallet > 0 && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox checked={useCredit} onCheckedChange={(v) => setUseCredit(!!v)} className="mt-0.5" />
                  <div className="text-sm">
                    Apply {formatCurrency(Math.min(wallet, afterPromo))} from wallet credit
                    <div className="text-xs text-[var(--text-muted)]">
                      Wallet balance {formatCurrency(wallet)} - credit is non-withdrawable and auto-applies before card charge.
                    </div>
                  </div>
                </label>
              )}
            </CardContent>
          </Card>

          {/* Step 3 - pay */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold">3</span>
                Pay {total === 0 ? "(no card needed)" : formatCurrency(total)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {total === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-muted)]">
                    Your discount + credit covers the full amount. No card charge.
                  </p>
                  <button
                    onClick={submit}
                    disabled={create.isPending}
                    className="h-11 w-full rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {create.isPending ? "Provisioning account…" : "Confirm and provision account"}
                  </button>
                </div>
              ) : (
                <NmiHostedPanel
                  totalCents={total}
                  isProcessing={create.isPending}
                  onSubmit={submit}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <OrderSummary breakdown={breakdown} />
        </div>
      </div>
    </div>
  );
}
