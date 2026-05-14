"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function IntercomConfigPage() {
  return (
    <ConfigPageShell
      title="Customer support integration"
      description="Live chat widget and help center configuration. Powers the support experience for every signed-in trader."
      auditFilter={(a) => a.includes("INTERCOM")}
    >
      <SimpleConfigForm
        title="Connection details"
        description="Credentials are stored as encrypted environment variables and only fetched server-side."
        fields={[
          { key: "appId", label: "Application ID", type: "text", value: "abc1d2e3" },
          { key: "hmacSecret", label: "Identity verification secret", type: "text", value: "************" },
          { key: "helpCenterUrl", label: "Help center URL", type: "text", value: "https://help.genone.example/" },
          { key: "enableMessenger", label: "Show messenger widget", type: "switch", value: true },
        ]}
      />
    </ConfigPageShell>
  );
}
