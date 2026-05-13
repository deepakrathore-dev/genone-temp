"use client";
import * as React from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, formatDate,
} from "@genone/ui";
import { useAudit } from "@/lib/queries";

interface ConfigPageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  auditFilter: (action: string) => boolean;
}

export function ConfigPageShell({ title, description, children, auditFilter }: ConfigPageShellProps) {
  const { data: audit } = useAudit();
  const relevant = (audit ?? []).filter((a) => auditFilter(a.action)).slice(0, 10);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">{children}</div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Recent changes</CardTitle>
            <CardDescription>Last 10 audit-log entries for this config area.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {relevant.length === 0 ? (
              <div className="p-4 text-xs text-[var(--text-muted)]">No recent changes.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Time</TableHead><TableHead>Admin</TableHead><TableHead>Action</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {relevant.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{formatDate(a.ts, "datetime")}</TableCell>
                      <TableCell className="text-xs">{a.adminUserName}</TableCell>
                      <TableCell><Badge variant="outline">{a.action}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
