"use client";
import * as React from "react";
import { useAudit } from "@/lib/queries";
import {
  Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Input, Skeleton, formatDate,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@genone/ui";
import { Download } from "lucide-react";
import { toast } from "sonner";

const ACTIONS = ["ALL", "RULE_CHANGE", "PAYOUT_APPROVE", "PAYOUT_REJECT", "USER_SUSPEND", "USER_REINSTATE", "CREDIT_ISSUE", "AFFILIATE_APPROVE", "TIER_CONFIG_UPDATE", "ALERT_THRESHOLD_UPDATE", "CREDENTIAL_VIEW"];

export default function AuditPage() {
  const { data, isLoading } = useAudit();
  const [q, setQ] = React.useState("");
  const [action, setAction] = React.useState("ALL");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const rows = (data ?? []).filter((a) => {
    if (action !== "ALL" && a.action !== action) return false;
    if (q && !`${a.adminUserName} ${a.entity}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (from && a.ts < from) return false;
    if (to && a.ts > to + "T23:59:59Z") return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="text-sm text-[var(--text-muted)]">Insert-only. Every admin action recorded - {rows.length} entries.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input className="w-[260px]" placeholder="Search admin or entity" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Before</TableHead>
                  <TableHead>After</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{formatDate(a.ts, "datetime")}</TableCell>
                    <TableCell className="text-sm">{a.adminUserName}</TableCell>
                    <TableCell><Badge variant="outline">{a.action}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{a.entity}</TableCell>
                    <TableCell className="font-mono text-[10px] text-[var(--text-muted)]">{JSON.stringify(a.before)}</TableCell>
                    <TableCell className="font-mono text-[10px] text-[var(--text-muted)]">{JSON.stringify(a.after)}</TableCell>
                    <TableCell className="font-mono text-xs">{a.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
