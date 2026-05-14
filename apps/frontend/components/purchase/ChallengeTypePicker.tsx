"use client";
import { cn } from "@genone/ui";
import { Shield, Activity } from "lucide-react";
import type { ChallengeType } from "@genone/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Standard: Activity,
  Static: Shield,
};

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
        const Icon = ICONS[t.name] ?? Activity;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "group relative text-left rounded-2xl border p-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BA8E5]/40",
              active
                ? "border-[#5BA8E5] bg-[#5BA8E5]/[0.08] shadow-[0_0_0_1px_rgba(91,168,229,0.35)]"
                : "border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.20]"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  active
                    ? "border-[#5BA8E5]/40 bg-[#5BA8E5]/[0.12] text-[#5BA8E5]"
                    : "border-white/[0.10] bg-white/[0.04] text-white/75"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  {active && <span className="text-[10px] uppercase tracking-wider text-[#5BA8E5]">Selected</span>}
                </div>
                <p className="mt-1 text-xs text-white/65 leading-relaxed line-clamp-2">{t.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
