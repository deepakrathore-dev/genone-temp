import type { UserRole } from "@genone/types";

/**
 * Permission matrix. Every route + sensitive action declares which roles can use it.
 * Backend enforces this for real; the UI hides what a user can't do.
 *
 * Spec: Feature Set §11 - "Super Admin (all permissions), Ops (user and payout
 * management), Affiliate Manager (affiliate-only), Read-Only (view only)".
 */
export const PERMISSIONS = {
  // Dashboard / read-only surfaces - everyone with a session
  "dashboard.view": ["SUPER_ADMIN", "OPS", "AFFILIATE_MANAGER", "READ_ONLY"],

  // Users
  "users.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],
  "users.suspend": ["SUPER_ADMIN", "OPS"],
  "users.credit": ["SUPER_ADMIN", "OPS"],
  "users.override": ["SUPER_ADMIN", "OPS"],

  // Payouts
  "payouts.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],
  "payouts.approve": ["SUPER_ADMIN", "OPS"],
  "payouts.reject": ["SUPER_ADMIN", "OPS"],

  // Risk / KYC
  "risk.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],
  "risk.action": ["SUPER_ADMIN", "OPS"],
  "kyc.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],
  "kyc.action": ["SUPER_ADMIN", "OPS"],

  // Affiliates
  "affiliates.view": ["SUPER_ADMIN", "OPS", "AFFILIATE_MANAGER", "READ_ONLY"],
  "affiliates.manage": ["SUPER_ADMIN", "AFFILIATE_MANAGER"],

  // BI
  "bi.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],

  // Configuration
  "config.view": ["SUPER_ADMIN", "READ_ONLY"],
  "config.write": ["SUPER_ADMIN"],

  // Audit log
  "audit.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],

  // Admin user management - SUPER_ADMIN only
  "admins.view": ["SUPER_ADMIN"],
  "admins.write": ["SUPER_ADMIN"],

  // Subscriptions
  "subscriptions.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],
  "subscriptions.write": ["SUPER_ADMIN", "OPS"],

  // Proptech configuration
  "proptech.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],
  "proptech.write": ["SUPER_ADMIN"],

  // Risk reports
  "reports.view": ["SUPER_ADMIN", "OPS", "READ_ONLY"],
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

export const ROLE_LABEL: Record<UserRole, string> = {
  TRADER: "Trader",
  SUPER_ADMIN: "Super Admin",
  OPS: "Ops",
  AFFILIATE_MANAGER: "Affiliate Manager",
  READ_ONLY: "Read-Only",
};

export const ROLE_DESCRIPTION: Record<UserRole, string> = {
  TRADER: "-",
  SUPER_ADMIN: "All permissions including config and admin management.",
  OPS: "User and payout management, KYC, risk.",
  AFFILIATE_MANAGER: "Affiliate programme operations only.",
  READ_ONLY: "View-only access to all dashboards and reports.",
};
