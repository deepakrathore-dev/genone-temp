"use client";
import * as React from "react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Input, Label, formatCurrency,
} from "@genone/ui";
import { GateChecklist } from "./GateChecklist";
import type { Account, GateStatus } from "@genone/types";
import { useRequestPayout } from "@/lib/mutations";

const SAMPLE_GATE: GateStatus = {
  kyc: "PASS",
  buffer: "PASS",
  greenDays: "PASS",
  consistency: "PASS",
  fraudFlags: "PASS",
  dailyCap: "PASS",
  details: {
    kyc: "Verified",
    buffer: "Buffer built",
    greenDays: "5/5 accumulated",
    consistency: "Compliant",
    fraudFlags: "No active flags",
    dailyCap: "Below daily cap",
  },
};

export function PayoutRequestForm({ account }: { account: Account }) {
  const [amount, setAmount] = React.useState(Math.min(50_000, account.ruleSnapshot.firstPayoutCapCents) / 100);
  const mutation = useRequestPayout();
  // Build live gate from the account state
  const gate: GateStatus = {
    kyc: "PASS", // simplified for trader view (real check is on the server)
    buffer: account.buffersBuiltCents >= account.ruleSnapshot.bufferCents ? "PASS" : "FAIL",
    greenDays: account.greenDaysCount >= account.ruleSnapshot.greenDaysRequired ? "PASS" : "FAIL",
    consistency: account.consistencyMaxDayPct <= account.ruleSnapshot.consistencyPct ? "PASS" : "FAIL",
    fraudFlags: "PASS",
    dailyCap: "PASS",
    details: {
      buffer: `${formatCurrency(account.buffersBuiltCents)} of ${formatCurrency(account.ruleSnapshot.bufferCents)}`,
      greenDays: `${account.greenDaysCount}/${account.ruleSnapshot.greenDaysRequired} accumulated`,
      consistency: `Peak single-day share ${account.consistencyMaxDayPct}%`,
    },
  };
  const eligible = Object.entries(gate).filter(([k]) => k !== "details").every(([, v]) => v === "PASS");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a payout</CardTitle>
        <CardDescription>
          Bank transfer via Gen One Finance. ETA 2–3 business days from approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Amount (USD)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={100}
              step={50}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="font-mono"
            />
            <span className="text-xs text-[var(--text-muted)] font-mono whitespace-nowrap">
              cap {formatCurrency(account.ruleSnapshot.firstPayoutCapCents)}
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-faint)]">
            First payout is hard-limited to the tier-specific cap above. Subsequent payouts have no cap.
          </p>
        </div>

        <GateChecklist gate={gate} eligible={eligible} />

        <Button
          disabled={!eligible || mutation.isPending}
          onClick={() => mutation.mutate({ accountId: account.id, amountCents: Math.round(amount * 100) })}
          className="w-full"
        >
          {mutation.isPending ? "Submitting…" : "Submit payout request"}
        </Button>
      </CardContent>
    </Card>
  );
}
