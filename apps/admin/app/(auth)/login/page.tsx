"use client";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Input, Label, Badge,
} from "@genone/ui";
import { ShieldCheck } from "lucide-react";
import type { UserRole } from "@genone/types";
import { useAuth } from "@/lib/stores/auth.store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  totp: z.string().length(6, "6-digit code"),
});

interface DemoIdentity {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: UserRole;
  blurb: string;
}

const DEMO_IDENTITIES: DemoIdentity[] = [
  { id: "adm_0001", email: "avery@genone.example", name: "Avery Stone", initials: "AS", role: "SUPER_ADMIN", blurb: "Full access - config, audit, admin management" },
  { id: "adm_0002", email: "jordan@genone.example", name: "Jordan Marsh", initials: "JM", role: "OPS", blurb: "Users, payouts, KYC, risk" },
  { id: "adm_0003", email: "priya@genone.example", name: "Priya Kapoor", initials: "PK", role: "AFFILIATE_MANAGER", blurb: "Affiliate management only" },
  { id: "adm_0004", email: "sam@genone.example", name: "Sam Ortega", initials: "SO", role: "READ_ONLY", blurb: "View only - no actions" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [identity, setIdentity] = React.useState<DemoIdentity>(DEMO_IDENTITIES[0]!);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: identity.email, password: "demopassword!!", totp: "123456" },
  });

  React.useEffect(() => {
    setValue("email", identity.email);
  }, [identity, setValue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Sign-in card */}
        <Card className="lg:col-span-3">
          <CardHeader className="text-center items-center">
            <div className="flex items-center justify-center mb-2">
              <Image src="/logo.png" alt="Gen One" width={56} height={56} priority className="h-14 w-14 rounded-xl" />
            </div>
            <CardTitle className="text-xl">Admin console</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" /> TOTP required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={handleSubmit(() => {
                signIn({
                  id: identity.id,
                  email: identity.email,
                  name: identity.name,
                  role: identity.role,
                  initials: identity.initials,
                });
                router.push("/");
              })}
            >
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Input type="password" {...register("password")} />
                {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>TOTP code</Label>
                <Input inputMode="numeric" maxLength={6} {...register("totp")} className="font-mono tracking-[0.5em]" />
                {errors.totp && <p className="text-xs text-danger">{errors.totp.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Sign in as {identity.name}
              </Button>
              <p className="text-[10px] text-center text-[var(--text-faint)]">
                {/* TODO(genone): replace with real OIDC + TOTP backend verification */}
                Demo mode - any 6-digit code works.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Role picker */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Demo identities</CardTitle>
            <CardDescription>Pick a role to preview the console as that admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_IDENTITIES.map((d) => {
              const active = d.id === identity.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setIdentity(d)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{d.name}</span>
                    <Badge variant={d.role === "SUPER_ADMIN" ? "accent" : d.role === "READ_ONLY" ? "neutral" : "primary"}>
                      {d.role.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{d.blurb}</div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
