"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  formatCurrency,
  cn,
  Badge,
} from "@genone/ui";
import type { Account } from "@genone/types";
import { Zap, ShieldCheck, AlertTriangle } from "lucide-react";
import { useUi } from "@/lib/stores/ui.store";

export function RulesPanel({ account }: { account: Account }) {
  const { rulesPanelOpen } = useUi();
  if (!rulesPanelOpen) return null;
  const r = account.ruleSnapshot;
  return (
    <aside
      className={cn(
        "hidden xl:flex flex-col gap-3 w-72 shrink-0 sticky top-16 self-start max-h-[calc(100vh-4.5rem)] overflow-y-auto"
      )}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
            Tier Rules
          </CardTitle>
          <Badge variant="primary">{account.tier}</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-xs font-mono">
          <Row label="Profit target" value={formatCurrency(r.profitTargetCents)} />
          <Row label="EOD drawdown" value={formatCurrency(r.drawdownCents)} />
          <Row label="Daily loss" value={formatCurrency(r.dailyLossCents)} />
          <Row label="Max contracts" value={`${r.maxContracts} minis`} />
          <Row label="Buffer" value={formatCurrency(r.bufferCents)} />
          <Row label="First payout cap" value={formatCurrency(r.firstPayoutCapCents)} />
          <Row label="Green day threshold" value={`${formatCurrency(r.greenDayThresholdCents)}+`} />
          <Row label="Green days required" value={`${r.greenDaysRequired}`} />
          <Row label="Consistency" value={`${r.consistencyPct}%`} />
          <Row label="Profit split" value={`${r.profitSplitPct}/${100 - r.profitSplitPct}`} />
          <Row label="Inactivity" value={`${r.inactivityDays} days`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--warning)]" />
            Auto-liquidation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-[var(--text-muted)] leading-relaxed">
          All open positions are force-closed daily at <span className="text-[var(--text)] font-medium">4:00 PM ET</span>. This is a market order against live prices and eliminates overnight gap risk against the EOD drawdown rule.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--info)]" />
            Heads up
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-[var(--text-muted)] leading-relaxed">
          Rule changes by admin only affect new accounts. This account is permanently bound to the rules captured above at creation.
        </CardContent>
      </Card>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">{label}</span>
      <span className="text-[var(--text)] font-semibold tabular-nums">{value}</span>
    </div>
  );
}
