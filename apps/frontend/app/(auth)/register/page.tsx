"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import {
  AuthShell, AuthCard, AuthInput, AuthLabel, AuthButton, AuthCheckbox,
} from "@genone/ui";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full legal name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(12, "Use at least 12 characters"),
  accept: z.boolean().refine((v) => v, "Accept the risk disclosure to continue"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", accept: false },
  });

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          Get started
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Create your Gen One Futures account in under a minute.
        </p>
      </div>

      <AuthCard heading="Create account">
        <form
          className="space-y-5"
          onSubmit={handleSubmit(() => router.push("/onboarding"))}
        >
          <div>
            <AuthLabel>Full legal name</AuthLabel>
            <AuthInput
              autoComplete="name"
              placeholder="Jane Doe"
              {...register("fullName")}
            />
            {errors.fullName && <p className="mt-1.5 text-xs text-red-300">{errors.fullName.message}</p>}
          </div>

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
                autoComplete="new-password"
                placeholder="At least 12 characters"
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

          <AuthCheckbox
            label={
              <span className="leading-snug">
                I have read and accept the{" "}
                <Link href="#" className="text-white underline-offset-4 hover:underline font-medium">
                  risk disclosure
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-white underline-offset-4 hover:underline font-medium">
                  terms of use
                </Link>
                .
              </span>
            }
            {...register("accept")}
          />
          {errors.accept && <p className="text-xs text-red-300">{errors.accept.message}</p>}

          <AuthButton type="submit" disabled={isSubmitting}>
            Create account
          </AuthButton>

          <p className="text-center text-sm text-white/65 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-medium underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
