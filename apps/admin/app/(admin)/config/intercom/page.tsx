"use client";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import { SimpleConfigForm } from "@/components/config/SimpleConfigForm";

export default function IntercomConfigPage() {
  return (
    <ConfigPageShell
      title="Intercom integration"
      description="REQ-135 to REQ-137. Messenger and Help Center configuration."
      auditFilter={(a) => a.includes("INTERCOM")}
    >
      <SimpleConfigForm
        title="App credentials"
        description="Stored as encrypted env vars and only fetched server-side."
        fields={[
          { key: "appId", label: "Intercom App ID", type: "text", value: "abc1d2e3" },
          { key: "hmacSecret", label: "Identity verification secret", type: "text", value: "************" },
          { key: "helpCenterUrl", label: "Help Center URL", type: "text", value: "https://help.genone.example/" },
          { key: "enableMessenger", label: "Enable Messenger widget", type: "switch", value: true },
        ]}
      />
    </ConfigPageShell>
  );
}
