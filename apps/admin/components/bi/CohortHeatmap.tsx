"use client";
import { cn } from "@genone/ui";
import type { CohortRow } from "@genone/types";

export function CohortHeatmap({ rows, label }: { rows: CohortRow[]; label: string }) {
  const buckets = rows[0]?.buckets.map((b) => b.bucket) ?? [];
  const max = Math.max(1, ...rows.flatMap((r) => r.buckets.map((b) => b.valuePct)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr>
            <th className="text-left px-2 py-1 text-[var(--text-muted)]">{label}</th>
            {buckets.map((b) => (
              <th key={b} className="px-2 py-1 text-[var(--text-muted)] font-medium">{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.signupMonth}>
              <td className="px-2 py-1 font-medium">{r.signupMonth}</td>
              {r.buckets.map((b) => {
                const intensity = b.valuePct / max;
                return (
                  <td key={b.bucket} className="p-1">
                    <div
                      className={cn(
                        "h-9 rounded flex flex-col items-center justify-center text-[10px] font-medium",
                      )}
                      style={{
                        backgroundColor: `color-mix(in srgb, var(--primary) ${intensity * 60}%, var(--surface-2))`,
                        color: intensity > 0.4 ? "white" : "var(--text)",
                      }}
                      title={`${b.valuePct}% (n=${b.count})`}
                    >
                      <span>{b.valuePct}%</span>
                      <span className="opacity-70">n={b.count}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
