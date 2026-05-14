"use client";
import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/queries";

export function NotificationBell() {
  const { data } = useNotifications();
  const unread = data?.filter((n) => !n.readAt).length ?? 0;
  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:text-white"
      aria-label={`Notifications ${unread > 0 ? `(${unread} unread)` : ""}`}
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold text-white border border-[#0C0B10]">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
