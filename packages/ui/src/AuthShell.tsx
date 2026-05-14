"use client";
import * as React from "react";
import { cn } from "./cn";

/**
 * Auth-page shell with the Gen One brand:
 *  - Deep ink #0C0B10 base with #1D4153 corner washes
 *  - Bull and bear wireframe overlay (bull.png)
 *  - Faint stock-ticker numbers behind (back.png)
 *  - White logo top-left, vertical layout (G glyph + "GEN ONE FUTURES")
 *  - Centred content slot
 *
 * Both apps drop the same image assets in their /public so this component works
 * unchanged in either.
 */
export function AuthShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        "font-[family-name:var(--font-dm-sans)] text-white",
        className
      )}
      style={{
        background:
          "radial-gradient(60% 50% at 0% 0%, rgba(29, 65, 83, 0.55), transparent 70%), " +
          "radial-gradient(50% 45% at 100% 100%, rgba(29, 65, 83, 0.45), transparent 70%), " +
          "#0C0B10",
      }}
    >
      {/* Stock-ticker numbers backplate */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/back.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      />

      {/* Bull + bear wireframe overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/bull.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          mixBlendMode: "screen",
        }}
      />

      {/* Subtle vignette to deepen the centre/bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(100% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Logo top-left — image already contains the G glyph + "GEN ONE FUTURES" text */}
      <div className="absolute top-8 left-10 z-10 hidden sm:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/genone-logo-white.png"
          alt="Gen One Futures"
          width={110}
          height={173}
          style={{ width: 110, height: 173 }}
        />
      </div>

      {/* Mobile logo (smaller, centred above content) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 sm:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/genone-logo-white.png"
          alt="Gen One Futures"
          width={70}
          height={110}
          style={{ width: 70, height: 110 }}
        />
      </div>

      {/* Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

/**
 * The dark, semi-transparent card that holds the form on auth pages.
 * Matches the screenshot: rounded-3xl, faint white border, dark backdrop, "Login"
 * style header with a divider, generous padding.
 */
export function AuthCard({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/12 bg-black/35 backdrop-blur-md",
        "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)]",
        "overflow-hidden"
      )}
    >
      <div className="px-8 pt-6 pb-5 text-center">
        <div className="text-lg font-medium text-white">{heading}</div>
      </div>
      <div className="border-t border-white/10" />
      <div className="px-8 pt-6 pb-8">{children}</div>
    </div>
  );
}

/**
 * Pill-shaped input matching the screenshot.
 */
export const AuthInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function AuthInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-12 rounded-full px-5",
          "bg-white/[0.04] text-white placeholder:text-white/35",
          "border border-white/20 hover:border-white/30 focus:border-white/50",
          "focus:outline-none focus:ring-2 focus:ring-white/15",
          "transition-colors",
          "text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

export function AuthLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block text-sm text-white/85 mb-2 font-medium", className)}>{children}</label>
  );
}

/**
 * Big pill-shaped Sign In button with the blue brand gradient.
 */
export function AuthButton({
  children,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "w-full h-12 rounded-full text-white text-sm font-semibold",
        "bg-gradient-to-r from-[#5BA8E5] via-[#4F92D6] to-[#3B7BAA]",
        "shadow-[0_8px_24px_-8px_rgba(75,130,200,0.55)]",
        "hover:opacity-95 active:opacity-90 transition-opacity",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#0C0B10]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Custom checkbox matching the screenshot — small rounded square outline.
 */
export const AuthCheckbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode }
>(function AuthCheckbox({ label, className, id, ...props }, ref) {
  const inputId = id ?? React.useId();
  return (
    <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-white/85">
      <span className="relative flex h-[18px] w-[18px] items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn("peer absolute inset-0 opacity-0 cursor-pointer", className)}
          {...props}
        />
        <span
          aria-hidden="true"
          className="block h-[18px] w-[18px] rounded-md border border-white/35 bg-transparent peer-checked:bg-[#5BA8E5] peer-checked:border-[#5BA8E5] transition-colors"
        />
        <svg
          viewBox="0 0 16 16"
          className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8.5 6.5 12 13 5" />
        </svg>
      </span>
      {label}
    </label>
  );
});
