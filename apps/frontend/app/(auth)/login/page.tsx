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
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Enter your password"),
  remember: z.boolean().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          Welcome Back!
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Sign in to your Gen One Futures account.
        </p>
      </div>

      <AuthCard heading="Login">
        <form
          className="space-y-5"
          onSubmit={handleSubmit(() => router.push("/dashboard"))}
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

          <div className="flex items-center justify-between">
            <AuthCheckbox label="Keep me logged in" defaultChecked {...register("remember")} />
            <Link href="#" className="text-sm text-white/85 underline-offset-4 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" disabled={isSubmitting}>
            Sign In
          </AuthButton>

          <p className="text-center text-sm text-white/65 pt-2">
            New to Gen One?{" "}
            <Link href="/register" className="text-white font-medium underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-center text-xs text-white/55">
            Creator or content partner?{" "}
            <Link href="/become-an-affiliate" className="text-white/85 hover:text-white underline-offset-4 hover:underline">
              Apply to the partner programme
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
