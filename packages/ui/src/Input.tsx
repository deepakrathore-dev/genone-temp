"use client";
import * as React from "react";
import { cn } from "./cn";

const baseInput =
  "flex w-full text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] " +
  "bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-[var(--primary)] " +
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
      className={cn("text-sm font-medium text-[var(--text)] block mb-2", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
