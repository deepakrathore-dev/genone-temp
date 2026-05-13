import * as React from "react";
import { cn } from "./cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] p-10 text-center", className)}>
      {Icon && <Icon className="h-10 w-10 text-[var(--text-faint)]" />}
      <div className="text-sm font-medium text-[var(--text)]">{title}</div>
      {description && <div className="text-xs text-[var(--text-muted)] max-w-md">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
