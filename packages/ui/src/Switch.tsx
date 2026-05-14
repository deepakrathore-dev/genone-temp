"use client";
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "./cn";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-white/[0.10] transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-transparent",
      "data-[state=unchecked]:bg-white/[0.06]",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-4.5 w-4.5 h-[18px] w-[18px] rounded-full bg-white shadow-md ring-0 transition-transform translate-x-0.5 data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]" />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
