"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Check } from "lucide-react";
import {
  AuthShell, AuthCard, AuthButton, Badge, formatCurrency, cn,
} from "@genone/ui";
import { challengeTypes, challenges } from "@genone/mock-data";
import type { Challenge } from "@genone/types";

const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Verify" },
  { id: 4, label: "Choose challenge" },
  { id: 5, label: "Checkout" },
];

function sizeLabel(c: Challenge) {
  return `${Math.round(c.startingBalanceCents / 100_000)}K`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  const activeTypes = React.useMemo(() => challengeTypes.filter((t) => t.active), []);
  const [typeId, setTypeId] = React.useState<string>(activeTypes[0]?.id ?? "");
  const typeChallenges = React.useMemo<Challenge[]>(
    () => challenges
      .filter((c) => c.typeId === typeId && c.active && !c.archivedAt)
      .sort((a, b) => a.startingBalanceCents - b.startingBalanceCents),
    [typeId]
  );

  const [challengeId, setChallengeId] = React.useState<string | null>(null);
  // Derive an "effective" id so we fall back to the middle option whenever the
  // saved id isn't valid for the current type. No setState-in-effect needed.
  const effectiveChallengeId = React.useMemo(() => {
    if (challengeId && typeChallenges.some((c) => c.id === challengeId)) return challengeId;
    return typeChallenges[1]?.id ?? typeChallenges[0]?.id ?? null;
  }, [challengeId, typeChallenges]);

  const selectedType = activeTypes.find((t) => t.id === typeId) ?? null;
  const selectedChallenge = typeChallenges.find((c) => c.id === effectiveChallengeId) ?? null;

  const heading =
    step === 1 ? "Let's set you up"
      : step === 2 ? "Confirm your details"
      : step === 3 ? "Verify your identity"
      : step === 4 ? "Choose your challenge"
      : "Ready to start";

  const subtitle =
    step === 1 ? "Five quick steps to your first evaluation."
      : step === 2 ? "We sent a verification email. Continue when ready."
      : step === 3 ? "Identity verification is required before your first payout. You can do it now or later."
      : step === 4 ? "Pick a rule profile and starting balance. You can scale up after your first payout."
      : "Review your selection and proceed to checkout.";

  const wide = step === 4;
  const semiWide = step === 5;

  return (
    <AuthShell contentClassName={wide ? "max-w-7xl" : semiWide ? "max-w-4xl" : undefined}>
      <div className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">{heading}</h1>
        <p className="mt-3 text-sm text-white/70">{subtitle}</p>
      </div>

      <div className={cn("w-full mx-auto", wide ? "max-w-none" : semiWide ? "max-w-none" : "max-w-2xl")}>
        <AuthCard heading={`Step ${step} of ${STEPS.length} - ${STEPS[step - 1]!.label}`}>
          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <span
                  className={cn(
                    "h-7 w-7 inline-flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    s.id < step
                      ? "bg-[#5BA8E5] text-white"
                      : s.id === step
                        ? "bg-white text-[#0C0B10]"
                        : "bg-white/10 text-white/55"
                  )}
                >
                  {s.id < step ? <Check className="h-3.5 w-3.5" /> : s.id}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "flex-1 h-px transition-colors",
                      s.id < step ? "bg-[#5BA8E5]" : "bg-white/15"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-3 text-sm text-white/80 leading-relaxed">
              <p>
                Welcome to Gen One Futures. Trade futures on Rithmic infrastructure,
                hit your profit target without breaching rules, and get a funded
                account with an 80/20 profit split.
              </p>
              <p>You can be set up in about a minute.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 text-sm text-white/80">
              <p>We've sent a verification link to your email. You can complete that anytime, but you'll need it before your first payout.</p>
              <Badge variant="info">Email verification pending</Badge>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm text-white/80">
              <p>Identity verification (KYC) is handled by Veriff. You can start it now or defer until your first payout.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors">
                  Verify now with Veriff
                </button>
                <button type="button" className="h-10 px-4 rounded-full bg-transparent border border-white/20 hover:border-white/40 text-white text-sm font-medium transition-colors">
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {/* Challenge type picker */}
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-white/55">
                  Challenge type
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeTypes.map((t) => {
                    const active = typeId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTypeId(t.id)}
                        className={cn(
                          "group relative text-left rounded-2xl border p-4 transition-all",
                          active
                            ? "border-[#5BA8E5] bg-[#5BA8E5]/[0.10] shadow-[0_0_0_1px_#5BA8E5]"
                            : "border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-base font-semibold text-white">{t.name}</span>
                          {active ? (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5BA8E5]">Selected</span>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Select</span>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-white/65 leading-relaxed">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account size cards */}
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-white/55">
                  Account size
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {typeChallenges.map((c) => {
                    const active = effectiveChallengeId === c.id;
                    const popular = sizeLabel(c) === "100K";
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setChallengeId(c.id)}
                        className={cn(
                          "relative text-left rounded-2xl border p-6 transition-all min-w-0",
                          active
                            ? "border-[#5BA8E5] bg-[#5BA8E5]/[0.10] shadow-[0_0_0_1px_#5BA8E5]"
                            : "border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
                        )}
                      >
                        {active && (
                          <span className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full bg-[#5BA8E5] text-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                            <Check className="h-3 w-3" /> Selected
                          </span>
                        )}
                        {!active && popular && (
                          <span className="absolute -top-2 right-4 inline-flex items-center rounded-full bg-[#1D4153] text-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                        <div className="text-white/65 text-[11px] font-semibold uppercase tracking-[0.12em]">
                          {sizeLabel(c)} evaluation
                        </div>
                        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                          <span className="text-4xl font-bold tracking-tight text-white">
                            {formatCurrency(c.evaluationFeeCents)}
                          </span>
                          <span className="text-xs text-white/55">/ one-time</span>
                        </div>
                        <div className="mt-1 text-xs text-white/55 truncate">
                          Starting balance {formatCurrency(c.startingBalanceCents)}
                        </div>
                        <ul className="mt-5 space-y-2.5 text-sm text-white/75 leading-relaxed">
                          <Row label={`Profit target ${formatCurrency(c.profitTargetCents)}`} />
                          <Row label={`EOD drawdown ${formatCurrency(c.drawdownCents)}`} />
                          <Row label={`Daily loss limit ${formatCurrency(c.dailyLossCents)}`} />
                          <Row label={`Up to ${c.maxContracts} contracts`} />
                          <Row label={`First payout cap ${formatCurrency(c.firstPayoutCapCents)}`} />
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5 text-sm text-white/80">
              <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                {/* Selection review */}
                <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-white/55">
                      Your selection
                    </div>
                    {selectedType && (
                      <span className="inline-flex items-center rounded-full bg-[#1D4153] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {selectedType.name}
                      </span>
                    )}
                  </div>
                  {selectedChallenge ? (
                    <>
                      <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                        <span className="text-3xl font-bold tracking-tight text-white">
                          {selectedType?.name} {sizeLabel(selectedChallenge)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/55">
                        Starting balance {formatCurrency(selectedChallenge.startingBalanceCents)} · One-time fee {formatCurrency(selectedChallenge.evaluationFeeCents)}
                      </div>
                      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 text-xs text-white/70">
                        <Row label={`Profit target ${formatCurrency(selectedChallenge.profitTargetCents)}`} />
                        <Row label={`EOD drawdown ${formatCurrency(selectedChallenge.drawdownCents)}`} />
                        <Row label={`Daily loss ${formatCurrency(selectedChallenge.dailyLossCents)}`} />
                        <Row label={`Max ${selectedChallenge.maxContracts} contracts`} />
                        <Row label={`First payout cap ${formatCurrency(selectedChallenge.firstPayoutCapCents)}`} />
                        <Row label={`80 / 20 profit split when funded`} />
                      </ul>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-white/55">
                      Go back to Step 4 to pick a challenge.
                    </p>
                  )}
                </div>

                {/* Checkout summary */}
                <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
                  <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-white/55">
                    Pricing
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <SummaryRow label="Evaluation fee" value={selectedChallenge ? formatCurrency(selectedChallenge.evaluationFeeCents) : "—"} />
                    <SummaryRow label="Loyalty discount" value="auto" muted />
                    <SummaryRow label="Promo code" value="optional" muted />
                    <SummaryRow label="Wallet credit" value="auto" muted />
                  </dl>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-white">Estimated total</span>
                    <span className="text-2xl font-bold tracking-tight text-white">
                      {selectedChallenge ? formatCurrency(selectedChallenge.evaluationFeeCents) : "—"}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-white/50 leading-relaxed">
                    Final price is calculated on the checkout page after loyalty and wallet credit are applied.
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/55 leading-relaxed">
                Card payment is processed through NMI&apos;s hosted page — your card data never touches Gen One. Loyalty discount, promo code and wallet credit are all applied automatically before the card charge.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="text-sm text-white/65 hover:text-white disabled:opacity-30 disabled:hover:text-white/65 transition-colors px-2 py-1"
            >
              Back
            </button>
            {step < STEPS.length ? (
              <AuthButton
                type="button"
                className="w-auto px-8"
                onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              >
                Continue <ChevronRight className="inline h-4 w-4 ml-1" />
              </AuthButton>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="h-12 px-5 rounded-full border border-white/20 hover:border-white/40 text-white text-sm font-medium transition-colors"
                >
                  Skip for now
                </button>
                <AuthButton
                  type="button"
                  className="w-auto px-8"
                  onClick={() => router.push(
                    `/purchase${selectedChallenge ? `?tier=${sizeLabel(selectedChallenge)}` : ""}`
                  )}
                >
                  Continue to checkout
                </AuthButton>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-white/50">
            <Link href="/login" className="hover:text-white underline-offset-4 hover:underline">
              Already onboarded? Sign in
            </Link>
          </p>
        </AuthCard>
      </div>
    </AuthShell>
  );
}

function Row({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden className="mt-[7px] h-1 w-1 rounded-full bg-[#5BA8E5] shrink-0" />
      <span>{label}</span>
    </li>
  );
}

function SummaryRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-white/65">{label}</dt>
      <dd className={cn("font-mono tabular-nums", muted ? "text-white/45 uppercase text-[10px] tracking-wider" : "text-white")}>
        {value}
      </dd>
    </div>
  );
}
