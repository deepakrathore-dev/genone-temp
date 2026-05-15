"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AuthShell, AuthCard, AuthInput, AuthLabel, AuthButton, cn,
} from "@genone/ui";
import { useApplyForAffiliatePublic } from "@/lib/mutations";
import { CheckCircle2 } from "lucide-react";
import type { AffiliateRow } from "@genone/types";

const PLATFORMS: NonNullable<AffiliateRow["primaryPlatform"]>[] = [
  "YouTube", "TikTok", "X", "Instagram", "Discord", "Other",
];

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  primaryPlatform: z.enum(["YouTube", "TikTok", "X", "Instagram", "Discord", "Other"]),
  socialUrl: z.string().url("Enter a valid profile URL"),
  audienceSize: z.coerce.number().int().min(1, "Enter your audience size"),
  notes: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export default function BecomeAnAffiliatePage() {
  const apply = useApplyForAffiliatePublic();
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      primaryPlatform: "YouTube",
      socialUrl: "",
      audienceSize: "",
      notes: "",
    },
  });

  const platform = watch("primaryPlatform");

  const onSubmit = (values: FormOutput) => {
    apply.mutate(values, { onSuccess: () => setSubmitted(true) });
  };

  if (submitted) {
    return (
      <AuthShell contentClassName="max-w-lg">
        <AuthCard heading="Application received">
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <p className="text-sm text-white/85 leading-relaxed">
              Thanks for applying to the Gen One Futures partner programme. Our team reviews
              new applications within 2 business days. We&apos;ll email you with the decision
              and, if you&apos;re approved, a one-click link to finish setting up your account.
            </p>
            <p className="text-xs text-white/55 leading-relaxed">
              You won&apos;t need to do anything else right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2 w-full">
              <Link
                href="/"
                className="flex-1 h-11 inline-flex items-center justify-center rounded-full border border-white/20 hover:border-white/40 text-white text-sm font-medium transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell contentClassName="max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Become a Gen One partner
        </h1>
        <p className="mt-2 text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
          Refer traders to Gen One Futures and earn commission on every evaluation they purchase — for life.
          15–25% commission, monthly payouts, 60-day attribution.
        </p>
      </div>

      <AuthCard heading="Apply to join">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <AuthLabel>Your name</AuthLabel>
              <AuthInput placeholder="Full name" autoComplete="name" {...register("fullName")} />
              {errors.fullName && <p className="mt-1.5 text-xs text-red-300">{errors.fullName.message}</p>}
            </div>
            <div>
              <AuthLabel>Email</AuthLabel>
              <AuthInput type="email" placeholder="name@domain.com" autoComplete="email" {...register("email")} />
              {errors.email && <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <AuthLabel>Primary platform</AuthLabel>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PLATFORMS.map((p) => {
                const active = platform === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setValue("primaryPlatform", p, { shouldValidate: true })}
                    className={cn(
                      "h-10 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                      active
                        ? "bg-white text-[#0C0B10] border-white"
                        : "bg-white/[0.04] text-white/85 border-white/15 hover:border-white/30"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <AuthLabel>Profile URL</AuthLabel>
            <AuthInput placeholder="https://youtube.com/@yourchannel" {...register("socialUrl")} />
            {errors.socialUrl && <p className="mt-1.5 text-xs text-red-300">{errors.socialUrl.message}</p>}
            <p className="mt-1 text-[11px] text-white/45">
              Direct link to your channel or profile so we can verify content presence.
            </p>
          </div>

          <div>
            <AuthLabel>Audience size</AuthLabel>
            <AuthInput
              inputMode="numeric"
              placeholder="e.g. 25000"
              {...register("audienceSize")}
            />
            {errors.audienceSize && <p className="mt-1.5 text-xs text-red-300">{errors.audienceSize.message}</p>}
            <p className="mt-1 text-[11px] text-white/45">
              Followers / subscribers on your primary platform.
            </p>
          </div>

          <div>
            <AuthLabel>About your audience (optional)</AuthLabel>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="What kind of content do you publish? Who watches you trade?"
              className="w-full rounded-2xl bg-white/[0.04] border border-white/15 hover:border-white/30 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/15 transition-colors text-sm text-white placeholder:text-white/30 px-4 py-3 leading-relaxed"
            />
          </div>

          <AuthButton type="submit" disabled={isSubmitting || apply.isPending}>
            {apply.isPending ? "Submitting…" : "Submit application"}
          </AuthButton>

          <p className="text-[11px] text-white/55 text-center leading-relaxed">
            Already trade with Gen One?{" "}
            <Link href="/login" className="text-white hover:underline">
              Sign in
            </Link>
            {" "}— you can apply from inside your trader account too.
          </p>
        </form>
      </AuthCard>

      <p className="mt-6 text-center text-xs text-white/55">
        <Link href="/" className="hover:text-white underline-offset-4 hover:underline">
          ← Back to home
        </Link>
      </p>
    </AuthShell>
  );
}
