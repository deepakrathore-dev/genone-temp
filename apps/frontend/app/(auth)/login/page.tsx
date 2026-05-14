"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Input, Label,
} from "@genone/ui";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(12, "12 character minimum"),
});

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "dev@ment.tech", password: "demopassword!!" },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-aurora p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center items-center">
          <div className="flex items-center justify-center mb-2">
            <Image src="/logo.png" alt="Gen One" width={56} height={56} priority className="h-14 w-14 rounded-xl" />
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Gen One Futures account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={handleSubmit(() => {
              router.push("/dashboard");
            })}
          >
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <Link href="#" className="text-xs text-[var(--primary)] hover:underline">Forgot?</Link>
              </div>
              <Input type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Sign in
            </Button>
            <p className="text-xs text-center text-[var(--text-muted)]">
              No account? <Link href="/register" className="text-[var(--primary)] hover:underline">Create one</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
