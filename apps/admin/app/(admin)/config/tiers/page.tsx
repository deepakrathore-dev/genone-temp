"use client";
import * as React from "react";
import { useTiers } from "@/lib/queries";
import { useUpdateTier } from "@/lib/mutations";
import { ConfigPageShell } from "@/components/config/ConfigPageShell";
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Input, Label, Skeleton, Badge, formatCurrency,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@genone/ui";
import type { TierConfig } from "@genone/types";
import { Save } from "lucide-react";

const FIELDS: Array<{ key: keyof TierConfig; label: string; isCurrency?: boolean }> = [
  { key: "evaluationFeeCents", label: "Evaluation fee", isCurrency: true },
  { key: "profitTargetCents", label: "Profit target", isCurrency: true },
  { key: "drawdownCents", label: "EOD drawdown", isCurrency: true },
  { key: "dailyLossCents", label: "Daily loss", isCurrency: true },
  { key: "bufferCents", label: "Buffer", isCurrency: true },
  { key: "firstPayoutCapCents", label: "First payout cap", isCurrency: true },
  { key: "maxContracts", label: "Max contracts" },
  { key: "inactivityDays", label: "Inactivity (days)" },
];

export default function TiersConfigPage() {
  const { data, isLoading } = useTiers();
  const m = useUpdateTier();
  const [pending, setPending] = React.useState<{ tier: string; payload: Record<string, number> } | null>(null);

  return (
    <ConfigPageShell
      title="Tier configuration"
      description="Changes apply only to new accounts. Existing accounts keep their rule snapshot."
      auditFilter={(a) => a.includes("TIER")}
    >
      {isLoading || !data ? <Skeleton className="h-64" /> : data.map((t) => (
        <Card key={t.tier}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><Badge variant="primary">{t.tier}</Badge> tier</CardTitle>
            <span className="text-xs text-[var(--text-muted)] font-mono">ID {t.tier}</span>
          </CardHeader>
          <TierForm tier={t} onSave={(payload) => setPending({ tier: t.tier, payload })} />
        </Card>
      ))}

      <Dialog open={!!pending} onOpenChange={(v) => !v && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm tier update</DialogTitle>
            <DialogDescription>
              {pending && `Update ${pending.tier} tier. New rules apply to new accounts only. This is audit-logged and requires TOTP.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label>TOTP code</Label>
            <Input placeholder="6-digit code" id="totp" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
            <Button onClick={() => { if (pending) { m.mutate({ tier: pending.tier, payload: pending.payload }); setPending(null); } }}>
              Confirm update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfigPageShell>
  );
}

function TierForm({ tier, onSave }: { tier: TierConfig; onSave: (payload: Record<string, number>) => void }) {
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, tier[f.key] as number]))
  );

  return (
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label>{f.label} {f.isCurrency && <span className="text-[10px] text-[var(--text-faint)]">(USD)</span>}</Label>
            <Input
              type="number"
              value={f.isCurrency ? (values[f.key] ?? 0) / 100 : values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: f.isCurrency ? Math.round(Number(e.target.value) * 100) : Number(e.target.value) }))}
              className="font-mono"
            />
            <div className="text-[10px] text-[var(--text-faint)] font-mono">
              Current: {f.isCurrency ? formatCurrency(tier[f.key] as number) : tier[f.key]}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => onSave(values)}><Save className="h-3.5 w-3.5" /> Save changes</Button>
      </div>
    </CardContent>
  );
}
