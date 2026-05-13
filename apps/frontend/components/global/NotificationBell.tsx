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
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--text)]"
      aria-label={`Notifications ${unread > 0 ? `(${unread} unread)` : ""}`}
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 inline-flex items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
