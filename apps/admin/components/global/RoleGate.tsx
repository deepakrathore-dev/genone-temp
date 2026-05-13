"use client";
import * as React from "react";
import { useAuth } from "@/lib/stores/auth.store";
import { can, type Permission } from "@/lib/rbac";
import { ShieldOff } from "lucide-react";
import { EmptyState } from "@genone/ui";

/**
 * Hides children when the current admin lacks the given permission.
 * For top-level pages, falls back to an "Access denied" empty state.
 */
export function RoleGate({
  permission,
  children,
  fallback = "hide",
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: "hide" | "deny";
}) {
  const session = useAuth((s) => s.session);
  const allowed = can(session?.role, permission);
  if (allowed) return <>{children}</>;
  if (fallback === "hide") return null;
  return (
    <EmptyState
      icon={ShieldOff}
      title="You don't have access"
      description={`This area requires the "${permission}" permission. Switch roles or ask a Super Admin to grant access.`}
    />
  );
}

export function useCan(permission: Permission): boolean {
  const role = useAuth((s) => s.session?.role);
  return can(role, permission);
}
