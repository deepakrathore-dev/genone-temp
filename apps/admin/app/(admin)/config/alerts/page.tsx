"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function AlertsConfigPage() {
  return (
    <ConfigPageShell
      title="KPI alert thresholds"
      description="REQ-130. Alerts notify ops when key metrics deviate."
      auditFilter={(a) => a.includes("ALERT")}
    >
      <SimpleConfigForm
        title="Pass rate"
        fields={[
          { key: "passRateLow", label: "Low threshold (%)", type: "percent", value: 3 },
          { key: "passRateHigh", label: "High threshold (%)", type: "percent", value: 10 },
        ]}
      />
      <SimpleConfigForm
        title="Customer acquisition cost"
        fields={[{ key: "cacMax", label: "CAC max ($)", type: "currency", value: 50_000 }]}
      />
      <SimpleConfigForm
        title="Payout ratio"
        fields={[{ key: "payoutRatioMax", label: "Payout ratio max (%)", type: "percent", value: 15 }]}
      />
    </ConfigPageShell>
  );
}
