"use client";
import * as React from "react";
import { cn } from "./cn";

const baseInput =
  "flex w-full text-sm text-white placeholder:text-white/30 " +
  "bg-white/[0.04] border border-white/[0.15] hover:border-white/[0.25] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15 focus-visible:border-white/[0.40] " +
  "disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(baseInput, "h-10 rounded-full px-4", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(baseInput, "min-h-[88px] rounded-2xl px-4 py-2.5 leading-relaxed", className)}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-white/85 block mb-2", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
