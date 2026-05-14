import * as mock from "@genone/mock-data";
import type {
  AdminUser,
  AdminUserSummary,
  AffiliateRow,
  AuditEntry,
  Challenge,
  ChallengeType,
  CohortRow,
  EmailTemplate,
  ForecastBucket,
  Kpi,
  Payout,
  PayoutExposure,
  PurchaseRecord,
  Subscription,
  SubscriptionBillingAttempt,
  SubscriptionProduct,
  SymbolAnalyticsRow,
  TierConfig,
  User,
  UserRole,
  Account,
} from "@genone/types";

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK === "false" ? false : true;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const latency = () => new Promise<void>((r) => setTimeout(r, 120 + Math.random() * 240));

async function get<T>(path: string, mocked: () => T): Promise<T> {
  if (MOCK_MODE) { await latency(); return mocked(); }
  const res = await fetch(`${API_BASE_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown, mocked: () => T): Promise<T> {
  if (MOCK_MODE) { await latency(); return mocked(); }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getKpis: () => get<Kpi[]>("/admin/kpis", () => mock.kpis),
  getUsers: () => get<AdminUserSummary[]>("/admin/users", () => mock.adminUserSummaries),
  getUser: (id: string) =>
    get<User>(`/admin/users/${id}`, () => mock.users.find((u) => u.id === id) ?? mock.users[0]!),
  getUserAccounts: (id: string) =>
    get<Account[]>(`/admin/users/${id}/accounts`, () => mock.accounts.filter((a) => a.userId === id)),
  getUserPayouts: (id: string) =>
    get<Payout[]>(`/admin/users/${id}/payouts`, () => mock.payouts.filter((p) => p.userId === id)),
  getUserPurchases: (id: string) =>
    get<PurchaseRecord[]>(`/admin/users/${id}/purchases`, () => mock.purchases.filter((p) => p.userId === id)),

  getPayoutQueue: () =>
    get<Payout[]>("/admin/payouts", () => mock.payouts),
  getPayoutExposure: () =>
    get<PayoutExposure[]>("/admin/payouts/exposure", () => mock.payoutExposure),

  approvePayout: (id: string, totp: string) =>
    post<{ ok: true }>(`/admin/payouts/${id}/approve`, { totp }, () => ({ ok: true })),
  rejectPayout: (id: string, reason: string, totp: string) =>
    post<{ ok: true }>(`/admin/payouts/${id}/reject`, { reason, totp }, () => ({ ok: true })),

  getKycQueue: () => get<User[]>("/admin/kyc", () => mock.users.filter((u) => u.kycStatus === "PENDING")),
  getAffiliates: () => get<AffiliateRow[]>("/admin/affiliates", () => mock.affiliates),
  getFlaggedUsers: () => get<AdminUserSummary[]>("/admin/risk/flagged", () => mock.adminUserSummaries.filter((_, i) => i < 6)),

  getSymbolAnalytics: () => get<SymbolAnalyticsRow[]>("/admin/bi/symbols", () => mock.symbolAnalytics),
  getCohortRetention: () => get<CohortRow[]>("/admin/bi/cohorts/retention", () => mock.cohortRetention),
  getPayoutCohort: () => get<CohortRow[]>("/admin/bi/cohorts/payouts", () => mock.payoutCohort),
  getForecast: () => get<ForecastBucket[]>("/admin/bi/forecast", () => mock.forecast),

  getTiers: () => get<TierConfig[]>("/admin/config/tiers", () => mock.tierConfigs),
  getAudit: () => get<AuditEntry[]>("/admin/audit", () => mock.audit),

  updateTier: (tier: string, payload: Partial<TierConfig>) =>
    post<{ ok: true }>(`/admin/config/tiers/${tier}`, payload, () => ({ ok: true })),
  suspendUser: (id: string, reason: string, totp: string) =>
    post<{ ok: true }>(`/admin/users/${id}/suspend`, { reason, totp }, () => ({ ok: true })),
  manualCredit: (id: string, amountCents: number, reason: string, totp: string) =>
    post<{ ok: true }>(`/admin/users/${id}/credit`, { amountCents, reason, totp }, () => ({ ok: true })),

  // ---- Admin user management ----
  getAdmins: () => get<AdminUser[]>("/admin/admins", () => mock.adminUsers),
  createAdmin: (payload: { name: string; email: string; role: UserRole; totp: string }) =>
    post<AdminUser>("/admin/admins", payload, () => ({
      id: `adm_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      initials: payload.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
      role: payload.role as Exclude<UserRole, "TRADER">,
      status: "INVITED",
      createdAt: new Date().toISOString(),
      totpEnabled: false,
    })),
  updateAdminRole: (id: string, role: UserRole, totp: string) =>
    post<{ ok: true }>(`/admin/admins/${id}/role`, { role, totp }, () => ({ ok: true })),
  setAdminStatus: (id: string, status: "ACTIVE" | "SUSPENDED", totp: string) =>
    post<{ ok: true }>(`/admin/admins/${id}/status`, { status, totp }, () => ({ ok: true })),

  // ---- Subscriptions ----
  getSubscriptions: () => get<Subscription[]>("/admin/subscriptions", () => mock.subscriptions),
  getSubscriptionProducts: () => get<SubscriptionProduct[]>("/admin/subscription-products", () => mock.subscriptionProducts),
  getSubscriptionAttempts: () => get<SubscriptionBillingAttempt[]>("/admin/subscription-attempts", () => mock.subscriptionAttempts),
  retrySubscriptionCharge: (id: string) => post<{ ok: true }>(`/admin/subscriptions/${id}/retry`, {}, () => ({ ok: true })),
  cancelSubscription: (id: string) => post<{ ok: true }>(`/admin/subscriptions/${id}/cancel`, {}, () => ({ ok: true })),

  // ---- Challenge taxonomy ----
  getChallengeTypes: () => get<ChallengeType[]>("/admin/challenge-types", () => mock.challengeTypes),
  createChallengeType: (payload: Pick<ChallengeType, "name" | "description">) =>
    post<ChallengeType>("/admin/challenge-types", payload, () => ({
      id: `ct_${Date.now()}`,
      name: payload.name,
      description: payload.description,
      active: true,
      challengeCount: 0,
      createdAt: new Date().toISOString(),
    })),
  updateChallengeType: (id: string, payload: Partial<ChallengeType>) =>
    post<{ ok: true }>(`/admin/challenge-types/${id}`, payload, () => ({ ok: true })),
  deleteChallengeType: (id: string) =>
    post<{ ok: true }>(`/admin/challenge-types/${id}/delete`, {}, () => ({ ok: true })),

  getChallenges: () => get<Challenge[]>("/admin/challenges", () => mock.challenges),
  createChallenge: (payload: Omit<Challenge, "id" | "createdAt" | "archivedAt">) =>
    post<Challenge>("/admin/challenges", payload, () => ({
      ...payload,
      id: `ch_${Date.now()}`,
      createdAt: new Date().toISOString(),
      archivedAt: null,
    })),
  updateChallenge: (id: string, payload: Partial<Challenge>) =>
    post<{ ok: true }>(`/admin/challenges/${id}`, payload, () => ({ ok: true })),
  archiveChallenge: (id: string) =>
    post<{ ok: true }>(`/admin/challenges/${id}/archive`, {}, () => ({ ok: true })),

  // ---- Email templates ----
  getEmailTemplates: () => get<EmailTemplate[]>("/admin/email-templates", () => mock.emailTemplates),
  updateEmailTemplate: (id: string, payload: Partial<EmailTemplate>) =>
    post<{ ok: true }>(`/admin/email-templates/${id}`, payload, () => ({ ok: true })),
  sendEmailTemplateTest: (id: string, to: string) =>
    post<{ ok: true }>(`/admin/email-templates/${id}/test`, { to }, () => ({ ok: true })),
};
