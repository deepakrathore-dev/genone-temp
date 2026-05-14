"use client";
import { AccountSwitcher } from "./AccountSwitcher";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Button, cn } from "@genone/ui";
import { useUi } from "@/lib/stores/ui.store";
import { PanelRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function Topbar() {
  const { rulesPanelOpen, toggleRulesPanel } = useUi();
  const pathname = usePathname();
  const showRulesToggle = pathname?.startsWith("/dashboard");
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--chrome-border)] bg-[var(--chrome-bg)]/85 px-4 backdrop-blur-xl lg:pl-6">
      <div className="lg:hidden w-10 shrink-0" />
      <AccountSwitcher />
      <div className="ml-auto flex items-center gap-1">
        {showRulesToggle && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle rules panel"
            onClick={toggleRulesPanel}
            className={cn(
              "text-[var(--chrome-muted)] hover:text-[var(--chrome-text)] hover:bg-[var(--chrome-surface)]",
              rulesPanelOpen && "text-[var(--primary)] bg-[var(--chrome-surface)]"
            )}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}
        <ThemeToggle />
        <NotificationBell />
        <span className="mx-1 h-6 w-px bg-[var(--chrome-border)]" />
        <UserMenu />
      </div>
    </header>
  );
}
