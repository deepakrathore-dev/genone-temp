"use client";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Input, Label, Button, formatCurrency, cn } from "@genone/ui";
import { Lock } from "lucide-react";

/**
 * Visual surface for the NMI hosted payment page. In production, the form
 * fields are rendered by NMI inside an iframe so the card number never
 * touches Gen One infrastructure (PCI SAQ-A scope).
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--success)]" />
            Card details
          </CardTitle>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-faint)] font-mono">Secured by NMI</span>
        </div>
        <CardDescription>
          Card information is processed by NMI on their hosted page. Gen One never sees your card number.
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
                placeholder="0000 0000 0000 0000"
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
              <Input value={cvc} onChange={(e) => setCvc(e.target.value)} inputMode="numeric" className="font-mono" placeholder="123" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing || !name}
            className={cn("w-full h-11 text-base", isProcessing && "opacity-80")}
          >
            {isProcessing ? "Processing payment…" : `Pay ${formatCurrency(totalCents)}`}
          </Button>
          <p className="text-[10px] text-center text-[var(--text-faint)]">
            By paying, you re-confirm acceptance of the risk disclosure and terms of use.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
