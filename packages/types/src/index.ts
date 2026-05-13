// Shared domain types for the Gen One Futures platform.
// Currency values are stored as integer cents to avoid float drift.

export type ISODate = string;

export type Tier = "50K" | "100K" | "150K";

export type KycStatus = "NONE" | "PENDING" | "VERIFIED" | "REJECTED";

export type UserRole = "TRADER" | "SUPER_ADMIN" | "OPS" | "AFFILIATE_MANAGER" | "READ_ONLY";

export type AdminStatus = "ACTIVE" | "SUSPENDED" | "INVITED";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Exclude<UserRole, "TRADER">;
  status: AdminStatus;
  createdAt: ISODate;
  lastLoginAt?: ISODate;
  totpEnabled: boolean;
}

// Subscriptions (§24 - REQ-209 to REQ-216)
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "SUSPENDED";

export interface SubscriptionProduct {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  cadence: "MONTHLY";
  active: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  priceCents: number;
  status: SubscriptionStatus;
  startedAt: ISODate;
  nextBillingAt: ISODate;
  cancelledAt?: ISODate | null;
  failedAttempts: number;
}

export interface SubscriptionBillingAttempt {
  id: string;
  subscriptionId: string;
  ts: ISODate;
  amountCents: number;
  result: "SUCCESS" | "FAILED";
  failureReason?: string;
}

export interface NotificationPreferences {
  passFailEmails: boolean;
  payoutEmails: boolean;
  retentionEmails: boolean;
  productAnnouncements: boolean;
  loyaltyUpdates: boolean;
}

export interface RiskDisclosureAcceptance {
  acceptedAt: ISODate;
  version: string;
  ip: string;
  userAgent: string;
}

export interface User {
  // Identity (REQ-001)
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  initials: string;
  dateOfBirth?: ISODate;
  phone?: string;
  phoneVerified: boolean;

  // Address (captured during Veriff KYC, REQ-005)
  country: string; // ISO-2
  countryFlag: string; // emoji
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;

  // Compliance
  kycStatus: KycStatus;
  kycVerifiedAt?: ISODate;
  pepFlag: boolean;
  sanctionsCleared: boolean;
  riskDisclosure?: RiskDisclosureAcceptance;

  // Security
  totpEnabled: boolean;
  lastLoginAt?: ISODate;
  lastLoginIp?: string;

  // Preferences
  timezone?: string;
  locale?: string;
  notificationPrefs?: NotificationPreferences;

  // Lifecycle / business
  createdAt: ISODate;
  walletCreditCents: number;
  loyaltyAttempts: number;
  loyaltyTierPct: number;
  suspended: boolean;
  affiliateCode?: string;
  referredBy?: string;
}

export type AccountType = "EVALUATION" | "FUNDED";
export type AccountStatus =
  | "ACTIVE"
  | "DAILY_LOSS_LOCKED"
  | "PASSED"
  | "FAILED"
  | "INACTIVE"
  | "PAUSED";

export interface RuleSnapshot {
  tier: Tier;
  evaluationFeeCents: number;
  profitTargetCents: number;
  drawdownCents: number;
  dailyLossCents: number;
  maxContracts: number;
  bufferCents: number;
  firstPayoutCapCents: number;
  inactivityDays: number;
  greenDayThresholdCents: number;
  greenDaysRequired: number;
  consistencyPct: number;
  profitSplitPct: number;
  scaleThresholdCents: number;
}

export interface Account {
  id: string;
  rithmicAccountId: string;
  userId: string;
  type: AccountType;
  tier: Tier;
  status: AccountStatus;
  nickname?: string;
  archivedAt?: ISODate | null;
  createdAt: ISODate;
  startingBalanceCents: number;
  currentEquityCents: number;
  highestEquityCents: number;
  todayPnlCents: number;
  todayTradesCount: number;
  cumulativePnlCents: number;
  drawdownFloorCents: number; // initial - drawdown
  greenDaysCount: number;
  consistencyMaxDayPct: number; // % of cumulative profit
  buffersBuiltCents: number;
  inactivityResetAt: ISODate;
  totalWithdrawnCents: number;
  ruleSnapshot: RuleSnapshot;
  // populated for funded only
  fundedAt?: ISODate | null;
  lastPayoutAt?: ISODate | null;
  // optional preferred front-end
  preferredFrontEnd?: "RITHMIC_RTRADER" | "TRADESEA" | "ONYX_TRADER" | "DEEPCHARTS" | "NINJATRADER" | "QUANTOWER" | null;
}

export type TradeSide = "BUY" | "SELL";
export type TradeSource = "TRADER" | "PLATFORM_LIQUIDATION";

export interface Trade {
  id: string;
  accountId: string;
  ts: ISODate;
  instrument: string;
  side: TradeSide;
  size: number;
  entryPriceCents: number;
  exitPriceCents: number;
  pnlCents: number;
  source: TradeSource;
}

export type PayoutStatus = "REQUESTED" | "APPROVED" | "PROCESSED" | "DISBURSED" | "REJECTED";

export interface GateStatus {
  kyc: "PASS" | "FAIL";
  buffer: "PASS" | "FAIL";
  greenDays: "PASS" | "FAIL";
  consistency: "PASS" | "FAIL";
  fraudFlags: "PASS" | "FAIL";
  dailyCap: "PASS" | "FAIL";
  details?: Partial<Record<keyof Omit<GateStatus, "details">, string>>;
}

export interface Payout {
  id: string;
  userId: string;
  accountId: string;
  sequence: number;
  amountCents: number;
  status: PayoutStatus;
  requestedAt: ISODate;
  approvedAt?: ISODate | null;
  processedAt?: ISODate | null;
  disbursedAt?: ISODate | null;
  rejectionReason?: string;
  gateStatus: GateStatus;
  method: "BANK" | "CRYPTO";
}

export type NotificationKind = "SYSTEM" | "ALERT" | "PASS" | "FAIL" | "PAYOUT" | "LOYALTY";

export interface NotificationItem {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link?: string;
  createdAt: ISODate;
  readAt?: ISODate | null;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  initials: string;
  country: string;
  countryFlag: string;
  totalPnlCents: number;
  winRatePct: number;
  trades: number;
  avgWinCents: number;
  avgLossCents: number;
  profitFactor: number;
}

export type CalendarEvent =
  | "FORCE_LIQUIDATION"
  | "HOLIDAY"
  | "MILESTONE_PASS"
  | "MILESTONE_PAYOUT"
  | "INACTIVITY_WARNING";

export interface CalendarDay {
  date: ISODate; // YYYY-MM-DD
  pnlCents: number;
  tradesCount: number;
  events: CalendarEvent[];
}

export interface Kpi {
  label: string;
  value: number | string;
  formatter?: "currency" | "number" | "percent" | "duration" | "raw";
  delta?: number; // % change
}

export interface AuditEntry {
  id: string;
  ts: ISODate;
  adminUserId: string;
  adminUserName: string;
  action: string;
  entity: string;
  before?: unknown;
  after?: unknown;
  ip: string;
  userAgent: string;
}

export interface AdminUserSummary extends User {
  accountsCount: number;
  totalSpentCents: number;
  totalPayoutCents: number;
  lastLoginAt?: ISODate;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  accountId?: string;
  product: string;
  tier?: Tier;
  amountCents: number;
  status: "PAID" | "REFUNDED" | "FAILED";
  ts: ISODate;
}

export interface PayoutExposure {
  date: ISODate;
  approvedCents: number;
  pendingCents: number;
  dailyCapCents: number;
}

export interface CohortRow {
  signupMonth: string; // YYYY-MM
  buckets: Array<{ bucket: string; valuePct: number; count: number }>;
}

export interface ForecastBucket {
  horizonDays: 7 | 30 | 90;
  forecastCents: number;
  low: number;
  high: number;
}

export interface SymbolAnalyticsRow {
  symbol: string;
  totalTrades: number;
  totalProfitCents: number;
  totalLossCents: number;
  avgProfitCents: number;
  avgLossCents: number;
  lossToProfitRatio: number;
}

export interface AffiliateRow {
  id: string;
  name: string;
  email: string;
  code: string;
  tierPct: number;
  monthSignups: number;
  totalCommissionCents: number;
  pendingCommissionCents: number;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
}

export type TimeWindow = "TODAY" | "WEEK" | "MONTH" | "ALL_TIME";

export interface TierConfig {
  tier: Tier;
  evaluationFeeCents: number;
  profitTargetCents: number;
  drawdownCents: number;
  dailyLossCents: number;
  maxContracts: number;
  bufferCents: number;
  firstPayoutCapCents: number;
  inactivityDays: number;
}
