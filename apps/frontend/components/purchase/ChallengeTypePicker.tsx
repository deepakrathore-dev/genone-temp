"use client";
import { cn } from "@genone/ui";
import type { ChallengeType } from "@genone/types";

export function ChallengeTypePicker({
  types,
  value,
  onChange,
}: {
  types: ChallengeType[];
  value: string | null;
  onChange: (typeId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {types.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={active}
            className={cn(
              "group relative text-left rounded-2xl border p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              active
                ? "border-[var(--primary)] bg-[var(--primary-soft)]/40 shadow-[0_0_0_1px_var(--primary)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-base font-semibold text-[var(--text)]">{t.name}</span>
              {active ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)]">Selected</span>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">Select</span>
              )}
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
