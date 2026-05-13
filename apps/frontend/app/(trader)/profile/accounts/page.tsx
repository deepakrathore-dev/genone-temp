"use client";
import * as React from "react";
import Link from "next/link";
import { useAccounts, useArchivedAccounts } from "@/lib/queries";
import { useArchiveAccount } from "@/lib/mutations";
import { useUi } from "@/lib/stores/ui.store";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Button, Skeleton, EmptyState, Switch,
} from "@genone/ui";
import { AccountCard } from "@/components/accounts/AccountCard";
import { Archive, Plus, Trash2 } from "lucide-react";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const { data: archived } = useArchivedAccounts();
  const [tab, setTab] = React.useState("ALL");
  const [showArchived, setShowArchived] = React.useState(false);
  const { removalMode, setRemovalMode } = useUi();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const archive = useArchiveAccount();

  const filtered = (accounts ?? []).filter((a) => {
    if (tab === "EVAL") return a.type === "EVALUATION";
    if (tab === "FUNDED") return a.type === "FUNDED";
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const archiveSelected = () => {
    selected.forEach((id) => archive.mutate(id));
    setSelected(new Set());
    setRemovalMode(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Up to 10 funded accounts per identity. Archive completed accounts to declutter the active list.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <label className="flex items-center gap-2">
            <Switch checked={showArchived} onCheckedChange={setShowArchived} />
            <span className="text-[var(--text-muted)]">Show archived</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={removalMode} onCheckedChange={setRemovalMode} />
            <span className="text-[var(--text-muted)]">Removal mode</span>
          </label>
          <Button asChild>
            <Link href="/purchase">
              <Plus className="h-4 w-4" /> Buy new challenge
            </Link>
          </Button>
        </div>
      </div>

      {removalMode && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-soft)] px-4 py-2 text-sm">
          <span className="text-[var(--warning)]">
            Removal mode: select accounts then archive them in a batch. Archived accounts remain queryable for audit.
          </span>
          <Button size="sm" disabled={selected.size === 0} onClick={archiveSelected} className="bg-[var(--warning)] text-white hover:opacity-90">
            <Archive className="h-3.5 w-3.5" /> Archive {selected.size}
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="EVAL">Eval</TabsTrigger>
          <TabsTrigger value="FUNDED">Funded</TabsTrigger>
          <TabsTrigger value="ALL">All</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Trash2}
              title="No accounts yet"
              description="Buy your first evaluation to get started."
              action={
                <Button asChild>
                  <Link href="/purchase">
                    <Plus className="h-4 w-4" /> Buy your first challenge
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((a) => (
                <AccountCard
                  key={a.id}
                  account={a}
                  selected={selected.has(a.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showArchived && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Archived</h2>
          {(archived?.length ?? 0) === 0 ? (
            <EmptyState title="No archived accounts" description="Use Removal mode to archive completed accounts." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {archived!.map((a) => <AccountCard key={a.id} account={a} archived />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
