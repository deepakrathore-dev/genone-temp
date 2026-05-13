"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api-client";

export const queryKeys = {
  kpis: ["kpis"] as const,
  users: ["admin", "users"] as const,
  user: (id: string) => ["admin", "user", id] as const,
  userAccounts: (id: string) => ["admin", "user-accounts", id] as const,
  userPayouts: (id: string) => ["admin", "user-payouts", id] as const,
  userPurchases: (id: string) => ["admin", "user-purchases", id] as const,
  payoutQueue: ["admin", "payouts"] as const,
  exposure: ["admin", "exposure"] as const,
  kyc: ["admin", "kyc"] as const,
  affiliates: ["admin", "affiliates"] as const,
  flagged: ["admin", "flagged"] as const,
  symbols: ["admin", "bi", "symbols"] as const,
  cohortRetention: ["admin", "bi", "cohorts", "retention"] as const,
  cohortPayout: ["admin", "bi", "cohorts", "payouts"] as const,
  forecast: ["admin", "bi", "forecast"] as const,
  tiers: ["admin", "config", "tiers"] as const,
  audit: ["admin", "audit"] as const,
  admins: ["admin", "admins"] as const,
  subscriptions: ["admin", "subscriptions"] as const,
  subscriptionProducts: ["admin", "subscription-products"] as const,
  subscriptionAttempts: ["admin", "subscription-attempts"] as const,
};

export const useKpis = () => useQuery({ queryKey: queryKeys.kpis, queryFn: api.getKpis, refetchInterval: 30_000 });
export const useUsers = () => useQuery({ queryKey: queryKeys.users, queryFn: api.getUsers });
export const useUser = (id: string) => useQuery({ queryKey: queryKeys.user(id), queryFn: () => api.getUser(id) });
export const useUserAccounts = (id: string) => useQuery({ queryKey: queryKeys.userAccounts(id), queryFn: () => api.getUserAccounts(id) });
export const useUserPayouts = (id: string) => useQuery({ queryKey: queryKeys.userPayouts(id), queryFn: () => api.getUserPayouts(id) });
export const useUserPurchases = (id: string) => useQuery({ queryKey: queryKeys.userPurchases(id), queryFn: () => api.getUserPurchases(id) });
export const usePayoutQueue = () => useQuery({ queryKey: queryKeys.payoutQueue, queryFn: api.getPayoutQueue });
export const useExposure = () => useQuery({ queryKey: queryKeys.exposure, queryFn: api.getPayoutExposure, refetchInterval: 60_000 });
export const useKycQueue = () => useQuery({ queryKey: queryKeys.kyc, queryFn: api.getKycQueue });
export const useAffiliates = () => useQuery({ queryKey: queryKeys.affiliates, queryFn: api.getAffiliates });
export const useFlaggedUsers = () => useQuery({ queryKey: queryKeys.flagged, queryFn: api.getFlaggedUsers });
export const useSymbolAnalytics = () => useQuery({ queryKey: queryKeys.symbols, queryFn: api.getSymbolAnalytics });
export const useCohortRetention = () => useQuery({ queryKey: queryKeys.cohortRetention, queryFn: api.getCohortRetention });
export const usePayoutCohort = () => useQuery({ queryKey: queryKeys.cohortPayout, queryFn: api.getPayoutCohort });
export const useForecast = () => useQuery({ queryKey: queryKeys.forecast, queryFn: api.getForecast });
export const useTiers = () => useQuery({ queryKey: queryKeys.tiers, queryFn: api.getTiers });
export const useAudit = () => useQuery({ queryKey: queryKeys.audit, queryFn: api.getAudit });
export const useAdmins = () => useQuery({ queryKey: queryKeys.admins, queryFn: api.getAdmins });
export const useSubscriptions = () => useQuery({ queryKey: queryKeys.subscriptions, queryFn: api.getSubscriptions });
export const useSubscriptionProducts = () => useQuery({ queryKey: queryKeys.subscriptionProducts, queryFn: api.getSubscriptionProducts });
export const useSubscriptionAttempts = () => useQuery({ queryKey: queryKeys.subscriptionAttempts, queryFn: api.getSubscriptionAttempts });
