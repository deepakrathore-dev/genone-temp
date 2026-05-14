"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function PayoutCapPage() {
  return (
    <ConfigPageShell
      title="Daily payout cap"
      description="A hard ceiling on total disbursements per calendar day. Further payouts auto-pause until the next day rolls over."
      auditFilter={(a) => a.includes("PAYOUT_CAP") || a.includes("DAILY")}
    >
      <SimpleConfigForm
        title="Limits"
        fields={[
          { key: "dailyCap", label: "Daily cap ($)", type: "currency", value: 5_000_000, help: "All payouts beyond this amount are auto-paused for the day." },
          { key: "rolloverSurplus", label: "Roll unused capacity to next day", type: "switch", value: false },
        ]}
      />
    </ConfigPageShell>
  );
}
