"use client";
import { useKycQueue } from "@/lib/queries";
import Link from "next/link";
import {
  Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Skeleton, CountryChip, formatDate,
} from "@genone/ui";
import { toast } from "sonner";

export default function KycPage() {
  const { data, isLoading } = useKycQueue();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">KYC queue</h1>
        <p className="text-sm text-[var(--text-muted)]">Users pending Veriff verification. Required before first payout.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="h-64 m-4" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead><TableHead>Country</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/users/${u.id}`} className="hover:underline">
                        <div className="text-sm font-medium">{u.fullName}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">{u.email}</div>
                      </Link>
                    </TableCell>
                    <TableCell><CountryChip code={u.country} showName /></TableCell>
                    <TableCell><Badge variant="warning">{u.kycStatus}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      <Button size="sm" variant="success" onClick={() => toast.success("Approved")}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => toast.success("Rejected")}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(data ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-[var(--text-muted)] py-6">No users pending verification.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
