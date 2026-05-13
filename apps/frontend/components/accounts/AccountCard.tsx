"use client";
import * as React from "react";
import {
  Card, CardContent, Badge, Button, Input, cn, formatCurrency, formatDate,
} from "@genone/ui";
import { Archive, Edit2, Check, X, KeyRound, ArchiveRestore } from "lucide-react";
import type { Account } from "@genone/types";
import { useUpdateNickname, useArchiveAccount, useUnarchiveAccount } from "@/lib/mutations";
import { useUi } from "@/lib/stores/ui.store";
import { CredentialModal } from "./CredentialModal";

const STATUS_BADGE: Record<Account["status"], "success" | "warning" | "danger" | "info" | "neutral"> = {
  ACTIVE: "success",
  DAILY_LOSS_LOCKED: "warning",
  PASSED: "info",
  FAILED: "danger",
  INACTIVE: "neutral",
  PAUSED: "neutral",
};

export function AccountCard({ account, archived = false, selected = false, onToggleSelect }: {
  account: Account;
  archived?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [nickDraft, setNickDraft] = React.useState(account.nickname ?? "");
  const [credentialOpen, setCredentialOpen] = React.useState(false);
  const update = useUpdateNickname();
  const archive = useArchiveAccount();
  const unarchive = useUnarchiveAccount();
  const { removalMode } = useUi();

  const onSave = () => {
    update.mutate({ accountId: account.id, nickname: nickDraft.slice(0, 32) });
    setEditing(false);
  };

  return (
    <Card className={cn("card-hover", selected && removalMode && "ring-2 ring-[var(--primary)]")}>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          {removalMode && !archived && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect?.(account.id)}
              className="mt-1.5 h-4 w-4 rounded border-[var(--border-strong)]"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{account.tier}</Badge>
              <Badge variant={account.type === "FUNDED" ? "accent" : "outline"}>{account.type}</Badge>
              <Badge variant={STATUS_BADGE[account.status]}>{account.status.replace("_", " ")}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {editing ? (
                <>
                  <Input
                    value={nickDraft}
                    autoFocus
                    onChange={(e) => setNickDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSave();
                      if (e.key === "Escape") setEditing(false);
                    }}
                    maxLength={32}
                    placeholder="Account nickname"
                  />
                  <Button size="icon" variant="success" onClick={onSave}><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <span className="text-base font-semibold truncate">
                    {account.nickname || `${account.tier} · ${account.id.slice(-5).toUpperCase()}`}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-[var(--text-muted)] hover:text-[var(--text)]"
                    aria-label="Edit nickname"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
            <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              {account.rithmicAccountId} · created {formatDate(account.createdAt)}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="space-y-0.5">
            <dt className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Equity</dt>
            <dd className="font-semibold">{formatCurrency(account.currentEquityCents)}</dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Cumulative P&L</dt>
            <dd className={cn(
              "font-semibold",
              account.cumulativePnlCents > 0 ? "text-success" : account.cumulativePnlCents < 0 ? "text-danger" : ""
            )}>
              {formatCurrency(account.cumulativePnlCents, { sign: true })}
            </dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Today</dt>
            <dd className={cn(
              "font-semibold",
              account.todayPnlCents > 0 ? "text-success" : account.todayPnlCents < 0 ? "text-danger" : ""
            )}>
              {formatCurrency(account.todayPnlCents, { sign: true })}
            </dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Drawdown floor</dt>
            <dd>{formatCurrency(account.drawdownFloorCents)}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={() => setCredentialOpen(true)}>
            <KeyRound className="h-3.5 w-3.5" /> Show credentials
          </Button>
          {!archived && (account.status === "FAILED" || account.status === "PASSED" || account.status === "INACTIVE") && (
            <Button size="sm" variant="ghost" onClick={() => archive.mutate(account.id)}>
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
          )}
          {archived && (
            <Button size="sm" variant="ghost" onClick={() => unarchive.mutate(account.id)}>
              <ArchiveRestore className="h-3.5 w-3.5" /> Restore
            </Button>
          )}
        </div>
        <CredentialModal open={credentialOpen} onOpenChange={setCredentialOpen} account={account} />
      </CardContent>
    </Card>
  );
}
