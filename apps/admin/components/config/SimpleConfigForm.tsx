"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Switch } from "@genone/ui";
import { Save } from "lucide-react";
import { toast } from "sonner";

export interface ConfigField {
  key: string;
  label: string;
  type?: "number" | "currency" | "percent" | "text" | "switch";
  value: number | string | boolean;
  help?: string;
  step?: number;
}

export function SimpleConfigForm({
  title,
  description,
  fields,
}: {
  title: string;
  description?: string;
  fields: ConfigField[];
}) {
  const [state, setState] = React.useState(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.value])) as Record<string, number | string | boolean>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label>{f.label}</Label>
              {f.type === "switch" ? (
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    checked={Boolean(state[f.key])}
                    onCheckedChange={(v) => setState((s) => ({ ...s, [f.key]: v }))}
                  />
                  <span className="text-xs text-[var(--text-muted)]">{state[f.key] ? "Enabled" : "Disabled"}</span>
                </div>
              ) : (
                <Input
                  type={f.type === "text" ? "text" : "number"}
                  step={f.step ?? (f.type === "percent" ? 0.1 : 1)}
                  value={String(state[f.key] ?? "")}
                  onChange={(e) => setState((s) => ({ ...s, [f.key]: f.type === "text" ? e.target.value : Number(e.target.value) }))}
                  className="font-mono"
                />
              )}
              {f.help && <p className="text-[10px] text-[var(--text-faint)]">{f.help}</p>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success(`${title} saved`)}><Save className="h-3.5 w-3.5" /> Save changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
