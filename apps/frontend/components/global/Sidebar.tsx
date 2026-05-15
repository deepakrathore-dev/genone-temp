"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CandlestickChart, Calendar, Banknote, Trophy, Wallet,
  Bell, MessageCircle, Boxes, ChevronLeft, Menu, HelpCircle, Plus, Repeat, Globe,
  UserCircle,
} from "lucide-react";
import { cn } from "@genone/ui";
import { useUi } from "@/lib/stores/ui.store";
import { useSelectedAccount } from "@/lib/stores/selected-account.store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface NavGroup {
  label?: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUi();
  const { accountId } = useSelectedAccount();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const groups: NavGroup[] = [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Trades", href: accountId ? `/dashboard/${accountId}/trades` : "/dashboard", icon: CandlestickChart },
        { label: "Calendar", href: accountId ? `/dashboard/${accountId}/calendar` : "/dashboard", icon: Calendar },
        { label: "Payouts", href: "/payouts", icon: Banknote },
      ],
    },
    {
      label: "Explore",
      items: [
        { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { label: "Subscriptions", href: "/subscriptions", icon: Repeat },
        { label: "Community", href: "/community", icon: Globe },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Profile", href: "/profile", icon: UserCircle },
        { label: "Trading accounts", href: "/profile/accounts", icon: Boxes },
        { label: "Wallet & loyalty", href: "/profile/wallet", icon: Wallet },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
  ];

  const EXACT = new Set(["/dashboard", "/profile"]);
  const isActive = (href: string) =>
    pathname === href || (!EXACT.has(href) && pathname.startsWith(`${href}/`));

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-surface)] backdrop-blur text-[var(--chrome-text)]"
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
          "fixed lg:sticky top-0 z-50 h-screen flex flex-col border-r border-[var(--chrome-border)] bg-[var(--chrome-bg)]/95 backdrop-blur-xl transition-all duration-200 left-0",
          // Mobile always uses full width when open; collapsed state is desktop-only.
          "w-64",
          sidebarCollapsed && "lg:w-[72px]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand — height matches the topbar (h-16) so the borders line up. */}
        <div className={cn(
          "flex h-16 items-center border-b border-[var(--chrome-border)] shrink-0 gap-2",
          // Collapsed on desktop centers the logo-toggle; mobile keeps full padding.
          sidebarCollapsed ? "px-4 lg:px-0 lg:justify-center" : "px-4 justify-between"
        )}>
          {/* Desktop collapsed: logo IS the expand toggle (no chevron). */}
          {sidebarCollapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--chrome-surface)] transition-colors"
              aria-label="Expand sidebar"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/genone-logo-white.png" alt="Gen One Futures" className="h-8 w-auto" style={{ height: 32 }} />
            </button>
          ) : (
            <Link href="/dashboard" className="hidden lg:flex items-center overflow-hidden" onClick={() => setMobileOpen(false)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/large-logo.png" alt="Gen One Futures" className="h-9 w-auto" style={{ height: 36 }} />
            </Link>
          )}

          {/* Mobile: always show the full wordmark; tap closes the drawer + navigates. */}
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="lg:hidden flex items-center" aria-label="Gen One Futures dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/large-logo.png" alt="Gen One Futures" className="h-9 w-auto" style={{ height: 36 }} />
          </Link>

          {/* Desktop expanded: chevron collapses the sidebar. */}
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-[var(--chrome-surface)] text-[var(--chrome-muted)] hover:text-[var(--chrome-text)]"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Mobile: close button on the right of the drawer. */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-full text-[var(--chrome-muted)] hover:text-[var(--chrome-text)] hover:bg-[var(--chrome-surface)] ml-auto"
            aria-label="Close menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Buy CTA. Labels always render so mobile keeps the text; on lg+ they */}
        {/* hide when the sidebar is collapsed. */}
        <div className="px-3 pt-4">
          <Link
            href="/purchase"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white overflow-hidden",
              "bg-gradient-to-r from-[#5BA8E5] via-[#4F92D6] to-[#3B7BAA]",
              "shadow-[var(--shadow-cta)] transition-opacity hover:opacity-95",
              sidebarCollapsed && "lg:px-0"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className={cn(sidebarCollapsed && "lg:hidden")}>New challenge</span>
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {groups.map((g, gi) => (
            <div key={gi} className="space-y-1">
              {g.label && (
                <div className={cn(
                  "px-3 pt-1 pb-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--chrome-muted)]/60",
                  sidebarCollapsed && "lg:hidden"
                )}>
                  {g.label}
                </div>
              )}
              {g.items.map((it) => {
                const active = isActive(it.href);
                const Icon = it.icon;
                return (
                  <Link
                    key={it.href + it.label}
                    href={it.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "relative flex h-10 items-center gap-3 rounded-xl pl-3 pr-2 text-sm transition-colors",
                      active
                        ? "bg-[var(--chrome-surface)] text-[var(--chrome-text)] font-semibold"
                        : "text-[var(--chrome-muted)] hover:bg-[var(--chrome-surface)] hover:text-[var(--chrome-text)]"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--primary)]" />
                    )}
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-[var(--primary)]")} />
                    <span className={cn("truncate", sidebarCollapsed && "lg:hidden")}>{it.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--chrome-border)] p-2 flex flex-col gap-1">
          <Link
            href="https://help.genone.example/"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-[var(--chrome-muted)] hover:bg-[var(--chrome-surface)] hover:text-[var(--chrome-text)]"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span className={cn(sidebarCollapsed && "lg:hidden")}>Help center</span>
          </Link>
          <button
            type="button"
            className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-[var(--chrome-muted)] hover:bg-[var(--chrome-surface)] hover:text-[var(--chrome-text)]"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span className={cn(sidebarCollapsed && "lg:hidden")}>Live chat</span>
          </button>
        </div>
      </aside>
    </>
  );
}
