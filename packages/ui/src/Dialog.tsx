"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * DialogContent.
 *
 * Structure:
 *   <Content>                       fixed inset-0, flex-centered, pointer-events-none
 *     <panel>                       relative; the actual visible dialog box
 *       <close button>              absolute top-right; sibling of body
 *       <body>                      padded inner; renders children
 *
 * Why this shape:
 *  - flex centering avoids transform conflicts (Tailwind's animation utilities
 *    require tailwindcss-animate plugin we don't ship, so transform-based
 *    centering can get stripped)
 *  - inner body div has its own padding so the close button sits in the
 *    corner of the *panel* (not pushed in by the body padding)
 *  - pointer-events-none on outer + pointer-events-auto on panel keeps
 *    outside-click-to-close working via the overlay
 */
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    panelClassName?: string;
    bodyClassName?: string;
  }
>(({ className, panelClassName, bodyClassName, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "overflow-y-auto",
        "p-4 sm:p-6",
        "pointer-events-none",
        "focus-visible:outline-none",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-auto relative my-auto",
          "w-full max-w-[28rem] sm:max-w-[32rem]",
          "rounded-3xl border border-white/[0.12] bg-[#13121a]/95 backdrop-blur-xl shadow-[var(--shadow-pop)]",
          panelClassName
        )}
      >
        <DialogPrimitive.Close
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:text-white hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </DialogPrimitive.Close>

        <div className={cn("p-6 sm:p-7 flex flex-col gap-5", bodyClassName)}>
          {children}
        </div>
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:items-center",
      "mt-1",
      className
    )}
    {...props}
  />
);

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight text-white", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-white/65 leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
