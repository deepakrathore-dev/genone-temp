"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card, CardContent,
  Checkbox, Skeleton, formatCurrency,
} from "@genone/ui";
import { TierPicker, sizeLabel } from "@/components/purchase/TierPicker";
import { ChallengeTypePicker } from "@/components/purchase/ChallengeTypePicker";
import { OrderSummary, type PriceBreakdown } from "@/components/purchase/OrderSummary";
import { PromoField } from "@/components/purchase/PromoField";
import { NmiHostedPanel } from "@/components/purchase/NmiHostedPanel";
import { useMe, useChallengeTypes, useChallenges } from "@/lib/queries";
import { useCreatePurchase } from "@/lib/mutations";
import type { PromoResult } from "@/lib/api/api-client";
import type { Challenge } from "@genone/types";

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

  const { data: me, isLoading: meLoading } = useMe();
  const { data: types, isLoading: typesLoading } = useChallengeTypes();
  const { data: challenges, isLoading: chLoading } = useChallenges();

  const [typeId, setTypeId] = React.useState<string | null>(null);
  const [challengeId, setChallengeId] = React.useState<string | null>(null);
  const [promo, setPromo] = React.useState<Extract<PromoResult, { ok: true }> | null>(null);
  const [useCredit, setUseCredit] = React.useState(true);
  const create = useCreatePurchase();

  React.useEffect(() => {
    if (!typeId && types && types.length > 0) setTypeId(types[0]!.id);
  }, [typeId, types]);

  const typeChallenges = React.useMemo<Challenge[]>(() => {
    if (!challenges || !typeId) return [];
    return challenges.filter((c) => c.typeId === typeId).sort((a, b) => a.startingBalanceCents - b.startingBalanceCents);
  }, [challenges, typeId]);

  React.useEffect(() => {
    if (typeChallenges.length === 0) return;
    const stillValid = challengeId && typeChallenges.some((c) => c.id === challengeId);
    if (stillValid) return;
    const preferred = typeChallenges.find((c) => sizeLabel(c) === initialTier) ?? typeChallenges[1] ?? typeChallenges[0];
    if (preferred) setChallengeId(preferred.id);
  }, [typeChallenges, challengeId, initialTier]);

  const popularChallengeId = React.useMemo(
    () => typeChallenges.find((c) => sizeLabel(c) === "100K")?.id,
    [typeChallenges]
  );

  const selectedChallenge = typeChallenges.find((c) => c.id === challengeId) ?? null;
  const tier = selectedChallenge ? sizeLabel(selectedChallenge) : initialTier;

  const subtotal = selectedChallenge?.evaluationFeeCents ?? 0;
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

  const selectedType = types?.find((t) => t.id === typeId) ?? null;
  const productLine = selectedChallenge
    ? `${selectedType?.name ?? ""} ${sizeLabel(selectedChallenge)} Evaluation`.trim()
    : `${tier} Evaluation`;

  const breakdown: PriceBreakdown = {
    tier: productLine,
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
    if (!selectedChallenge) return;
    const receipt = await create.mutateAsync({
      tier,
      promoCode: promo?.code,
      useCredit,
      challengeId: selectedChallenge.id,
    });
    router.push(`/purchase/success?id=${receipt.id}&accountId=${receipt.accountId}&tier=${receipt.tier}&total=${receipt.totalCents}`);
  };

  if (meLoading || typesLoading || chLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Buy a challenge</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Pick a challenge type, choose your account size, apply discounts and pay. Your evaluation auto-provisions on completion.
        </p>
      </div>

      {/* Pinned top: Challenge type + Order summary stay visible while the rest scrolls. */}
      {/* Bleed the opaque bg full-width past the layout padding via a pseudo-element. */}
      {/* will-change isolates this into its own compositor layer so scrolling content below */}
      {/* doesn't force a repaint of this region every frame. */}
      <div
        className="relative lg:sticky lg:top-16 lg:z-20 lg:pt-4 lg:pb-5 lg:before:content-[''] lg:before:absolute lg:before:inset-y-0 lg:before:-left-8 lg:before:-right-8 lg:before:bg-[var(--bg)] lg:before:border-b lg:before:border-[var(--border)] lg:before:-z-10"
        style={{ willChange: "transform", contain: "layout paint" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <Step number={1} title="Challenge type" caption="Different rule profiles for different trading styles.">
            <ChallengeTypePicker
              types={types ?? []}
              value={typeId}
              onChange={(id) => {
                setTypeId(id);
                setChallengeId(null);
              }}
            />
          </Step>
          <OrderSummary breakdown={breakdown} />
        </div>
      </div>

      {/* Scrolling steps - full width */}
      <Step number={2} title="Account size" caption="Each size has its own profit target, drawdown and contract limits.">
        <TierPicker
          challenges={typeChallenges}
          value={challengeId}
          onChange={(c) => setChallengeId(c.id)}
          popularChallengeId={popularChallengeId}
          fullWidth
          discountLabel={
            promo ? promo.label
            : loyaltyPct > 0 ? `${loyaltyPct}% off with loyalty`
            : undefined
          }
        />
      </Step>

      <Step number={3} title="Discounts & wallet credit" caption="Loyalty auto-applies. Promo and wallet credit are optional.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {loyaltyPct > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary-soft)] px-3 py-2.5 text-sm">
                <span className="font-semibold text-[var(--primary)]">{loyaltyPct}% loyalty discount</span>
                <span className="text-[var(--text-muted)] text-xs ml-auto font-mono uppercase tracking-wider">auto-applied</span>
              </div>
            )}
            <PromoField
              tier={tier}
              applied={promo}
              onApply={setPromo}
              onClear={() => setPromo(null)}
            />
          </div>
          {wallet > 0 && (
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <Checkbox checked={useCredit} onCheckedChange={(v) => setUseCredit(!!v)} className="mt-0.5" />
              <div className="text-sm">
                <div className="text-[var(--text)] font-medium">Apply {formatCurrency(Math.min(wallet, afterPromo))} from wallet credit</div>
                <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  Wallet balance {formatCurrency(wallet)}. Credit is non-withdrawable and auto-applies before the card charge.
                </div>
              </div>
            </label>
          )}
        </div>
      </Step>

      <Step number={4} title={total === 0 ? "Confirm - no card needed" : `Pay ${formatCurrency(total)}`} caption={total === 0 ? "Your discount and credit cover the full amount." : "Card data is captured on NMI's hosted page and never touches our servers."}>
        {total === 0 ? (
          <button
            onClick={submit}
            disabled={!selectedChallenge || create.isPending}
            className="h-12 w-full max-w-md mx-auto flex rounded-full bg-gradient-to-r from-[#5BA8E5] via-[#4F92D6] to-[#3B7BAA] text-white font-semibold hover:opacity-95 disabled:opacity-50 shadow-[var(--shadow-cta)] transition-opacity items-center justify-center"
          >
            {create.isPending ? "Provisioning account…" : "Confirm and provision account"}
          </button>
        ) : (
          <NmiHostedPanel
            totalCents={total}
            isProcessing={create.isPending}
            onSubmit={submit}
          />
        )}
      </Step>
    </div>
  );
}

function Step({
  number,
  title,
  caption,
  children,
}: {
  number: number;
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold ring-1 ring-[var(--primary)]/30">
            {number}
          </span>
          <div className="min-w-0">
            <div className="text-base font-semibold text-[var(--text)] leading-tight">{title}</div>
            {caption && <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{caption}</div>}
          </div>
        </div>
        <div>{children}</div>
      </CardContent>
    </Card>
  );
}
