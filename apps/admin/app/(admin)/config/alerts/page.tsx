"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function AlertsConfigPage() {
  return (
    <ConfigPageShell
      title="KPI alert thresholds"
      description="When a key metric drifts outside the configured range, the operations team is notified by email and in-platform."
      auditFilter={(a) => a.includes("ALERT")}
    >
      <SimpleConfigForm
        title="Pass rate"
        description="Alerts fire when the rolling 30-day pass rate falls outside this range."
        fields={[
          { key: "passRateLow", label: "Low threshold (%)", type: "percent", value: 3 },
          { key: "passRateHigh", label: "High threshold (%)", type: "percent", value: 10 },
        ]}
      />
      <SimpleConfigForm
        title="Customer acquisition cost"
        description="Alerts fire when average CAC across active acquisition channels exceeds this amount."
        fields={[{ key: "cacMax", label: "CAC max ($)", type: "currency", value: 50_000 }]}
      />
      <SimpleConfigForm
        title="Payout ratio"
        description="Alerts fire when payouts exceed this share of revenue."
        fields={[{ key: "payoutRatioMax", label: "Payout ratio max (%)", type: "percent", value: 15 }]}
      />
    </ConfigPageShell>
  );
}
