"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function AffiliateConfigPage() {
  return (
    <ConfigPageShell
      title="Affiliate programme"
      description="Base commission rate and the volume-based tiers that reward high performers automatically each month."
      auditFilter={(a) => a.includes("AFFILIATE")}
    >
      <SimpleConfigForm
        title="Commission structure"
        fields={[
          { key: "base", label: "Base commission (%)", type: "percent", value: 15 },
          { key: "tier1Signups", label: "Tier 1 signups per month", type: "number", value: 20 },
          { key: "tier1Pct", label: "Tier 1 commission (%)", type: "percent", value: 20 },
          { key: "tier2Signups", label: "Tier 2 signups per month", type: "number", value: 50 },
          { key: "tier2Pct", label: "Tier 2 commission (%)", type: "percent", value: 25 },
          { key: "cookie", label: "Attribution cookie (days)", type: "number", value: 60 },
        ]}
      />
    </ConfigPageShell>
  );
}
