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
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-surface)] text-[var(--chrome-muted)] hover:bg-[var(--chrome-surface)]/80 hover:text-[var(--chrome-text)]"
      aria-label={`Notifications ${unread > 0 ? `(${unread} unread)` : ""}`}
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold text-white border border-[var(--chrome-bg)]">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
