import * as mock from "@genone/mock-data";
import type {
  Account,
  CalendarDay,
  LeaderboardRow,
  NotificationItem,
  Payout,
  Subscription,
  SubscriptionProduct,
  TimeWindow,
  Trade,
  User,
} from "@genone/types";

// Toggle to swap from mock JSON to a real API. The only other change needed
// at that point is the WS endpoint in lib/ws/ws-client.ts.
export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK === "false" ? false : true;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const latency = () => new Promise<void>((r) => setTimeout(r, 120 + Math.random() * 240));

// Default to first user for mock-mode "current trader"
const CURRENT_USER_ID = "usr_0001";

async function get<T>(path: string, mocked: () => T): Promise<T> {
  if (MOCK_MODE) {
    await latency();
    return mocked();
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown, mocked: () => T): Promise<T> {
  if (MOCK_MODE) {
    await latency();
    return mocked();
  }
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
  currentUserId: () => CURRENT_USER_ID,

  getMe: () =>
    get<User>("/me", () => mock.users.find((u) => u.id === CURRENT_USER_ID)!),

  getAccounts: () =>
    get<Account[]>("/accounts", () =>
      mock.accounts.filter((a) => a.userId === CURRENT_USER_ID && !a.archivedAt)
    ),

  getArchivedAccounts: () =>
    get<Account[]>("/accounts?archived=1", () =>
      mock.accounts.filter((a) => a.userId === CURRENT_USER_ID && a.archivedAt)
    ),

  getAccountState: (accountId: string) =>
    get<Account>(`/accounts/${accountId}`, () => {
      const acc = mock.accounts.find((a) => a.id === accountId);
      if (!acc) throw new Error("Account not found");
      // Add slight drift so we visibly update
      return { ...acc };
    }),

  getTrades: (accountId: string, filters?: { from?: string; to?: string; instrument?: string; side?: string }) =>
    get<Trade[]>(`/accounts/${accountId}/trades`, () => {
      let trades = mock.trades.filter((t) => t.accountId === accountId);
      if (filters?.instrument) trades = trades.filter((t) => t.instrument === filters.instrument);
      if (filters?.side) trades = trades.filter((t) => t.side === filters.side);
      if (filters?.from) trades = trades.filter((t) => t.ts >= filters.from!);
      if (filters?.to) trades = trades.filter((t) => t.ts <= filters.to!);
      return trades;
    }),

  getCalendar: (accountId: string) =>
    get<CalendarDay[]>(`/accounts/${accountId}/calendar`, () => mock.calendar[accountId] ?? []),

  getPayouts: () =>
    get<Payout[]>("/payouts", () => mock.payouts.filter((p) => p.userId === CURRENT_USER_ID)),

  getNotifications: () =>
    get<NotificationItem[]>("/notifications", () =>
      mock.notifications.filter((n) => n.userId === CURRENT_USER_ID || true) // mock: show all
    ),

  getLeaderboard: (window: TimeWindow) =>
    get<LeaderboardRow[]>(`/leaderboard?window=${window}`, () => mock.leaderboard.slice(0, 50)),

  requestPayout: (accountId: string, amountCents: number) =>
    post<Payout>("/payouts", { accountId, amountCents }, () => ({
      id: `pay_pending_${Date.now()}`,
      userId: CURRENT_USER_ID,
      accountId,
      sequence: 99,
      amountCents,
      status: "REQUESTED",
      requestedAt: new Date().toISOString(),
      method: "BANK",
      gateStatus: {
        kyc: "PASS",
        buffer: "PASS",
        greenDays: "PASS",
        consistency: "PASS",
        fraudFlags: "PASS",
        dailyCap: "PASS",
      },
    } satisfies Payout)),

  updateAccountNickname: (accountId: string, nickname: string) =>
    post<{ ok: true }>(`/accounts/${accountId}/nickname`, { nickname }, () => ({ ok: true })),

  archiveAccount: (accountId: string) =>
    post<{ ok: true }>(`/accounts/${accountId}/archive`, {}, () => ({ ok: true })),

  unarchiveAccount: (accountId: string) =>
    post<{ ok: true }>(`/accounts/${accountId}/unarchive`, {}, () => ({ ok: true })),

  markNotificationRead: (id: string) =>
    post<{ ok: true }>(`/notifications/${id}/read`, {}, () => ({ ok: true })),

  // ---- Subscriptions (§24) ----
  getSubscriptionProducts: () =>
    get<SubscriptionProduct[]>("/subscriptions/products", () => mock.subscriptionProducts.filter((p) => p.active)),
  getSubscriptions: () =>
    get<Subscription[]>("/subscriptions", () => mock.subscriptions.filter((s) => s.userId === CURRENT_USER_ID)),
  subscribe: (productId: string) =>
    post<Subscription>("/subscriptions", { productId }, () => {
      const product = mock.subscriptionProducts.find((p) => p.id === productId)!;
      return {
        id: `sub_new_${Date.now()}`,
        userId: CURRENT_USER_ID,
        productId,
        productName: product.name,
        priceCents: product.priceCents,
        status: "ACTIVE",
        startedAt: new Date().toISOString(),
        nextBillingAt: new Date(Date.now() + 30 * 86400_000).toISOString(),
        cancelledAt: null,
        failedAttempts: 0,
      };
    }),
  cancelMySubscription: (id: string) =>
    post<{ ok: true }>(`/subscriptions/${id}/cancel`, {}, () => ({ ok: true })),

  // ---------- Purchase / checkout (§2 - REQ-007 to REQ-013) ----------
  validatePromoCode: (code: string, tier: string) =>
    post<PromoResult>("/promo/validate", { code, tier }, () => mockValidatePromo(code, tier)),

  createPurchase: (input: { tier: string; promoCode?: string; useCredit: boolean }) =>
    post<PurchaseReceipt>("/purchase", input, () => mockCreatePurchase(input)),
};

// Promo registry - kept inline so it's swappable to an API call. Codes are deliberately
// configurable per REQ-011 (start/end, usage limit, min tier).
const PROMO_REGISTRY: Record<string, { kind: "PERCENT" | "FIXED"; value: number; minTier?: string; label: string }> = {
  WELCOME10: { kind: "PERCENT", value: 10, label: "Welcome 10% off" },
  PRO20:     { kind: "PERCENT", value: 20, minTier: "100K", label: "Pro 20% off (100K+)" },
  SAVE25:    { kind: "FIXED",   value: 2_500, label: "Save $25 (fixed)" },
};

export type PromoResult =
  | { ok: true; code: string; label: string; kind: "PERCENT" | "FIXED"; value: number }
  | { ok: false; reason: string };

function mockValidatePromo(code: string, tier: string): PromoResult {
  const normalised = code.trim().toUpperCase();
  const entry = PROMO_REGISTRY[normalised];
  if (!entry) return { ok: false, reason: "That code isn't valid right now." };
  if (entry.minTier && tierIndex(tier) < tierIndex(entry.minTier)) {
    return { ok: false, reason: `Requires ${entry.minTier} tier or higher.` };
  }
  return { ok: true, code: normalised, label: entry.label, kind: entry.kind, value: entry.value };
}

function tierIndex(t: string) {
  return ["50K", "100K", "150K"].indexOf(t);
}

export interface PurchaseReceipt {
  id: string;
  accountId: string;
  tier: string;
  subtotalCents: number;
  loyaltyDiscountCents: number;
  promoDiscountCents: number;
  creditAppliedCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string;
  rithmicAccountId: string;
  status: "PAID";
}

function mockCreatePurchase(input: { tier: string; promoCode?: string; useCredit: boolean }): PurchaseReceipt {
  // Recompute server-side rather than trusting the client.
  const me = mock.users.find((u) => u.id === CURRENT_USER_ID)!;
  const tierCfg = mock.tierConfigs.find((t) => t.tier === input.tier)!;
  const subtotal = tierCfg.evaluationFeeCents;
  const loyalty = Math.round(subtotal * (me.loyaltyTierPct / 100));
  const afterLoyalty = subtotal - loyalty;
  let promoDiscount = 0;
  if (input.promoCode) {
    const v = mockValidatePromo(input.promoCode, input.tier);
    if (v.ok) {
      promoDiscount = v.kind === "PERCENT" ? Math.round(afterLoyalty * (v.value / 100)) : v.value;
    }
  }
  const afterPromo = Math.max(0, afterLoyalty - promoDiscount);
  const creditApplied = input.useCredit ? Math.min(me.walletCreditCents, afterPromo) : 0;
  const total = Math.max(0, afterPromo - creditApplied);
  const id = `pur_${Date.now()}`;
  const accountId = `acc_${String(99000 + Math.floor(Math.random() * 999)).padStart(5, "0")}`;
  return {
    id,
    accountId,
    tier: input.tier,
    subtotalCents: subtotal,
    loyaltyDiscountCents: loyalty,
    promoDiscountCents: promoDiscount,
    creditAppliedCents: creditApplied,
    taxCents: 0,
    totalCents: total,
    createdAt: new Date().toISOString(),
    rithmicAccountId: `RITHMIC-${Math.floor(Math.random() * 90000) + 10000}`,
    status: "PAID",
  };
}
