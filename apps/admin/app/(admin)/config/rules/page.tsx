"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function UniversalRulesConfigPage() {
  return (
    <ConfigPageShell
      title="Universal rules"
      description="Rules that apply across all tiers. Changes affect new accounts only; existing accounts keep their rule snapshot."
      auditFilter={(a) => a.includes("RULE")}
    >
      <SimpleConfigForm
        title="Funded rules"
        description="REQ-117 to REQ-122. Default values per PRD v4."
        fields={[
          { key: "greenDayThreshold", label: "Green day threshold ($)", type: "currency", value: 200, help: "P&L at or above this counts as a green day" },
          { key: "consistencyPct", label: "Consistency rule (%)", type: "percent", value: 50, help: "Single day must not exceed % of cumulative profit" },
          { key: "greenDaysRequired", label: "Green days required", type: "number", value: 5, help: "Days needed before payout request" },
          { key: "profitSplitPct", label: "Profit split - trader (%)", type: "percent", value: 80, help: "Default 80/20 (90/10 candidate)" },
          { key: "maxCopyAccounts", label: "Max accounts per user", type: "number", value: 10 },
          { key: "scaleThreshold", label: "Scale threshold ($)", type: "currency", value: 10_000, help: "Cumulative withdrawal that triggers auto-upgrade" },
        ]}
      />
    </ConfigPageShell>
  );
}
