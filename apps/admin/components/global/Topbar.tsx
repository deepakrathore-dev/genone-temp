"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Search, ShieldCheck, User as UserIcon, Bell, MoreHorizontal, Sun, Moon } from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@genone/ui";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/stores/auth.store";
import { ROLE_LABEL } from "@/lib/rbac";

export function Topbar() {
  const session = useAuth((s) => s.session);
  const signOut = useAuth((s) => s.signOut);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-3 border-b border-[var(--chrome-border)] bg-[var(--chrome-bg)]/85 px-3 sm:px-4 backdrop-blur-xl lg:pl-6 overflow-hidden">
      <div className="lg:hidden w-10 shrink-0" />

      {/* Search — hidden on the smallest screens so the role badge + actions have room. */}
      <div className="relative max-w-md w-full hidden sm:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--chrome-muted)]" />
        <input
          className="h-10 w-full rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-surface)] pl-10 pr-4 text-sm text-[var(--chrome-text)] placeholder:text-[var(--chrome-muted)] outline-none focus:border-white/[0.25] focus:bg-[var(--chrome-surface)]/90"
          placeholder="Search users, accounts, payouts…"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
        {session?.role && (
          <Badge variant={session.role === "SUPER_ADMIN" ? "accent" : session.role === "READ_ONLY" ? "neutral" : "primary"}>
            <ShieldCheck className="h-3 w-3" />
            <span className="ml-1 hidden sm:inline">{ROLE_LABEL[session.role]}</span>
          </Badge>
        )}

        {/* Desktop: theme toggle inline. */}
        <div className="hidden sm:inline-flex">
          <ThemeToggle />
        </div>

        {/* Mobile-only More menu — search + theme inside. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More actions"
              className="sm:hidden text-[var(--chrome-muted)] hover:text-[var(--chrome-text)] hover:bg-[var(--chrome-surface)]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => {
              // Focus the (hidden on mobile) search input by scrolling — kept here as a
              // placeholder for a future mobile search sheet.
            }}>
              <Search className="h-4 w-4" /> Search
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => mounted && setTheme(isDark ? "light" : "dark")}>
              {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {mounted && isDark ? "Switch to light" : "Switch to dark"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          aria-label="Notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-surface)] text-[var(--chrome-muted)] hover:text-[var(--chrome-text)] hover:bg-[var(--chrome-surface)]/80 shrink-0"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--primary)]" />
        </button>
        <div className="hidden sm:block h-8 w-px bg-[var(--chrome-border)]" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-surface)] pl-1 pr-2 sm:pr-3 text-sm text-[var(--chrome-text)] hover:bg-[var(--chrome-surface)]/80 shrink-0"
              aria-label="Open user menu"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5BA8E5] via-[#4F92D6] to-[#3B7BAA] text-[11px] font-semibold text-white">
                {session?.initials ?? "—"}
              </span>
              <span className="hidden md:inline text-sm font-medium">{session?.name?.split(" ")[0] ?? "Admin"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm text-[var(--text)] font-medium">{session?.name ?? "Not signed in"}</span>
              <span className="text-xs text-[var(--text-muted)] font-normal">{session?.email ?? "—"}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/admins")}>
              <UserIcon className="h-4 w-4" /> Admin users
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
