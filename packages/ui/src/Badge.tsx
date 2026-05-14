import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-white/[0.06] text-white/75 border border-white/[0.10]",
        success: "bg-[var(--success-soft)] text-[var(--success)]",
        danger:  "bg-[var(--danger-soft)]  text-[var(--danger)]",
        warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
        info:    "bg-[var(--info-soft)]    text-[var(--info)]",
        primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
        accent:  "bg-[var(--accent-soft)]  text-white",
        outline: "bg-transparent text-white/85 border border-white/[0.20]",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
