"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Badge, cn, formatCurrency } from "@genone/ui";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { TIERS } from "@genone/mock-data";

const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Profile" },
  { id: 3, label: "KYC (optional)" },
  { id: 4, label: "Pick a tier" },
  { id: 5, label: "First purchase" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [tier, setTier] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Let&apos;s set you up</CardTitle>
          <CardDescription>Five quick steps from registration to your first evaluation.</CardDescription>
          <div className="flex items-center gap-1 mt-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium border",
                  s.id < step ? "bg-[var(--success)] text-white border-transparent" :
                  s.id === step ? "bg-[var(--primary)] text-white border-transparent" :
                  "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]"
                )}>
                  {s.id < step ? <Check className="h-3.5 w-3.5" /> : s.id}
                </div>
                {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", s.id < step ? "bg-[var(--success)]" : "bg-[var(--border)]")} />}
              </div>
            ))}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">Step {step} of 5 - {STEPS[step - 1]!.label}</div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-muted)]">
                Welcome to Gen One. Trade futures simulated on Rithmic, pass an evaluation, and get a funded account with an 80/20 profit split. Withdraw via bank transfer.
              </p>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-2 text-sm">
              <p>Your account is created. We&apos;ve sent a verification link to your email. You can complete that anytime - but you&apos;ll need it before your first payout.</p>
              <Badge variant="info">Email verification pending</Badge>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-2 text-sm">
              <p>You can complete KYC now or wait until your first payout request. Deferring lets you start trading right away.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Verify with Veriff</Button>
                <Button variant="ghost" size="sm">Skip for now</Button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIERS.map((t) => (
                <button
                  key={t.tier}
                  onClick={() => setTier(t.tier)}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-colors hover:border-[var(--primary)]",
                    tier === t.tier ? "border-[var(--primary)] ring-2 ring-[var(--ring)]" : "border-[var(--border)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{t.tier}</span>
                    <span className="text-lg font-mono font-bold">{formatCurrency(t.evaluationFeeCents)}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-[var(--text-muted)] font-mono">
                    <li>Profit target {formatCurrency(t.profitTargetCents)}</li>
                    <li>Drawdown {formatCurrency(t.drawdownCents)}</li>
                    <li>Daily loss {formatCurrency(t.dailyLossCents)}</li>
                    <li>{t.maxContracts} max contracts</li>
                  </ul>
                </button>
              ))}
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3 text-sm">
              <p>
                You picked the <span className="font-semibold">{tier ?? "100K"}</span> evaluation. Next you&apos;ll
                review pricing, apply any discounts or wallet credit, and pay through NMI&apos;s hosted page -
                card data never touches our servers.
              </p>
              <div className="rounded-xl border border-[var(--border)] p-3 text-xs font-mono text-[var(--text-muted)] leading-relaxed">
                Loyalty discount → promo code → wallet credit are applied automatically before the card charge.
                You can skip and come back later - your account stays in good standing.
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</Button>
            {step < 5 ? (
              <Button onClick={() => setStep((s) => Math.min(5, s + 1))}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                  Skip for now
                </Button>
                <Button onClick={() => router.push(`/purchase${tier ? `?tier=${tier}` : ""}`)}>
                  <Sparkles className="h-4 w-4" /> Continue to checkout
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-center text-[var(--text-faint)] mt-4">
            <Link href="/login" className="hover:underline">Already onboarded? Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
