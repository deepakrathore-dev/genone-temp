"use client";
import { AccountSwitcher } from "./AccountSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { Button, cn } from "@genone/ui";
import { useUi } from "@/lib/stores/ui.store";
import { PanelRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function Topbar() {
  const { rulesPanelOpen, toggleRulesPanel } = useUi();
  const pathname = usePathname();
  const showRulesToggle = pathname?.startsWith("/dashboard");
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur lg:pl-6">
      <div className="lg:hidden w-10 shrink-0" />
      <AccountSwitcher />
      <div className="ml-auto flex items-center gap-1">
        {showRulesToggle && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle rules panel"
            onClick={toggleRulesPanel}
            className={cn(rulesPanelOpen && "text-[var(--primary)]")}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
