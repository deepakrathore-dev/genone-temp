export function formatCurrency(cents: number, opts: { compact?: boolean; sign?: boolean } = {}) {
  const value = cents / 100;
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.compact ? 0 : 2,
    maximumFractionDigits: opts.compact ? 0 : 2,
    notation: opts.compact ? "compact" : "standard",
  });
  const out = fmt.format(value);
  if (opts.sign && value > 0) return `+${out}`;
  return out;
}

export function formatNumber(value: number, opts: { compact?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    notation: opts.compact ? "compact" : "standard",
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value.toFixed(fractionDigits)}%`;
}

export function pnlColor(cents: number): string {
  if (cents > 0) return "text-success";
  if (cents < 0) return "text-danger";
  return "text-muted";
}

export function formatDate(iso: string, style: "short" | "long" | "datetime" = "short") {
  const d = new Date(iso);
  if (style === "datetime") {
    return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }
  if (style === "long") {
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function relativeTime(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86_400 * 30) return rtf.format(Math.round(diff / 86_400), "day");
  return rtf.format(Math.round(diff / (86_400 * 30)), "month");
}
