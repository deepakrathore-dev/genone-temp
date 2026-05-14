"use client";
import * as React from "react";
import { useChallengeTypes, useChallenges } from "@/lib/queries";
import { useCreateChallenge, useUpdateChallenge, useArchiveChallenge } from "@/lib/mutations";
import { RoleGate, useCan } from "@/components/global/RoleGate";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Input, Label, Skeleton, Switch, formatCurrency,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  InfoTip, RULE_HELP, type RuleHelpKey,
} from "@genone/ui";
import { Plus, Pencil, Archive } from "lucide-react";
import type { Challenge, ChallengeType, Phase } from "@genone/types";

const FIELDS: Array<{
  key: keyof Challenge;
  label: string;
  isCurrency?: boolean;
  help: RuleHelpKey;
}> = [
  { key: "startingBalanceCents",  label: "Starting balance",  isCurrency: true, help: "evaluationFee" },
  { key: "evaluationFeeCents",    label: "Evaluation fee",    isCurrency: true, help: "evaluationFee" },
  { key: "profitTargetCents",     label: "Profit target",     isCurrency: true, help: "profitTarget" },
  { key: "drawdownCents",         label: "EOD drawdown",      isCurrency: true, help: "drawdown" },
  { key: "dailyLossCents",        label: "Daily loss",        isCurrency: true, help: "dailyLoss" },
  { key: "bufferCents",           label: "Buffer",            isCurrency: true, help: "buffer" },
  { key: "firstPayoutCapCents",   label: "First payout cap",  isCurrency: true, help: "firstPayoutCap" },
  { key: "maxContracts",          label: "Max contracts",     help: "maxContracts" },
  { key: "inactivityDays",        label: "Inactivity (days)", help: "inactivity" },
];

export default function ChallengesPage() {
  return (
    <RoleGate permission="proptech.view" fallback="deny">
      <Inner />
    </RoleGate>
  );
}

function Inner() {
  const { data: challenges, isLoading } = useChallenges();
  const { data: types } = useChallengeTypes();
  const canWrite = useCan("proptech.write");
  const archive = useArchiveChallenge();
  const [filterType, setFilterType] = React.useState<string>("ALL");
  const [filterPhase, setFilterPhase] = React.useState<string>("ALL");
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<Challenge | null>(null);

  const filtered = (challenges ?? []).filter((c) => {
    if (c.archivedAt) return false;
    if (filterType !== "ALL" && c.typeId !== filterType) return false;
    if (filterPhase !== "ALL" && c.phase !== filterPhase) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Challenges</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Individual challenge configurations that traders can purchase. Each one belongs to a challenge type and carries its own rules.
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New challenge
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {(types ?? []).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPhase} onValueChange={setFilterPhase}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All phases</SelectItem>
            <SelectItem value="EVALUATION">Phase 1 (Evaluation)</SelectItem>
            <SelectItem value="FUNDED">Phase 2 (Funded)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Account size</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Drawdown</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant="primary">{c.typeName}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={c.phase === "EVALUATION" ? "info" : "accent"}>
                        {c.phase === "EVALUATION" ? "Phase 1" : "Phase 2"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{formatCurrency(c.startingBalanceCents)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(c.evaluationFeeCents)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(c.profitTargetCents)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(c.drawdownCents)}</TableCell>
                    <TableCell>{c.active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Hidden</Badge>}</TableCell>
                    <TableCell>
                      {canWrite && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => archive.mutate(c.id)}>
                            <Archive className="h-3.5 w-3.5" /> Archive
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ChallengeDialog
        open={creating}
        challenge={null}
        types={types ?? []}
        onClose={() => setCreating(false)}
      />
      <ChallengeDialog
        open={!!editing}
        challenge={editing}
        types={types ?? []}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

interface DialogProps {
  open: boolean;
  challenge: Challenge | null;
  types: ChallengeType[];
  onClose: () => void;
}

function ChallengeDialog({ open, challenge, types, onClose }: DialogProps) {
  const create = useCreateChallenge();
  const update = useUpdateChallenge();
  const isEdit = !!challenge;

  const [name, setName] = React.useState("");
  const [typeId, setTypeId] = React.useState<string>("");
  const [phase, setPhase] = React.useState<Phase>("EVALUATION");
  const [values, setValues] = React.useState<Record<string, number>>({});
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (challenge) {
      setName(challenge.name);
      setTypeId(challenge.typeId);
      setPhase(challenge.phase);
      setActive(challenge.active);
      setValues(Object.fromEntries(FIELDS.map((f) => [f.key, challenge[f.key] as number])));
    } else {
      setName("");
      setTypeId(types[0]?.id ?? "");
      setPhase("EVALUATION");
      setActive(true);
      setValues({
        startingBalanceCents: 5_000_000,
        evaluationFeeCents: 12_900,
        profitTargetCents: 300_000,
        drawdownCents: 200_000,
        dailyLossCents: 137_500,
        bufferCents: 210_000,
        firstPayoutCapCents: 200_000,
        maxContracts: 3,
        inactivityDays: 30,
      });
    }
  }, [challenge, types, open]);

  const submit = async () => {
    const typeName = types.find((t) => t.id === typeId)?.name ?? "";
    const payload = {
      typeId,
      typeName,
      name,
      phase,
      active,
      startingBalanceCents: values.startingBalanceCents,
      evaluationFeeCents: values.evaluationFeeCents,
      profitTargetCents: values.profitTargetCents,
      drawdownCents: values.drawdownCents,
      dailyLossCents: values.dailyLossCents,
      maxContracts: values.maxContracts,
      bufferCents: values.bufferCents,
      firstPayoutCapCents: values.firstPayoutCapCents,
      inactivityDays: values.inactivityDays,
    };
    if (isEdit && challenge) {
      await update.mutateAsync({ id: challenge.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent panelClassName="max-w-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit challenge" : "New challenge"}</DialogTitle>
          <DialogDescription>
            Changes apply only to new accounts. Existing accounts keep the rules they were created with.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard 50K" />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.filter((t) => t.active).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Phase</Label>
              <Select value={phase} onValueChange={(v) => setPhase(v as Phase)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVALUATION">Phase 1 (Evaluation)</SelectItem>
                  <SelectItem value="FUNDED">Phase 2 (Funded)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FIELDS.map((f) => {
              const help = RULE_HELP[f.help];
              return (
                <div key={String(f.key)} className="space-y-1">
                  <Label className="flex items-center gap-1.5">
                    {f.label}{f.isCurrency && <span className="text-[10px] text-[var(--text-faint)]">(USD)</span>}
                    <InfoTip title={help.title}>{help.body}</InfoTip>
                  </Label>
                  <Input
                    type="number"
                    value={f.isCurrency ? (values[f.key] ?? 0) / 100 : values[f.key]}
                    onChange={(e) => setValues((v) => ({
                      ...v,
                      [f.key]: f.isCurrency ? Math.round(Number(e.target.value) * 100) : Number(e.target.value),
                    }))}
                    className="font-mono"
                  />
                </div>
              );
            })}
          </div>

          <label className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2">
            <div>
              <div className="text-sm font-medium">Visible in purchase flow</div>
              <div className="text-xs text-[var(--text-muted)]">Hide to take a challenge off-sale without archiving its data.</div>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!name || !typeId} onClick={submit}>
            {isEdit ? "Save changes" : "Create challenge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
