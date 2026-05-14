"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
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
  totp: z.string().length(6, "6-digit code"),
  role: z.enum(["SUPER_ADMIN", "OPS", "AFFILIATE_MANAGER", "READ_ONLY"]),
  remember: z.boolean().optional(),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register, handleSubmit, watch, formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", totp: "", role: "SUPER_ADMIN" as const, remember: true },
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55 hover:text-white/90 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-300">{errors.password.message}</p>}
          </div>

          <div>
            <AuthLabel>Authentication code</AuthLabel>
            <AuthInput
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="tracking-[0.5em] text-center font-[family-name:var(--font-jetbrains-mono)]"
              {...register("totp")}
            />
            {errors.totp && <p className="mt-1.5 text-xs text-red-300">{errors.totp.message}</p>}
          </div>

          <div>
            <AuthLabel>Role</AuthLabel>
            <div className="relative">
              <select
                {...register("role")}
                className="w-full h-12 rounded-full pl-5 pr-10 appearance-none bg-white/[0.04] text-white border border-white/20 hover:border-white/30 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/15 transition-colors text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#0C0B10] text-white">
                    {r.label}
                  </option>
                ))}
              </select>
              <svg
                viewBox="0 0 20 20"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 8l5 5 5-5" />
              </svg>
            </div>
            <p className="mt-1.5 text-xs text-white/55 leading-snug">{hint}</p>
          </div>

          <div>
            <AuthCheckbox label="Keep me signed in" defaultChecked {...register("remember")} />
          </div>

          <AuthButton type="submit" disabled={isSubmitting}>
            Sign In
          </AuthButton>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
