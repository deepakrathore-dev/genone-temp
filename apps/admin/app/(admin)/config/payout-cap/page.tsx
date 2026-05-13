"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function PayoutCapPage() {
  return (
    <ConfigPageShell
      title="Daily payout cap"
      description="REQ-131. Hard cap on total disbursements per day."
      auditFilter={(a) => a.includes("PAYOUT_CAP") || a.includes("DAILY")}
    >
      <SimpleConfigForm
        title="Limits"
        fields={[
          { key: "dailyCap", label: "Daily cap ($)", type: "currency", value: 5_000_000, help: "All amounts auto-paused beyond this" },
          { key: "rolloverSurplus", label: "Roll surplus to next day", type: "switch", value: false },
        ]}
      />
    </ConfigPageShell>
  );
}
