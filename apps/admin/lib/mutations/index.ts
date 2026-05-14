"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api/api-client";
import { queryKeys } from "../queries";

export function useApprovePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, totp }: { id: string; totp: string }) => api.approvePayout(id, totp),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.payoutQueue }); toast.success("Payout approved"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
}

export function useRejectPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, totp }: { id: string; reason: string; totp: string }) =>
      api.rejectPayout(id, reason, totp),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.payoutQueue }); toast.success("Payout rejected"); },
  });
}

export function useUpdateTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tier, payload }: { tier: string; payload: Record<string, unknown> }) =>
      api.updateTier(tier, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.tiers }); qc.invalidateQueries({ queryKey: queryKeys.audit }); toast.success("Tier updated. New rules apply to new accounts."); },
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, totp }: { id: string; reason: string; totp: string }) => api.suspendUser(id, reason, totp),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.users }); toast.success("User suspended"); },
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admins });
      qc.invalidateQueries({ queryKey: queryKeys.audit });
      toast.success("Admin invited - they'll get an enrolment email");
    },
  });
}

export function useUpdateAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role, totp }: { id: string; role: import("@genone/types").UserRole; totp: string }) =>
      api.updateAdminRole(id, role, totp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admins });
      qc.invalidateQueries({ queryKey: queryKeys.audit });
      toast.success("Role updated");
    },
  });
}

export function useSetAdminStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, totp }: { id: string; status: "ACTIVE" | "SUSPENDED"; totp: string }) =>
      api.setAdminStatus(id, status, totp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admins });
      qc.invalidateQueries({ queryKey: queryKeys.audit });
      toast.success("Status updated");
    },
  });
}

export function useRetrySubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.retrySubscriptionCharge(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.subscriptions }); toast.success("Retry queued"); },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cancelSubscription(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.subscriptions }); toast.success("Subscription cancelled"); },
  });
}

export function useManualCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amountCents, reason, totp }: { id: string; amountCents: number; reason: string; totp: string }) =>
      api.manualCredit(id, amountCents, reason, totp),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.users }); toast.success("Credit issued"); },
  });
}

// ---- Challenge taxonomy ----
export function useCreateChallengeType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createChallengeType,
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.challengeTypes }); toast.success("Challenge type created"); },
  });
}

export function useUpdateChallengeType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<import("@genone/types").ChallengeType> }) => api.updateChallengeType(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.challengeTypes }); toast.success("Challenge type updated"); },
  });
}

export function useDeleteChallengeType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteChallengeType(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.challengeTypes }); toast.success("Challenge type removed"); },
  });
}

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createChallenge,
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.challenges }); toast.success("Challenge created. Available to new purchasers immediately."); },
  });
}

export function useUpdateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<import("@genone/types").Challenge> }) => api.updateChallenge(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.challenges }); toast.success("Challenge updated"); },
  });
}

export function useArchiveChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.archiveChallenge(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.challenges }); toast.success("Challenge archived"); },
  });
}

// ---- Email templates ----
export function useUpdateEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<import("@genone/types").EmailTemplate> }) => api.updateEmailTemplate(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.emailTemplates }); toast.success("Template saved"); },
  });
}

export function useSendEmailTemplateTest() {
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) => api.sendEmailTemplateTest(id, to),
    onSuccess: (_, { to }) => toast.success(`Test email sent to ${to}`),
  });
}
