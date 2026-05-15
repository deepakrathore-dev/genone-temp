import * as React from "react";
import { cn } from "./cn";

// NOTE: We intentionally do NOT apply backdrop-blur on Card. Backdrop filters
// trigger an offscreen pass on every paint, and with ~10 cards on the page
// (e.g. /purchase) scrolling drops to single-digit FPS on mid-tier hardware.
// If you need a blurred surface, opt-in via className per-card. Popovers and
// dialogs keep backdrop-blur because there's only ever one open at a time.
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 p-5 border-b border-[var(--border)]", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-base font-semibold text-[var(--text)] tracking-tight", className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-[var(--text-muted)] leading-snug", className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 border-t border-[var(--border)] flex items-center gap-2", className)} {...props} />
);
