import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@genone/ui";

export function ProfileSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function Field({
  label,
  value,
  mono,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">{label}</div>
      <div className={mono ? "font-mono text-sm text-[var(--text)]" : "text-sm text-[var(--text)]"}>
        {value || <span className="text-[var(--text-faint)]">Not set</span>}
      </div>
      {hint && <div className="text-[10px] text-[var(--text-faint)]">{hint}</div>}
    </div>
  );
}
