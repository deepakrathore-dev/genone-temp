"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CandlestickChart,
  Calendar,
  Banknote,
  Trophy,
  Wallet,
  Bell,
  Settings,
  Boxes,
  ChevronLeft,
  Menu,
  HelpCircle,
  Plus,
  Repeat,
  Globe,
  UserCircle,
} from "lucide-react";
import { cn, Button } from "@genone/ui";
import { useUi } from "@/lib/stores/ui.store";
import { useSelectedAccount } from "@/lib/stores/selected-account.store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUi();
  const { accountId } = useSelectedAccount();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const items: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Trades", href: accountId ? `/dashboard/${accountId}/trades` : "/dashboard", icon: CandlestickChart },
    { label: "Calendar", href: accountId ? `/dashboard/${accountId}/calendar` : "/dashboard", icon: Calendar },
    { label: "Payouts", href: "/payouts", icon: Banknote },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Subscriptions", href: "/subscriptions", icon: Repeat },
    { label: "Community", href: "/community", icon: Globe },
    { label: "Profile", href: "/profile", icon: UserCircle },
    { label: "Accounts", href: "/profile/accounts", icon: Boxes },
    { label: "Wallet", href: "/profile/wallet", icon: Wallet },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 h-screen flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200",
          sidebarCollapsed ? "w-16" : "w-60",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "left-0"
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-[var(--border)] px-3">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden" onClick={() => setMobileOpen(false)}>
            <Image src="/logo.png" alt="Gen One" width={32} height={32} priority className="h-8 w-8 shrink-0 rounded-lg" />
            {!sidebarCollapsed && <span className="font-semibold tracking-tight">Gen One</span>}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--surface-2)]"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </button>
        </div>

        <div className="p-2 border-b border-[var(--border)]">
          <Link
            href="/purchase"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-sm hover:opacity-90 transition-opacity",
              sidebarCollapsed && "justify-center px-0"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Buy challenge</span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {items.map((it) => {
            // Routes that should only highlight on exact match (not for their children)
            const EXACT = new Set(["/dashboard", "/profile"]);
            const active = pathname === it.href || (!EXACT.has(it.href) && pathname.startsWith(it.href));
            const Icon = it.icon;
            return (
              <Link
                key={it.href + it.label}
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
        </nav>

        <div className="border-t border-[var(--border)] p-2 flex flex-col gap-1">
          <Link
            href="https://help.genone.example/"
            target="_blank"
            className={cn(
              "flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            )}
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Help Center</span>}
          </Link>
          <button
            className={cn(
              "flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            )}
            // TODO(genone): wire to Intercom Messenger SDK once App ID and HMAC secret are in env
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Support chat</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
