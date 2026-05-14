"use client";
import * as React from "react";
import { useEmailTemplates } from "@/lib/queries";
import { useUpdateEmailTemplate, useSendEmailTemplateTest } from "@/lib/mutations";
import { RoleGate, useCan } from "@/components/global/RoleGate";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Input, Label, Textarea, Skeleton, Switch, Separator,
  formatDate,
} from "@genone/ui";
import { Mail, Send, FileText } from "lucide-react";
import type { EmailTemplate } from "@genone/types";

const CATEGORY_LABEL: Record<EmailTemplate["category"], string> = {
  EVALUATION: "Evaluation",
  FUNDED: "Funded",
  PAYOUT: "Payout",
  LOYALTY: "Loyalty",
  MARKETING: "Marketing",
  ADMIN: "Admin",
};
const CATEGORY_VARIANT: Record<EmailTemplate["category"], "info" | "accent" | "success" | "primary" | "warning" | "neutral"> = {
  EVALUATION: "info",
  FUNDED: "accent",
  PAYOUT: "success",
  LOYALTY: "primary",
  MARKETING: "warning",
  ADMIN: "neutral",
};

export default function EmailTemplatesPage() {
  return (
    <RoleGate permission="proptech.view" fallback="deny">
      <Inner />
    </RoleGate>
  );
}

function Inner() {
  const { data, isLoading } = useEmailTemplates();
  const canWrite = useCan("proptech.write");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedId && data && data.length > 0) setSelectedId(data[0]!.id);
  }, [data, selectedId]);

  const selected = (data ?? []).find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Email templates</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Templates used for every automated email Gen One sends. Edit the subject and body, and send a test message to your inbox before publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 h-fit">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--primary)]" />
              All templates
            </CardTitle>
            <CardDescription>{data?.length ?? 0} templates</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? <Skeleton className="h-64 m-4" /> : (
              <ul className="divide-y divide-[var(--border)]">
                {(data ?? []).map((t) => {
                  const active = t.id === selectedId;
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => setSelectedId(t.id)}
                        className={`w-full text-left px-4 py-3 transition-colors ${active ? "bg-[var(--primary-soft)]" : "hover:bg-[var(--surface-2)]"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{t.name}</span>
                          <Badge variant={CATEGORY_VARIANT[t.category]}>{CATEGORY_LABEL[t.category]}</Badge>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] truncate mt-0.5 font-mono">{t.key}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-8">
          {selected ? (
            <TemplateEditor template={selected} canWrite={canWrite} />
          ) : (
            <Card><CardContent className="py-16 text-center text-sm text-[var(--text-muted)]">Pick a template on the left to edit.</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateEditor({ template, canWrite }: { template: EmailTemplate; canWrite: boolean }) {
  const [subject, setSubject] = React.useState(template.subject);
  const [bodyHtml, setBodyHtml] = React.useState(template.bodyHtml);
  const [active, setActive] = React.useState(template.active);
  const [testEmail, setTestEmail] = React.useState("");

  const update = useUpdateEmailTemplate();
  const sendTest = useSendEmailTemplateTest();

  React.useEffect(() => {
    setSubject(template.subject);
    setBodyHtml(template.bodyHtml);
    setActive(template.active);
  }, [template]);

  // Naive preview: swap {{var}} for placeholder text
  const preview = bodyHtml.replace(/\{\{(\w+)\}\}/g, (_, v) => `<span style="color: var(--primary); background: var(--primary-soft); padding: 1px 4px; border-radius: 3px;">${v}</span>`);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--primary)]" />
            {template.name}
          </CardTitle>
          <CardDescription className="font-mono text-xs mt-1">
            {template.key} · {CATEGORY_LABEL[template.category]} · last updated {formatDate(template.updatedAt, "datetime")}{template.updatedBy ? ` by ${template.updatedBy}` : ""}
          </CardDescription>
        </div>
        <Badge variant={active ? "success" : "neutral"}>{active ? "Active" : "Paused"}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!canWrite} />
        </div>
        <div className="space-y-1">
          <Label>Body (HTML)</Label>
          <Textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            rows={8}
            className="font-mono text-xs"
            disabled={!canWrite}
          />
          <p className="text-[10px] text-[var(--text-faint)]">
            Use {"{{variableName}}"} to insert dynamic content. Available variables for this template: {template.variables.map((v) => <code key={v} className="font-mono ml-1 text-[10px] bg-[var(--surface-2)] px-1 rounded">{`{{${v}}}`}</code>)}
          </p>
        </div>

        <div className="space-y-1">
          <Label>Preview</Label>
          <div
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>

        {canWrite && (
          <>
            <label className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2">
              <div>
                <div className="text-sm font-medium">Active</div>
                <div className="text-xs text-[var(--text-muted)]">If paused, this email is suppressed for the lifetime of the pause.</div>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </label>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex-1 space-y-1">
                <Label>Send a test to</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                disabled={!testEmail || !/^.+@.+\..+$/.test(testEmail)}
                onClick={() => sendTest.mutate({ id: template.id, to: testEmail })}
              >
                <Send className="h-3.5 w-3.5" /> Send test
              </Button>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={() => update.mutate({ id: template.id, payload: { subject, bodyHtml, active } })}
              >
                Save changes
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
