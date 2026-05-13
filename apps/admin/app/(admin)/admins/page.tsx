"use client";
import * as React from "react";
import { useAdmins, useAudit } from "@/lib/queries";
import { useCreateAdmin, useUpdateAdminRole, useSetAdminStatus } from "@/lib/mutations";
import { RoleGate } from "@/components/global/RoleGate";
import { ROLE_LABEL, ROLE_DESCRIPTION } from "@/lib/rbac";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Input, Label, Skeleton, formatDate,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@genone/ui";
import { Plus, ShieldCheck, UserCog } from "lucide-react";
import type { AdminUser, UserRole } from "@genone/types";

const ROLES: Array<Exclude<UserRole, "TRADER">> = ["SUPER_ADMIN", "OPS", "AFFILIATE_MANAGER", "READ_ONLY"];

export default function AdminsPage() {
  return (
    <RoleGate permission="admins.view" fallback="deny">
      <AdminsInner />
    </RoleGate>
  );
}

function AdminsInner() {
  const { data: admins, isLoading } = useAdmins();
  const { data: audit } = useAudit();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [editingAdmin, setEditingAdmin] = React.useState<AdminUser | null>(null);

  const adminAudit = (audit ?? [])
    .filter((a) => a.action.startsWith("ADMIN_") || a.entity?.startsWith?.("adm_"))
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin users</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Super Admin only. Manage who can access this console and what they can do.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4" /> Invite admin
        </Button>
      </div>

      {/* Permission summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {ROLES.map((r) => {
          const count = (admins ?? []).filter((a) => a.role === r).length;
          return (
            <Card key={r}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Badge variant={r === "SUPER_ADMIN" ? "accent" : r === "READ_ONLY" ? "neutral" : "primary"}>
                    <ShieldCheck className="h-3 w-3" />
                    <span className="ml-1">{ROLE_LABEL[r]}</span>
                  </Badge>
                  <span className="font-mono text-2xl font-bold">{count}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-snug">{ROLE_DESCRIPTION[r]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All admins</CardTitle>
              <CardDescription>Every account that can sign into this console.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? <Skeleton className="h-64 m-4" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead>Last login</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(admins ?? []).map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white text-xs font-semibold">
                              {a.initials}
                            </span>
                            <div>
                              <div className="text-sm font-medium">{a.name}</div>
                              <div className="text-xs text-[var(--text-muted)] font-mono">{a.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={a.role === "SUPER_ADMIN" ? "accent" : a.role === "READ_ONLY" ? "neutral" : "primary"}>
                            {ROLE_LABEL[a.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={a.status === "ACTIVE" ? "success" : a.status === "INVITED" ? "warning" : "danger"}>
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {a.totpEnabled
                            ? <Badge variant="success">Enabled</Badge>
                            : <Badge variant="warning">Pending</Badge>}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {a.lastLoginAt ? formatDate(a.lastLoginAt, "datetime") : "-"}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => setEditingAdmin(a)}>
                            <UserCog className="h-3.5 w-3.5" /> Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Recent admin activity</CardTitle>
            <CardDescription>Last 10 admin-management actions from the audit log.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {adminAudit.length === 0 ? (
              <div className="p-4 text-xs text-[var(--text-muted)]">No admin-management actions yet.</div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {adminAudit.map((a) => (
                  <li key={a.id} className="p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{a.action}</Badge>
                      <span className="text-[var(--text-faint)] font-mono">{formatDate(a.ts, "datetime")}</span>
                    </div>
                    <div className="mt-1 text-[var(--text-muted)]">
                      {a.adminUserName} · {a.entity}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <InviteAdminDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <ManageAdminDialog admin={editingAdmin} onClose={() => setEditingAdmin(null)} />
    </div>
  );
}

function InviteAdminDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("OPS");
  const [totp, setTotp] = React.useState("");
  const m = useCreateAdmin();
  React.useEffect(() => { if (!open) { setName(""); setEmail(""); setRole("OPS"); setTotp(""); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite new admin</DialogTitle>
          <DialogDescription>
            They&apos;ll receive an email with a one-time enrolment link and TOTP setup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Marsh" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@genone.example" />
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-[var(--text-faint)]">{ROLE_DESCRIPTION[role]}</p>
          </div>
          <div className="space-y-1">
            <Label>Your TOTP code</Label>
            <Input value={totp} onChange={(e) => setTotp(e.target.value)} maxLength={6} className="font-mono tracking-[0.5em]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name || !email || totp.length < 6}
            onClick={async () => {
              await m.mutateAsync({ name, email, role, totp });
              onClose();
            }}
          >
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManageAdminDialog({ admin, onClose }: { admin: AdminUser | null; onClose: () => void }) {
  const [role, setRole] = React.useState<UserRole>(admin?.role ?? "OPS");
  const [totp, setTotp] = React.useState("");
  const updateRole = useUpdateAdminRole();
  const setStatus = useSetAdminStatus();

  React.useEffect(() => {
    if (admin) {
      setRole(admin.role);
      setTotp("");
    }
  }, [admin]);

  if (!admin) return null;
  const suspended = admin.status === "SUSPENDED";

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {admin.name}</DialogTitle>
          <DialogDescription className="font-mono text-xs">{admin.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-[var(--text-faint)]">{ROLE_DESCRIPTION[role]}</p>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <div className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm flex items-center justify-between">
              <span>Currently <Badge variant={admin.status === "ACTIVE" ? "success" : admin.status === "INVITED" ? "warning" : "danger"}>{admin.status}</Badge></span>
              <Button
                size="sm"
                variant={suspended ? "outline" : "danger"}
                disabled={totp.length < 6}
                onClick={async () => {
                  await setStatus.mutateAsync({ id: admin.id, status: suspended ? "ACTIVE" : "SUSPENDED", totp });
                  onClose();
                }}
              >
                {suspended ? "Reinstate" : "Suspend"}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Your TOTP code</Label>
            <Input value={totp} onChange={(e) => setTotp(e.target.value)} maxLength={6} className="font-mono tracking-[0.5em]" />
            <p className="text-[10px] text-[var(--text-faint)]">Required to change role or status. Audit-logged.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={role === admin.role || totp.length < 6}
            onClick={async () => {
              await updateRole.mutateAsync({ id: admin.id, role, totp });
              onClose();
            }}
          >
            Save role change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
