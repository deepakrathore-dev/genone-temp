"use client";
import * as React from "react";
import { useChallengeTypes, useChallenges } from "@/lib/queries";
import { useCreateChallengeType, useUpdateChallengeType, useDeleteChallengeType } from "@/lib/mutations";
import { RoleGate, useCan } from "@/components/global/RoleGate";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Input, Label, Textarea, Skeleton, Switch, formatDate,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@genone/ui";
import { Plus, Pencil, Trash2, Boxes } from "lucide-react";
import type { ChallengeType } from "@genone/types";
import { ConfirmActionDialog } from "@/components/global/ConfirmActionDialog";

export default function ChallengeTypesPage() {
  return (
    <RoleGate permission="proptech.view" fallback="deny">
      <Inner />
    </RoleGate>
  );
}

function Inner() {
  const { data, isLoading } = useChallengeTypes();
  const { data: challenges } = useChallenges();
  const canWrite = useCan("proptech.write");
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<ChallengeType | null>(null);
  const [removingType, setRemovingType] = React.useState<ChallengeType | null>(null);
  const del = useDeleteChallengeType();

  // Live count of challenges per type (preferred over the static field)
  const counts: Record<string, number> = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of challenges ?? []) {
      if (c.archivedAt) continue;
      out[c.typeId] = (out[c.typeId] ?? 0) + 1;
    }
    return out;
  }, [challenges]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Challenge types</h1>
          <p className="text-sm text-[var(--text-muted)]">
            High-level categories you offer traders. Each type can contain one or more challenges of different account sizes.
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New type
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (data ?? []).length === 0 ? (
            <div className="p-8 text-center">
              <Boxes className="h-8 w-8 text-[var(--text-faint)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-muted)]">No types yet. Create your first one to start offering challenges.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Challenges</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium whitespace-nowrap">{t.name}</TableCell>
                    <TableCell className="text-sm text-[var(--text-muted)] whitespace-normal max-w-[420px] leading-relaxed">
                      {t.description}
                    </TableCell>
                    <TableCell><Badge variant="primary">{counts[t.id] ?? 0}</Badge></TableCell>
                    <TableCell>{t.active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}</TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(t.createdAt)}</TableCell>
                    <TableCell>
                      {canWrite && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRemovingType(t)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
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

      <ConfirmActionDialog
        open={!!removingType}
        onOpenChange={(o) => !o && setRemovingType(null)}
        title="Remove challenge type"
        description={
          removingType
            ? (counts[removingType.id] ?? 0) > 0
              ? `${removingType.name} still has ${counts[removingType.id]} active challenge${counts[removingType.id] === 1 ? "" : "s"}. Removing this type hides it from purchase flows; the underlying challenges stay available until you archive them individually.`
              : `Remove ${removingType.name}. It's not attached to any active challenges.`
            : ""
        }
        confirmLabel="Remove type"
        tone="danger"
        onConfirm={() => {
          if (removingType) del.mutate(removingType.id);
          setRemovingType(null);
        }}
      />

      <TypeDialog
        open={creating}
        type={null}
        onClose={() => setCreating(false)}
      />
      <TypeDialog
        open={!!editing}
        type={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function TypeDialog({ open, type, onClose }: { open: boolean; type: ChallengeType | null; onClose: () => void }) {
  const create = useCreateChallengeType();
  const update = useUpdateChallengeType();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (type) {
      setName(type.name);
      setDescription(type.description);
      setActive(type.active);
    } else {
      setName("");
      setDescription("");
      setActive(true);
    }
  }, [type, open]);

  const isEdit = !!type;

  const submit = async () => {
    if (isEdit && type) {
      await update.mutateAsync({ id: type.id, payload: { name, description, active } });
    } else {
      await create.mutateAsync({ name, description });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit challenge type" : "New challenge type"}</DialogTitle>
          <DialogDescription>
            Types let you group challenges by product line. For example a Standard line and an Express line can have different rule profiles.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary shown to traders during purchase."
              rows={3}
            />
          </div>
          {isEdit && (
            <label className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2">
              <div>
                <div className="text-sm font-medium">Active</div>
                <div className="text-xs text-[var(--text-muted)]">Inactive types are hidden from purchase flows.</div>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!name || !description} onClick={submit}>
            {isEdit ? "Save changes" : "Create type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
