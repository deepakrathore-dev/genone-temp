"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api-client";
import type { TimeWindow } from "@genone/types";

export const queryKeys = {
  me: ["me"] as const,
  accounts: ["accounts"] as const,
  archivedAccounts: ["accounts", "archived"] as const,
  accountState: (id: string) => ["account-state", id] as const,
  trades: (id: string, filters?: Record<string, string | undefined>) => ["trades", id, filters ?? {}] as const,
  calendar: (id: string) => ["calendar", id] as const,
  payouts: ["payouts"] as const,
  notifications: ["notifications"] as const,
  leaderboard: (window: TimeWindow) => ["leaderboard", window] as const,
  subscriptions: ["subscriptions"] as const,
  subscriptionProducts: ["subscription-products"] as const,
  challengeTypes: ["challenge-types"] as const,
  challenges: ["challenges"] as const,
};

export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: api.getMe });
}

export function useAccounts() {
  return useQuery({ queryKey: queryKeys.accounts, queryFn: api.getAccounts });
}

export function useArchivedAccounts() {
  return useQuery({ queryKey: queryKeys.archivedAccounts, queryFn: api.getArchivedAccounts });
}

export function useAccountState(accountId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.accountState(accountId ?? ""),
    queryFn: () => api.getAccountState(accountId!),
    enabled: !!accountId,
    refetchInterval: 60_000, // WS-fallback safety net
  });
}

export function useTrades(accountId: string | null | undefined, filters?: Record<string, string | undefined>) {
  return useQuery({
    queryKey: queryKeys.trades(accountId ?? "", filters),
    queryFn: () => api.getTrades(accountId!, filters),
    enabled: !!accountId,
  });
}

export function useCalendar(accountId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.calendar(accountId ?? ""),
    queryFn: () => api.getCalendar(accountId!),
    enabled: !!accountId,
  });
}

export function usePayouts() {
  return useQuery({ queryKey: queryKeys.payouts, queryFn: api.getPayouts });
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: api.getNotifications });
}

export function useLeaderboard(window: TimeWindow) {
  return useQuery({ queryKey: queryKeys.leaderboard(window), queryFn: () => api.getLeaderboard(window) });
}

export function useSubscriptionProducts() {
  return useQuery({ queryKey: queryKeys.subscriptionProducts, queryFn: api.getSubscriptionProducts });
}

export function useMySubscriptions() {
  return useQuery({ queryKey: queryKeys.subscriptions, queryFn: api.getSubscriptions });
}

export function useChallengeTypes() {
  return useQuery({ queryKey: queryKeys.challengeTypes, queryFn: api.getChallengeTypes });
}

export function useChallenges() {
  return useQuery({ queryKey: queryKeys.challenges, queryFn: api.getChallenges });
}
