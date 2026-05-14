"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold",
    "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
    "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "text-white",
          "bg-gradient-to-r from-[#5BA8E5] via-[#4F92D6] to-[#3B7BAA]",
          "shadow-[var(--shadow-cta)]",
          "hover:opacity-95",
        ].join(" "),
        secondary: "bg-white/[0.06] text-white border border-white/[0.12] hover:bg-white/[0.10] hover:border-white/[0.20]",
        outline:   "border border-white/[0.20] text-white bg-transparent hover:bg-white/[0.05] hover:border-white/[0.35]",
        ghost:     "text-white/85 hover:text-white hover:bg-white/[0.06]",
        danger:    "bg-[var(--danger)] text-white hover:opacity-90",
        success:   "bg-[var(--success)] text-[var(--bg)] hover:opacity-90",
        link:      "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        sm:   "h-8 px-3.5 text-xs",
        md:   "h-10 px-5",
        lg:   "h-12 px-7 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
