"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--chrome-muted)] hover:text-[var(--chrome-text)] hover:bg-[var(--chrome-surface)] transition-colors";

  if (!mounted) {
    return (
      <button className={base} aria-label="Toggle theme">
        <Sun className="h-4 w-4" />
      </button>
    );
  }
  const isDark = resolvedTheme === "dark";
  return (
    <button
      className={base}
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
