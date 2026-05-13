"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Banknote, ShieldAlert, IdCard, Megaphone,
  LineChart, GitMerge, Activity, Settings, ScrollText, ChevronLeft, Menu,
  Sigma, Coins, Bell, AlertOctagon, Network, UserCog, Repeat,
} from "lucide-react";
import { cn } from "@genone/ui";
import { useUi } from "@/lib/stores/ui.store";
import { useAuth } from "@/lib/stores/auth.store";
import { can, type Permission } from "@/lib/rbac";

interface NavItem { label: string; href: string; icon: React.ComponentType<{ className?: string }>; permission: Permission; }
interface NavGroup { label?: string; items: NavItem[]; }

const GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard.view" },
      { label: "Users", href: "/users", icon: Users, permission: "users.view" },
      { label: "Payouts", href: "/payouts", icon: Banknote, permission: "payouts.view" },
      { label: "Subscriptions", href: "/subscriptions", icon: Repeat, permission: "subscriptions.view" },
      { label: "Risk", href: "/risk", icon: ShieldAlert, permission: "risk.view" },
      { label: "KYC", href: "/kyc", icon: IdCard, permission: "kyc.view" },
      { label: "Affiliates", href: "/affiliates", icon: Megaphone, permission: "affiliates.view" },
    ],
  },
  {
    label: "Business Intelligence",
    items: [
      { label: "Symbols", href: "/bi/symbols", icon: Sigma, permission: "bi.view" },
      { label: "Cohorts", href: "/bi/cohorts", icon: Network, permission: "bi.view" },
      { label: "Forecast", href: "/bi/forecast", icon: LineChart, permission: "bi.view" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Tiers", href: "/config/tiers", icon: Coins, permission: "config.view" },
      { label: "Universal rules", href: "/config/rules", icon: GitMerge, permission: "config.view" },
      { label: "Loyalty", href: "/config/loyalty", icon: Activity, permission: "config.view" },
      { label: "Affiliates", href: "/config/affiliates", icon: Megaphone, permission: "config.view" },
      { label: "Risk rules", href: "/config/risk", icon: ShieldAlert, permission: "config.view" },
      { label: "KPI alerts", href: "/config/alerts", icon: Bell, permission: "config.view" },
      { label: "Payout cap", href: "/config/payout-cap", icon: AlertOctagon, permission: "config.view" },
      { label: "Intercom", href: "/config/intercom", icon: Settings, permission: "config.view" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Admin users", href: "/admins", icon: UserCog, permission: "admins.view" },
      { label: "Audit log", href: "/audit", icon: ScrollText, permission: "audit.view" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUi();
  const role = useAuth((s) => s.session?.role);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Filter nav items by current role; drop groups that end up empty.
  const visibleGroups = React.useMemo(() => {
    return GROUPS
      .map((g) => ({ ...g, items: g.items.filter((it) => can(role, it.permission)) }))
      .filter((g) => g.items.length > 0);
  }, [role]);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 h-screen flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200 left-0",
          sidebarCollapsed ? "w-16" : "w-60",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-[var(--border)] px-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 overflow-hidden" onClick={() => setMobileOpen(false)}>
            <Image src="/logo.png" alt="Gen One" width={32} height={32} priority className="h-8 w-8 shrink-0 rounded-lg" />
            {!sidebarCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-semibold tracking-tight">Gen One</span>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Admin</span>
              </div>
            )}
          </Link>
          <button onClick={toggleSidebar} className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--surface-2)]" aria-label="Toggle sidebar">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-3">
          {visibleGroups.map((g, gi) => (
            <div key={gi} className="space-y-0.5">
              {g.label && !sidebarCollapsed && (
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)] font-semibold px-3 pt-2">
                  {g.label}
                </div>
              )}
              {g.items.map((it) => {
                const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
                const Icon = it.icon;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                      active
                        ? "bg-[var(--primary-soft)] text-[var(--primary)] font-medium"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{it.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
