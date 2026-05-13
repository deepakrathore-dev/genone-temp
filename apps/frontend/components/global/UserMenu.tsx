"use client";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Wallet, Shield, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@genone/ui";
import { useMe } from "@/lib/queries";

export function UserMenu() {
  const { data: me } = useMe();
  const router = useRouter();
  const initials = me?.initials ?? "•";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-xs font-semibold hover:opacity-90"
          aria-label="Open user menu"
        >
          {initials.replace(/\s/g, "").slice(0, 2)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm text-[var(--text)] font-medium">{me?.fullName ?? "Trader"}</span>
          <span className="text-xs text-[var(--text-muted)] font-normal">{me?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/profile")}>
          <UserCircle className="h-4 w-4" /> My profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/profile/accounts")}>
          <UserIcon className="h-4 w-4" /> Accounts
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/profile/wallet")}>
          <Wallet className="h-4 w-4" /> Wallet & loyalty
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/profile")}>
          <Shield className="h-4 w-4" /> KYC status: {me?.kycStatus ?? "-"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/login")}>
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
