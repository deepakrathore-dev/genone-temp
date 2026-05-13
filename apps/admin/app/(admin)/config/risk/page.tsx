"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function RiskRulesConfigPage() {
  return (
    <ConfigPageShell
      title="Risk rules"
      description="REQ-129. System-level guardrails reviewed quarterly."
      auditFilter={(a) => a.includes("RISK") || a.includes("PAYOUT_RATIO")}
    >
      <SimpleConfigForm
        title="Payout ratio ceiling"
        description="Auto-suspends all payout approvals if cumulative payouts exceed % of revenue."
        fields={[
          { key: "ceiling", label: "Ceiling (%)", type: "percent", value: 15, help: "Industry typical 10–20%" },
          { key: "freezeOnBreach", label: "Auto-freeze on breach", type: "switch", value: true },
        ]}
      />
    </ConfigPageShell>
  );
}
