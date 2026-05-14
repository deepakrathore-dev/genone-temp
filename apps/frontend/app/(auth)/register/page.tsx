"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Input, Label, Checkbox,
} from "@genone/ui";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full legal name"),
  email: z.string().email(),
  password: z.string().min(12, "12 character minimum"),
  accept: z.boolean().refine((v) => v, "Accept the risk disclosure"),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", accept: false },
  });
  const accept = watch("accept");

  return (
    <div className="min-h-screen flex items-center justify-center bg-aurora p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center items-center">
          <div className="flex items-center justify-center mb-2">
            <Image src="/logo.png" alt="Gen One" width={56} height={56} priority className="h-14 w-14 rounded-xl" />
          </div>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>It takes about 60 seconds. KYC can be completed later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={handleSubmit(() => router.push("/onboarding"))}
          >
            <div className="space-y-1">
              <Label>Full legal name</Label>
              <Input {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
              <p className="text-[10px] text-[var(--text-faint)]">
                12+ chars. Hashed with Argon2id and checked against HaveIBeenPwned.
              </p>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>
            <label className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
              <Checkbox checked={accept} onCheckedChange={(v) => setValue("accept", !!v, { shouldValidate: true })} />
              <span>
                I have read and accept the risk disclosure and terms of use. I understand that futures trading carries substantial risk.
              </span>
            </label>
            {errors.accept && <p className="text-xs text-danger">{errors.accept.message}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>Continue</Button>
            <p className="text-xs text-center text-[var(--text-muted)]">
              Already have an account? <Link href="/login" className="text-[var(--primary)] hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
