import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
  {
    variants: {
      variant: {
        neutral: "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]",
        success: "bg-[var(--success-soft)] text-[var(--success)] border-transparent",
        danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-transparent",
        warning: "bg-[var(--warning-soft)] text-[var(--warning)] border-transparent",
        info: "bg-[var(--info-soft)] text-[var(--info)] border-transparent",
        primary: "bg-[var(--primary-soft)] text-[var(--primary)] border-transparent",
        accent: "bg-[var(--accent-soft)] text-[var(--accent)] border-transparent",
        outline: "bg-transparent text-[var(--text)] border-[var(--border-strong)]",
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
