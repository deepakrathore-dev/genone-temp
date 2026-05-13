"use client";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Input, Label, Button, formatCurrency, cn } from "@genone/ui";
import { Lock, AlertTriangle } from "lucide-react";

/**
 * Visual simulation of the NMI hosted payment page. In production this is replaced
 * with NMI's iframe (Collect.js). The PCI scope stays SAQ-A because the iframe is
 * served from NMI's domain - Gen One never sees the card number.
 */
export function NmiHostedPanel({
  totalCents,
  onSubmit,
  isProcessing,
}: {
  totalCents: number;
  onSubmit: () => void;
  isProcessing: boolean;
}) {
  const [number, setNumber] = React.useState("4242 4242 4242 4242");
  const [exp, setExp] = React.useState("12/29");
  const [cvc, setCvc] = React.useState("123");
  const [name, setName] = React.useState("");
  const [forceFail, setForceFail] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (forceFail) {
      setError("Card declined. Try a different payment method.");
      return;
    }
    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--success)]" /> NMI hosted payment
          </CardTitle>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-faint)] font-mono">PCI SAQ-A</span>
        </div>
        <CardDescription>
          Card data is captured by NMI&apos;s hosted page (iframe). Gen One never sees it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label>Cardholder name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name on card" />
          </div>
          <div className="space-y-1">
            <Label>Card number</Label>
            <div className="relative">
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                inputMode="numeric"
                className="font-mono pr-12"
                placeholder="•••• •••• •••• ••••"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-faint)]">VISA</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Expiry</Label>
              <Input value={exp} onChange={(e) => setExp(e.target.value)} className="font-mono" placeholder="MM/YY" />
            </div>
            <div className="space-y-1">
              <Label>CVC</Label>
              <Input value={cvc} onChange={(e) => setCvc(e.target.value)} inputMode="numeric" className="font-mono" placeholder="•••" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={forceFail}
              onChange={(e) => setForceFail(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[var(--border-strong)]"
            />
            Simulate decline (REQ-009 - payment failure handling)
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{error}</div>
                <div className="opacity-80 mt-0.5">
                  The request was idempotent - your card was not double-charged. Update card and retry.
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isProcessing || !name}
            className={cn("w-full h-11 text-base", isProcessing && "opacity-80")}
          >
            {isProcessing ? "Processing payment…" : `Pay ${formatCurrency(totalCents)}`}
          </Button>
          <p className="text-[10px] text-center text-[var(--text-faint)]">
            By paying, you re-confirm acceptance of the Risk Disclosure and Terms of Use.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
