"use client";
import { useTrades } from "@/lib/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  formatCurrency,
  pnlColor,
  cn,
  Badge,
} from "@genone/ui";
import { ArrowDown, ArrowUp, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function RecentTradesList({ accountId }: { accountId: string }) {
  const { data: trades, isLoading } = useTrades(accountId);
  const top = (trades ?? []).slice(0, 10);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Recent Trades</CardTitle>
        <Link
          href={`/dashboard/${accountId}/trades`}
          className="text-xs text-[var(--primary)] hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && <div className="p-4 text-xs text-[var(--text-muted)]">Loading…</div>}
        {!isLoading && top.length === 0 && (
          <div className="p-6 text-center text-xs text-[var(--text-muted)]">No trades yet on this account.</div>
        )}
        <ul className="divide-y divide-[var(--border)]">
          {top.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  t.side === "BUY" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                )}
              >
                {t.side === "BUY" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="font-mono truncate">{t.instrument}</span>
                  {t.source === "PLATFORM_LIQUIDATION" && (
                    <Badge variant="warning" className="gap-1">
                      <Zap className="h-3 w-3" /> Liquidation
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-mono">
                  {t.size} contract{t.size > 1 ? "s" : ""} · {formatDistanceToNow(new Date(t.ts), { addSuffix: true })}
                </div>
              </div>
              <div className={cn("text-sm font-mono font-semibold tabular-nums", pnlColor(t.pnlCents))}>
                {formatCurrency(t.pnlCents, { sign: true })}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
