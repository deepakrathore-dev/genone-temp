"use client";
import { AccountSwitcher } from "./AccountSwitcher";
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.08] bg-[#0C0B10]/75 px-4 backdrop-blur-xl lg:pl-6">
      <div className="lg:hidden w-10 shrink-0" />
      <AccountSwitcher />
      <div className="ml-auto flex items-center gap-1">
        {showRulesToggle && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle rules panel"
            onClick={toggleRulesPanel}
            className={cn(rulesPanelOpen && "text-[var(--primary)] bg-white/[0.06]")}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}
        <NotificationBell />
        <span className="mx-1 h-6 w-px bg-white/[0.10]" />
        <UserMenu />
      </div>
    </header>
  );
}
