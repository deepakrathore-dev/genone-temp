"use client";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  cn,
  formatCurrency,
} from "@genone/ui";
import { useAccounts } from "@/lib/queries";
import { useSelectedAccount } from "@/lib/stores/selected-account.store";
import type { Account, AccountStatus } from "@genone/types";

const STATUS_VARIANT: Record<AccountStatus, "success" | "warning" | "danger" | "info" | "neutral"> = {
  ACTIVE: "success",
  DAILY_LOSS_LOCKED: "warning",
  PASSED: "info",
  FAILED: "danger",
  INACTIVE: "neutral",
  PAUSED: "neutral",
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: "Active",
  DAILY_LOSS_LOCKED: "Locked",
  PASSED: "Passed",
  FAILED: "Failed",
  INACTIVE: "Inactive",
  PAUSED: "Paused",
};

export function AccountSwitcher() {
  const { data: accounts } = useAccounts();
  const { accountId, setAccountId } = useSelectedAccount();

  // auto-select first account on mount
  React.useEffect(() => {
    if (!accountId && accounts && accounts.length > 0) {
      setAccountId(accounts[0]!.id);
    }
  }, [accountId, accounts, setAccountId]);

  const current = accounts?.find((a) => a.id === accountId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-surface)] px-3 text-sm font-medium text-[var(--chrome-text)] hover:bg-[var(--chrome-surface)]/80 transition-colors min-w-[180px] max-w-[280px]"
          )}
        >
          {current ? (
            <>
              <Badge variant={STATUS_VARIANT[current.status]} className="shrink-0">{STATUS_LABEL[current.status]}</Badge>
              <span className="truncate">{accountLabel(current)}</span>
            </>
          ) : (
            <span className="text-[var(--chrome-muted)]">Select account</span>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 text-[var(--chrome-muted)] shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[320px] max-h-[60vh] overflow-y-auto">
        <DropdownMenuLabel>My accounts ({accounts?.length ?? 0}/10)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts?.map((acc) => (
          <DropdownMenuItem key={acc.id} onSelect={() => setAccountId(acc.id)}>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[acc.status]} className="shrink-0">{STATUS_LABEL[acc.status]}</Badge>
                <span className="truncate text-sm">{accountLabel(acc)}</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {acc.type} · {acc.tier} · {formatCurrency(acc.currentEquityCents)}
              </span>
            </div>
            {acc.id === accountId && <Check className="h-4 w-4 text-[var(--primary)]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function accountLabel(acc: Account) {
  return acc.nickname || `${acc.tier} · ${acc.id.slice(-5).toUpperCase()}`;
}
