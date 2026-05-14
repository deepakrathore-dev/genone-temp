"use client";
import * as React from "react";
import Link from "next/link";
import { useUsers } from "@/lib/queries";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Input, Badge, Button, Skeleton, CountryChip, formatCurrency, formatDate,
} from "@genone/ui";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const { data, isLoading } = useUsers();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"ALL" | "SUSPENDED" | "ACTIVE">("ALL");
  const [page, setPage] = React.useState(0);
  const PAGE_SIZE = 20;

  const filtered = (data ?? []).filter((u) => {
    if (q && !`${u.fullName} ${u.email} ${u.id}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (status === "SUSPENDED" && !u.suspended) return false;
    if (status === "ACTIVE" && u.suspended) return false;
    return true;
  });
  const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-[var(--text-muted)]">{filtered.length} of {data?.length ?? 0} users</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[260px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input className="pl-8" placeholder="Search name, email, ID" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(["ALL", "ACTIVE", "SUSPENDED"] as const).map((s) => (
            <Button key={s} variant={status === s ? "primary" : "outline"} size="sm" onClick={() => setStatus(s)}>{s}</Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {isLoading ? <Skeleton className="h-64 m-4" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Accounts</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Paid out</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link href={`/users/${u.id}`} className="hover:underline">
                      <div className="text-sm font-medium">{u.fullName}</div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">{u.email}</div>
                    </Link>
                  </TableCell>
                  <TableCell><CountryChip code={u.country} /></TableCell>
                  <TableCell><Badge variant={u.kycStatus === "VERIFIED" ? "success" : u.kycStatus === "PENDING" ? "warning" : "neutral"}>{u.kycStatus}</Badge></TableCell>
                  <TableCell className="font-mono">{u.accountsCount}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(u.totalSpentCents)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(u.totalPayoutCents)}</TableCell>
                  <TableCell className="font-mono text-xs">{formatDate(u.createdAt)}</TableCell>
                  <TableCell>
                    {u.suspended ? <Badge variant="danger">Suspended</Badge> : <Badge variant="success">Active</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="flex items-center justify-between p-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          <span>Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
