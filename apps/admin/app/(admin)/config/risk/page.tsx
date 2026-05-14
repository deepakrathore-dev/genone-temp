"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function RiskRulesConfigPage() {
  return (
    <ConfigPageShell
      title="Risk controls"
      description="System-wide guardrails reviewed quarterly. Designed to halt automatic disbursement when business metrics drift outside expected ranges."
      auditFilter={(a) => a.includes("RISK") || a.includes("PAYOUT_RATIO")}
    >
      <SimpleConfigForm
        title="Payout ratio ceiling"
        description="Automatically pauses all payout approvals if cumulative payouts exceed this share of revenue."
        fields={[
          { key: "ceiling", label: "Ceiling (%)", type: "percent", value: 15, help: "Industry typical range is 10 to 20 percent." },
          { key: "freezeOnBreach", label: "Auto-freeze on breach", type: "switch", value: true },
        ]}
      />
    </ConfigPageShell>
  );
}
