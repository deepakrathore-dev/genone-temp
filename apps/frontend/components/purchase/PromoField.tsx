"use client";
import * as React from "react";
import { Input, Button, Badge } from "@genone/ui";
import { useValidatePromo } from "@/lib/mutations";
import { Check, X } from "lucide-react";
import type { PromoResult } from "@/lib/api/api-client";

export function PromoField({
  tier,
  applied,
  onApply,
  onClear,
}: {
  tier: string;
  applied: Extract<PromoResult, { ok: true }> | null;
  onApply: (p: Extract<PromoResult, { ok: true }>) => void;
  onClear: () => void;
}) {
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const validate = useValidatePromo();

  const tryApply = async () => {
    setError(null);
    const res = await validate.mutateAsync({ code, tier });
    if (res.ok) {
      onApply(res);
      setCode("");
    } else {
      setError(res.reason);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--success)]/30 bg-[var(--success-soft)] px-3 py-2 text-sm">
        <Check className="h-4 w-4 text-[var(--success)]" />
        <span className="flex-1">
          <span className="font-semibold text-[var(--success)]">{applied.code}</span>
          <span className="text-[var(--text-muted)] ml-2">{applied.label}</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-label="Remove promo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Promo code (e.g. WELCOME10)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); tryApply(); } }}
          className="font-mono uppercase"
        />
        <Button
          type="button"
          variant="outline"
          disabled={!code || validate.isPending}
          onClick={tryApply}
        >
          {validate.isPending ? "Checking…" : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-[var(--text-faint)]">
        Try <Badge variant="outline" className="cursor-pointer" onClick={() => setCode("WELCOME10")}>WELCOME10</Badge>
        or <Badge variant="outline" className="cursor-pointer" onClick={() => setCode("PRO20")}>PRO20</Badge>
        or <Badge variant="outline" className="cursor-pointer" onClick={() => setCode("SAVE25")}>SAVE25</Badge>
      </div>
    </div>
  );
}
