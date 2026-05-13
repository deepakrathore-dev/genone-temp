"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function AffiliateConfigPage() {
  return (
    <ConfigPageShell
      title="Affiliate programme"
      description="REQ-126, REQ-127. Base commission and tiered uplift thresholds."
      auditFilter={(a) => a.includes("AFFILIATE")}
    >
      <SimpleConfigForm
        title="Commission structure"
        fields={[
          { key: "base", label: "Base commission (%)", type: "percent", value: 15 },
          { key: "tier1Signups", label: "Tier 1 signups/mo", type: "number", value: 20 },
          { key: "tier1Pct", label: "Tier 1 commission (%)", type: "percent", value: 20 },
          { key: "tier2Signups", label: "Tier 2 signups/mo", type: "number", value: 50 },
          { key: "tier2Pct", label: "Tier 2 commission (%)", type: "percent", value: 25 },
          { key: "cookie", label: "Attribution cookie (days)", type: "number", value: 60 },
        ]}
      />
    </ConfigPageShell>
  );
}
