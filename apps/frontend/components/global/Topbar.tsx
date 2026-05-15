"use client";
import * as React from "react";
import { AccountSwitcher } from "./AccountSwitcher";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import {
  Button, cn,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@genone/ui";
import { useUi } from "@/lib/stores/ui.store";
import { useTheme } from "next-themes";
import { PanelRight, MoreHorizontal, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";

export function Topbar() {
  const { rulesPanelOpen, toggleRulesPanel } = useUi();
  const pathname = usePathname();
  const showRulesToggle = pathname?.startsWith("/dashboard");
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-3 border-b border-[var(--chrome-border)] bg-[var(--chrome-bg)]/85 px-3 sm:px-4 backdrop-blur-xl lg:pl-6 overflow-hidden">
      {/* Hamburger placeholder so mobile content doesn't sit under the fixed Menu button. */}
      <div className="lg:hidden w-10 shrink-0" />
      <AccountSwitcher />

      <div className="ml-auto flex items-center gap-1 shrink-0">
        {/* Desktop: rules toggle + theme toggle inline. Hidden on mobile (moved into More). */}
        {showRulesToggle && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle rules panel"
            onClick={toggleRulesPanel}
            className={cn(
              "hidden sm:inline-flex text-[var(--chrome-muted)] hover:text-[var(--chrome-text)] hover:bg-[var(--chrome-surface)]",
              rulesPanelOpen && "text-[var(--primary)] bg-[var(--chrome-surface)]"
            )}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}
        <div className="hidden sm:inline-flex">
          <ThemeToggle />
        </div>

        {/* Mobile-only "More" dropdown for the secondary actions. */}
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
            {showRulesToggle && (
              <DropdownMenuItem onSelect={toggleRulesPanel}>
                <PanelRight className="h-4 w-4" />
                {rulesPanelOpen ? "Hide rules panel" : "Show rules panel"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() => mounted && setTheme(isDark ? "light" : "dark")}
            >
              {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {mounted && isDark ? "Switch to light" : "Switch to dark"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationBell />
        <span className="mx-1 hidden sm:inline-block h-6 w-px bg-[var(--chrome-border)]" />
        <UserMenu />
      </div>
    </header>
  );
}
