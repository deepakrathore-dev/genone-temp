"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function LoyaltyConfigPage() {
  return (
    <ConfigPageShell
      title="Loyalty programme"
      description="REQ-123, REQ-124. Pass credit and per-attempt loyalty discounts."
      auditFilter={(a) => a.includes("LOYALTY") || a.includes("CREDIT")}
    >
      <SimpleConfigForm
        title="Pass credit"
        fields={[{ key: "passCreditPct", label: "Pass credit (% of fee)", type: "percent", value: 20, help: "Auto-issued to wallet on evaluation pass" }]}
      />
      <SimpleConfigForm
        title="Loyalty discount tiers"
        description="Tier unlocks at the listed attempt count and grants the listed percentage off all future evaluations."
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
