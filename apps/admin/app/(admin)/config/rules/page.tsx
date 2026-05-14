"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function UniversalRulesConfigPage() {
  return (
    <ConfigPageShell
      title="Universal rules"
      description="Rules that apply across every tier. Changes affect new accounts only; existing accounts keep their original snapshot."
      auditFilter={(a) => a.includes("RULE")}
    >
      <SimpleConfigForm
        title="Funded account rules"
        description="Payout gating and scale behaviour for funded accounts."
        fields={[
          { key: "greenDayThreshold", label: "Green day threshold ($)", type: "currency", value: 200, help: "A day's profit at or above this amount counts as a green day." },
          { key: "consistencyPct", label: "Consistency rule (%)", type: "percent", value: 50, help: "A single day must not exceed this share of cumulative profit." },
          { key: "greenDaysRequired", label: "Green days required", type: "number", value: 5, help: "Number of green days needed before a payout request is allowed." },
          { key: "profitSplitPct", label: "Profit split, trader (%)", type: "percent", value: 80, help: "The trader's share of profit at payout." },
          { key: "maxCopyAccounts", label: "Max accounts per trader", type: "number", value: 10 },
          { key: "scaleThreshold", label: "Scale threshold ($)", type: "currency", value: 10_000, help: "Cumulative withdrawal that auto-upgrades the trader to the next tier." },
        ]}
      />
    </ConfigPageShell>
  );
}
