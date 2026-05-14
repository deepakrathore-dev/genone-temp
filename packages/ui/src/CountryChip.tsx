import * as React from "react";
import { cn } from "./cn";

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  IN: "India",
  CA: "Canada",
  DE: "Germany",
  AU: "Australia",
  BR: "Brazil",
  FR: "France",
  MX: "Mexico",
  NG: "Nigeria",
  PH: "Philippines",
  SG: "Singapore",
  ZA: "South Africa",
  AE: "United Arab Emirates",
  TR: "Türkiye",
};

/**
 * Stylised ISO-2 country code chip. Used in place of emoji flags so the
 * presentation looks consistent across platforms and avoids the cheap
 * emoji look on dashboards.
 */
export function CountryChip({
  code,
  showName = false,
  size = "sm",
  className,
}: {
  code: string;
  showName?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  if (!code) return null;
  const dim = size === "xs" ? "h-4 text-[9px] px-1" : size === "md" ? "h-6 text-xs px-2" : "h-5 text-[10px] px-1.5";
  return (
    <span className={cn("inline-flex items-center gap-1.5 align-middle", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded font-mono font-semibold uppercase tracking-wider",
          "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]",
          dim
        )}
        aria-label={COUNTRY_NAMES[code] ?? code}
        title={COUNTRY_NAMES[code] ?? code}
      >
        {code}
      </span>
      {showName && (
        <span className="text-xs text-[var(--text)]">{COUNTRY_NAMES[code] ?? code}</span>
      )}
    </span>
  );
}
