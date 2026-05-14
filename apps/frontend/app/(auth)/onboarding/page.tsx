"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, Sparkles } from "lucide-react";
import {
  AuthShell, AuthCard, AuthButton, Badge, formatCurrency, cn,
} from "@genone/ui";
import { TIERS } from "@genone/mock-data";

const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Verify" },
  { id: 4, label: "Choose tier" },
  { id: 5, label: "Checkout" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [tier, setTier] = React.useState<string | null>("100K");

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
      : step === 4 ? "Pick a starting balance. You can scale up after your first payout."
      : "Review your selection and proceed to checkout.";

  return (
    <AuthShell>
      <div className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">{heading}</h1>
        <p className="mt-3 text-sm text-white/70">{subtitle}</p>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <AuthCard heading={`Step ${step} of ${STEPS.length} — ${STEPS[step - 1]!.label}`}>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIERS.map((t) => {
                const active = tier === t.tier;
                return (
                  <button
                    key={t.tier}
                    type="button"
                    onClick={() => setTier(t.tier)}
                    className={cn(
                      "relative text-left rounded-2xl border p-4 transition-all",
                      active
                        ? "border-[#5BA8E5] bg-[#5BA8E5]/10"
                        : "border-white/15 bg-white/[0.03] hover:border-white/30"
                    )}
                  >
                    {active && (
                      <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-md bg-[#5BA8E5] text-white px-2 py-0.5 text-[10px] font-semibold">
                        <Check className="h-3 w-3" /> Selected
                      </span>
                    )}
                    <div className="text-white/65 text-xs font-medium uppercase tracking-wider">
                      {t.tier} evaluation
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {formatCurrency(t.evaluationFeeCents)}
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-white/65">
                      <li>{formatCurrency(t.profitTargetCents)} target</li>
                      <li>{formatCurrency(t.drawdownCents)} drawdown</li>
                      <li>{t.maxContracts} contracts</li>
                    </ul>
                  </button>
                );
              })}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3 text-sm text-white/80">
              <p>
                Ready to take your <span className="font-semibold text-white">{tier}</span> evaluation? Card payment
                is processed through NMI's hosted page — your card data never touches Gen One.
              </p>
              <p className="text-xs text-white/55">
                Loyalty discount, promo code and wallet credit are all applied automatically before the card charge.
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
                  onClick={() => router.push(`/purchase${tier ? `?tier=${tier}` : ""}`)}
                >
                  <Sparkles className="inline h-4 w-4 mr-1" /> Continue to checkout
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
