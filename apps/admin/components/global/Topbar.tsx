"use client";
import { useRouter } from "next/navigation";
import { LogOut, Search, ShieldCheck, User as UserIcon } from "lucide-react";
import {
  Input, Badge,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@genone/ui";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/stores/auth.store";
import { ROLE_LABEL } from "@/lib/rbac";

export function Topbar() {
  const session = useAuth((s) => s.session);
  const signOut = useAuth((s) => s.signOut);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur lg:pl-6">
      <div className="lg:hidden w-10 shrink-0" />
      <div className="relative max-w-md w-full">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <Input className="pl-8" placeholder="Search users, accounts, payouts… (⌘K)" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {session?.role && (
          <Badge variant={session.role === "SUPER_ADMIN" ? "accent" : session.role === "READ_ONLY" ? "neutral" : "primary"}>
            <ShieldCheck className="h-3 w-3" />
            <span className="ml-1 hidden sm:inline">{ROLE_LABEL[session.role]}</span>
          </Badge>
        )}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white text-xs font-semibold hover:opacity-90"
              aria-label="Open user menu"
            >
              {session?.initials ?? "-"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm text-[var(--text)] font-medium">{session?.name ?? "Not signed in"}</span>
              <span className="text-xs text-[var(--text-muted)] font-normal">{session?.email ?? "-"}</span>
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
