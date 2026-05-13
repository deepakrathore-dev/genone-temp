"use client";
import Link from "next/link";
import { useFlaggedUsers } from "@/lib/queries";
import {
  Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Skeleton,
} from "@genone/ui";
import { toast } from "sonner";

const REASONS = [
  "Copy account coordinated trading",
  "Rapid-fire payout requests",
  "IP cluster overlap (3 accounts)",
  "Device fingerprint match",
  "Payment source overlap",
  "Order timing correlation > 0.85",
];

export default function RiskPage() {
  const { data, isLoading } = useFlaggedUsers();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Risk & suspicious activity</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Auto-flagged for review by the platform's risk engine. Investigate, clear, or suspend.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead><TableHead>Reason</TableHead><TableHead>Accounts</TableHead><TableHead>Flagged at</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((u, i) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/users/${u.id}`} className="hover:underline">
                        <div className="text-sm font-medium">{u.fullName}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">{u.email}</div>
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="danger">{REASONS[i % REASONS.length]}</Badge></TableCell>
                    <TableCell className="font-mono">{u.accountsCount}</TableCell>
                    <TableCell className="font-mono text-xs">2 hours ago</TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      <Button size="sm" variant="outline" onClick={() => toast.success("Marked for investigation")}>Investigate</Button>
                      <Button size="sm" variant="ghost" onClick={() => toast.success("Flag cleared")}>Clear</Button>
                      <Button size="sm" variant="danger" onClick={() => toast.success("User suspended")}>Suspend</Button>
                    </TableCell>
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
