import { AlertTriangle, CheckCircle2, Pause, Lock, XCircle, Sparkles } from "lucide-react";
import type { Account } from "@genone/types";
import { cn } from "@genone/ui";

const CONFIG: Record<Account["status"], { label: string; sub: string; tone: string; icon: React.ComponentType<{ className?: string }> }> = {
  ACTIVE: {
    label: "Account active",
    sub: "Trading is unrestricted within tier rules.",
    tone: "bg-[var(--success-soft)] border-[var(--success)]/30 text-[var(--success)]",
    icon: CheckCircle2,
  },
  DAILY_LOSS_LOCKED: {
    label: "Daily loss limit hit - locked until 6:00 PM ET",
    sub: "Account resumes trading at the next session open.",
    tone: "bg-[var(--warning-soft)] border-[var(--warning)]/30 text-[var(--warning)]",
    icon: Lock,
  },
  PASSED: {
    label: "Evaluation passed - funded account on the way",
    sub: "Rithmic credentials are being provisioned.",
    tone: "bg-[var(--info-soft)] border-[var(--info)]/30 text-[var(--info)]",
    icon: Sparkles,
  },
  FAILED: {
    label: "Account closed - drawdown breached",
    sub: "Use your loyalty credit on the next attempt.",
    tone: "bg-[var(--danger-soft)] border-[var(--danger)]/30 text-[var(--danger)]",
    icon: XCircle,
  },
  INACTIVE: {
    label: "Account inactive",
    sub: "30-day inactivity timer has elapsed.",
    tone: "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)]",
    icon: AlertTriangle,
  },
  PAUSED: {
    label: "Trading paused",
    sub: "An admin has temporarily paused this account.",
    tone: "bg-[var(--info-soft)] border-[var(--info)]/30 text-[var(--info)]",
    icon: Pause,
  },
};

export function StatusBanner({ account }: { account: Account }) {
  const c = CONFIG[account.status];
  const Icon = c.icon;
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", c.tone)}>
      <Icon className="h-5 w-5 shrink-0" />
      <div>
        <div className="text-sm font-semibold">{c.label}</div>
        <div className="text-xs opacity-90">{c.sub}</div>
      </div>
    </div>
  );
}
