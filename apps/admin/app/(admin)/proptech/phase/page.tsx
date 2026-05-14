"use client";
import { useChallenges } from "@/lib/queries";
import { RoleGate } from "@/components/global/RoleGate";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Skeleton, StatTile, formatCurrency, formatNumber,
} from "@genone/ui";
import { Compass, Target, ShieldCheck } from "lucide-react";

export default function PhaseConfigPage() {
  return (
    <RoleGate permission="proptech.view" fallback="deny">
      <Inner />
    </RoleGate>
  );
}

function Inner() {
  const { data: challenges, isLoading } = useChallenges();
  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const phase1 = (challenges ?? []).filter((c) => c.phase === "EVALUATION" && !c.archivedAt);
  const phase2 = (challenges ?? []).filter((c) => c.phase === "FUNDED" && !c.archivedAt);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Phases</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Every challenge belongs to one of two phases. Phase 1 is the evaluation a trader buys; Phase 2 is the funded account they unlock by passing it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PhasePanel
          tone="info"
          icon={Target}
          label="Phase 1"
          name="Evaluation"
          intro="Paid evaluation a trader buys. They prove they can hit the profit target without breaching the EOD drawdown or daily loss limit."
          count={phase1.length}
          rules={[
            { label: "Rule", value: "Hit profit target without breaching drawdown or daily loss." },
            { label: "Breach handling", value: "EOD drawdown breach closes the account. Daily loss breach locks trading for the rest of the day." },
            { label: "Pass outcome", value: "A funded Phase 2 account is provisioned automatically and credentials emailed." },
            { label: "Inactivity", value: "Account auto-closes after 30 days of no trades. Re-engagement email is sent." },
            { label: "Liquidation", value: "All open positions are force-closed at 4:00 PM ET every trading day." },
          ]}
          challenges={phase1}
        />
        <PhasePanel
          tone="accent"
          icon={ShieldCheck}
          label="Phase 2"
          name="Funded"
          intro="The funded account a trader unlocks by passing Phase 1. Same risk rules apply, plus payout gating to ensure consistency before money goes out."
          count={phase2.length}
          rules={[
            { label: "Profit split", value: "Default 80% to the trader, 20% to the firm. Configurable." },
            { label: "Buffer", value: "Drawdown amount plus $100. Required before the first payout." },
            { label: "Green days", value: "5 days with at least $200 profit, accumulated since the last payout." },
            { label: "Consistency", value: "No single day may exceed 50% of cumulative profit since the last payout." },
            { label: "Scale rule", value: "Cumulative withdrawals of $10,000 auto-upgrade the trader to the next tier at no cost." },
          ]}
          challenges={phase2}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Compass className="h-4 w-4 text-[var(--primary)]" />
            How traders move between phases
          </CardTitle>
          <CardDescription>The standard flow from purchase to payout.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <Step n={1} title="Purchase a Phase 1 challenge" body="The trader picks a challenge from your catalogue and pays the evaluation fee through the hosted payment page." />
            <Step n={2} title="Trade the evaluation" body="They trade on Rithmic infrastructure. The platform enforces drawdown, daily loss, and contract-limit rules in real time." />
            <Step n={3} title="Hit the profit target" body="Reaching the target without a breach automatically triggers provisioning of a Phase 2 funded account on the same challenge type." />
            <Step n={4} title="Build buffer and green days" body="The trader operates the funded account under the same risk rules, plus the consistency rule and payout gating." />
            <Step n={5} title="Request a payout" body="Once the gates are satisfied, the trader requests a payout. Bank transfer arrives 2 to 3 business days after approval." />
          </ol>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatTile label="Phase 1 challenges available" value={String(phase1.length)} />
        <StatTile label="Phase 2 challenges available" value={String(phase2.length)} />
        <StatTile label="Combined account sizes" value={formatNumber(new Set([...phase1, ...phase2].map((c) => c.startingBalanceCents)).size)} hint="Distinct starting balances offered" />
      </div>
    </div>
  );
}

function PhasePanel({
  tone, icon: Icon, label, name, intro, count, rules, challenges,
}: {
  tone: "info" | "accent";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  name: string;
  intro: string;
  count: number;
  rules: Array<{ label: string; value: string }>;
  challenges: import("@genone/types").Challenge[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex items-start gap-3">
          <div className={tone === "info" ? "h-10 w-10 rounded-lg bg-[var(--info-soft)] text-[var(--info)] flex items-center justify-center" : "h-10 w-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center"}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{label}: {name}</CardTitle>
            <CardDescription className="mt-1">{intro}</CardDescription>
          </div>
        </div>
        <Badge variant={tone === "info" ? "info" : "accent"}>{count} challenge{count === 1 ? "" : "s"}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
          {rules.map((r) => (
            <div key={r.label} className="grid grid-cols-3 gap-2 px-3 py-2 text-sm">
              <div className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-medium">{r.label}</div>
              <div className="col-span-2 text-[var(--text)]">{r.value}</div>
            </div>
          ))}
        </div>
        {challenges.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Available challenges</div>
            <div className="flex flex-wrap gap-1.5">
              {challenges.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs">
                  <span className="font-medium">{c.name}</span>
                  <span className="font-mono text-[var(--text-muted)]">{formatCurrency(c.evaluationFeeCents)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold">{n}</span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-[var(--text-muted)] leading-relaxed">{body}</div>
      </div>
    </li>
  );
}
