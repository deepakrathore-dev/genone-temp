"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api-client";
import { queryKeys } from "../queries";
import { toast } from "sonner";

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, amountCents }: { accountId: string; amountCents: number }) =>
      api.requestPayout(accountId, amountCents),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payouts });
      toast.success("Payout request submitted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to submit"),
  });
}

export function useUpdateNickname() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, nickname }: { accountId: string; nickname: string }) =>
      api.updateAccountNickname(accountId, nickname),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts });
      toast.success("Nickname updated");
    },
  });
}

export function useArchiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => api.archiveAccount(accountId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts });
      qc.invalidateQueries({ queryKey: queryKeys.archivedAccounts });
      toast.success("Account archived");
    },
  });
}

export function useUnarchiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => api.unarchiveAccount(accountId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts });
      qc.invalidateQueries({ queryKey: queryKeys.archivedAccounts });
      toast.success("Account restored");
    },
  });
}

export function useValidatePromo() {
  return useMutation({
    mutationFn: ({ code, tier }: { code: string; tier: string }) => api.validatePromoCode(code, tier),
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPurchase,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts });
      qc.invalidateQueries({ queryKey: queryKeys.me });
      toast.success("Evaluation purchased - credentials on the way");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Payment failed"),
  });
}

export function useSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => api.subscribe(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subscriptions });
      toast.success("Subscription activated - first charge will be on your monthly billing date");
    },
  });
}

export function useCancelMySubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cancelMySubscription(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subscriptions });
      toast.success("Cancelled - access remains until the end of the current cycle");
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
