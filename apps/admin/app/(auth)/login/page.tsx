"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import {
  AuthShell, AuthCard, AuthInput, AuthLabel, AuthButton, AuthCheckbox,
} from "@genone/ui";
import type { UserRole } from "@genone/types";
import { useAuth } from "@/lib/stores/auth.store";

const ROLE_OPTIONS: Array<{ value: Exclude<UserRole, "TRADER">; label: string; hint: string }> = [
  { value: "SUPER_ADMIN",       label: "Super Admin",       hint: "Full access including configuration and admin management." },
  { value: "OPS",               label: "Ops",               hint: "User and payout operations, KYC and risk review." },
  { value: "AFFILIATE_MANAGER", label: "Affiliate Manager", hint: "Affiliate programme operations only." },
  { value: "READ_ONLY",         label: "Read-only",         hint: "View-only access to all dashboards and reports." },
];

const ROLE_NAME: Record<Exclude<UserRole, "TRADER">, { id: string; name: string; initials: string }> = {
  SUPER_ADMIN:       { id: "adm_super",     name: "Avery Stone",  initials: "AS" },
  OPS:               { id: "adm_ops",       name: "Jordan Marsh", initials: "JM" },
  AFFILIATE_MANAGER: { id: "adm_affiliate", name: "Priya Kapoor", initials: "PK" },
  READ_ONLY:         { id: "adm_readonly",  name: "Sam Ortega",   initials: "SO" },
};

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Enter your password"),
  role: z.enum(["SUPER_ADMIN", "OPS", "AFFILIATE_MANAGER", "READ_ONLY"]),
  remember: z.boolean().optional(),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [showPassword, setShowPassword] = React.useState(false);
  const [roleOpen, setRoleOpen] = React.useState(false);
  const {
    register, handleSubmit, watch, control, formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", role: "SUPER_ADMIN" as const, remember: true },
  });

  const selectedRole = watch("role");
  const hint = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.hint ?? "";

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          Admin Portal
        </h1>
      </div>

      <AuthCard heading="Login">
        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) => {
            const ident = ROLE_NAME[values.role];
            signIn({
              id: ident.id,
              email: values.email,
              name: ident.name,
              initials: ident.initials,
              role: values.role,
            });
            router.push("/");
          })}
        >
          <div>
            <AuthLabel>Email Address</AuthLabel>
            <AuthInput
              type="email"
              autoComplete="email"
              placeholder="name@domain.com"
              {...register("email")}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p>}
          </div>

          <div>
            <AuthLabel>Password</AuthLabel>
            <div className="relative">
              <AuthInput
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                className="pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55 hover:text-white/90 focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-300">{errors.password.message}</p>}
          </div>

          <div>
            <AuthLabel>Role</AuthLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <RoleSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={ROLE_OPTIONS}
                  open={roleOpen}
                  onOpenChange={setRoleOpen}
                  placeholder="Select a role"
                />
              )}
            />
            <p className="mt-1.5 text-xs text-white/55 leading-snug">{hint}</p>
          </div>

          <div>
            <AuthCheckbox label="Keep me signed in" defaultChecked {...register("remember")} />
          </div>

          <AuthButton type="submit" disabled={isSubmitting} className="cursor-pointer">
            Sign In
          </AuthButton>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/* RoleSelect                                                          */
/*                                                                     */
/* AuthCard has `overflow-hidden` (for its rounded corners), which     */
/* clips any popover rendered inside it. We render the menu through a  */
/* portal so it escapes the card, and position it from the trigger's   */
/* bounding rect. We also flip upward if there isn't enough room       */
/* below the trigger.                                                  */
/* ------------------------------------------------------------------ */

interface RoleOption {
  value: Exclude<UserRole, "TRADER">;
  label: string;
  hint: string;
}

function RoleSelect({
  value, onChange, options, open, onOpenChange, placeholder,
}: {
  value: Exclude<UserRole, "TRADER">;
  onChange: (v: Exclude<UserRole, "TRADER">) => void;
  options: RoleOption[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  placeholder: string;
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number; width: number; flip: boolean } | null>(null);
  // `useSyncExternalStore` is the React 19 way to read a client-only value
  // (document availability) without a setState-in-effect hop.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const selected = options.find((o) => o.value === value);

  // Compute position whenever the menu opens.
  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuMaxHeight = Math.min(window.innerHeight * 0.6, 320);
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;
    const flip = spaceBelow < menuMaxHeight && spaceAbove > spaceBelow;
    setCoords({
      top: flip ? rect.top - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      flip,
    });
  }, [open]);

  // Re-position on scroll / resize while open.
  React.useEffect(() => {
    if (!open) return;
    const onReflow = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const menuMaxHeight = Math.min(window.innerHeight * 0.6, 320);
      const spaceBelow = window.innerHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const flip = spaceBelow < menuMaxHeight && spaceAbove > spaceBelow;
      setCoords({
        top: flip ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        flip,
      });
    };
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [open]);

  // Close on outside click / Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) return;
      onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        className="relative w-full h-12 rounded-full pl-5 pr-12 flex items-center justify-between bg-white/[0.04] text-white border border-white/20 hover:border-white/30 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/15 transition-colors text-sm cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selected?.label ?? placeholder}</span>
        <svg
          viewBox="0 0 20 20"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55 transition-transform"
          style={{ transform: open ? "translateY(-50%) rotate(180deg)" : undefined }}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {mounted && open && coords && createPortal(
        <ul
          ref={menuRef}
          role="listbox"
          className="fixed z-[100] max-h-[min(60vh,20rem)] overflow-y-auto rounded-2xl border border-white/15 bg-[#13121a]/95 backdrop-blur-xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)] p-1.5 space-y-0.5"
          style={{
            top: coords.flip ? undefined : coords.top,
            bottom: coords.flip ? window.innerHeight - coords.top : undefined,
            left: coords.left,
            width: coords.width,
          }}
        >
          {options.map((r) => {
            const active = value === r.value;
            return (
              <li key={r.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(r.value);
                    onOpenChange(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    active
                      ? "bg-white/[0.10] text-white"
                      : "text-white/85 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-[11px] text-white/55 leading-relaxed mt-0.5">{r.hint}</div>
                </button>
              </li>
            );
          })}
        </ul>,
        document.body
      )}
    </>
  );
}
