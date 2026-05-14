"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function LoyaltyConfigPage() {
  return (
    <ConfigPageShell
      title="Loyalty programme"
      description="Pass credits and per-attempt discounts that reward repeat traders."
      auditFilter={(a) => a.includes("LOYALTY") || a.includes("CREDIT")}
    >
      <SimpleConfigForm
        title="Pass credit"
        description="Issued to the trader's wallet automatically when an evaluation is passed."
        fields={[{ key: "passCreditPct", label: "Pass credit (% of fee)", type: "percent", value: 20, help: "Auto-issued to the wallet on a successful evaluation pass." }]}
      />
      <SimpleConfigForm
        title="Loyalty discount tiers"
        description="A tier unlocks at the listed attempt count and grants the listed percentage off all future evaluations."
        fields={[
          { key: "tier1Attempts", label: "Tier 1 attempts", type: "number", value: 3 },
          { key: "tier1Pct", label: "Tier 1 discount (%)", type: "percent", value: 2 },
          { key: "tier2Attempts", label: "Tier 2 attempts", type: "number", value: 5 },
          { key: "tier2Pct", label: "Tier 2 discount (%)", type: "percent", value: 5 },
          { key: "tier3Attempts", label: "Tier 3 attempts", type: "number", value: 10 },
          { key: "tier3Pct", label: "Tier 3 discount (%)", type: "percent", value: 10 },
        ]}
      />
    </ConfigPageShell>
  );
}
