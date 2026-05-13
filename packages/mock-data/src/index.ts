import type {
  Account,
  AdminUser,
  AdminUserSummary,
  AffiliateRow,
  AuditEntry,
  CalendarDay,
  CohortRow,
  ForecastBucket,
  Kpi,
  LeaderboardRow,
  NotificationItem,
  Payout,
  PayoutExposure,
  PurchaseRecord,
  RuleSnapshot,
  Subscription,
  SubscriptionBillingAttempt,
  SubscriptionProduct,
  SymbolAnalyticsRow,
  Tier,
  TierConfig,
  Trade,
  User,
} from "@genone/types";
import { chance, pick, rand, randInt, seed } from "./seed";

export type { Account, Trade, Payout, User, NotificationItem, LeaderboardRow };

// ---- Constants ----
const SYMBOLS = ["ES 03-2026", "NQ 03-2026", "CL 03-2026", "GC 03-2026", "6E 03-2026", "NGX25", "ZB 03-2026"] as const;
const COUNTRIES: Array<[string, string]> = [
  ["US", "🇺🇸"], ["GB", "🇬🇧"], ["IN", "🇮🇳"], ["CA", "🇨🇦"], ["DE", "🇩🇪"],
  ["AU", "🇦🇺"], ["BR", "🇧🇷"], ["FR", "🇫🇷"], ["MX", "🇲🇽"], ["NG", "🇳🇬"],
  ["PH", "🇵🇭"], ["SG", "🇸🇬"], ["ZA", "🇿🇦"], ["AE", "🇦🇪"], ["TR", "🇹🇷"],
];

const TIER_CONFIGS: Record<Tier, TierConfig> = {
  "50K": {
    tier: "50K",
    evaluationFeeCents: 12_900,
    profitTargetCents: 300_000,
    drawdownCents: 200_000,
    dailyLossCents: 137_500,
    maxContracts: 3,
    bufferCents: 210_000,
    firstPayoutCapCents: 200_000,
    inactivityDays: 30,
  },
  "100K": {
    tier: "100K",
    evaluationFeeCents: 22_000,
    profitTargetCents: 600_000,
    drawdownCents: 300_000,
    dailyLossCents: 275_000,
    maxContracts: 5,
    bufferCents: 310_000,
    firstPayoutCapCents: 200_000,
    inactivityDays: 30,
  },
  "150K": {
    tier: "150K",
    evaluationFeeCents: 25_900,
    profitTargetCents: 900_000,
    drawdownCents: 450_000,
    dailyLossCents: 412_500,
    maxContracts: 10,
    bufferCents: 460_000,
    firstPayoutCapCents: 300_000,
    inactivityDays: 30,
  },
};

export const TIERS: TierConfig[] = Object.values(TIER_CONFIGS);

function ruleSnapshotForTier(tier: Tier): RuleSnapshot {
  const t = TIER_CONFIGS[tier];
  return {
    tier,
    evaluationFeeCents: t.evaluationFeeCents,
    profitTargetCents: t.profitTargetCents,
    drawdownCents: t.drawdownCents,
    dailyLossCents: t.dailyLossCents,
    maxContracts: t.maxContracts,
    bufferCents: t.bufferCents,
    firstPayoutCapCents: t.firstPayoutCapCents,
    inactivityDays: t.inactivityDays,
    greenDayThresholdCents: 20_000,
    greenDaysRequired: 5,
    consistencyPct: 50,
    profitSplitPct: 80,
    scaleThresholdCents: 1_000_000,
  };
}

const FIRST_NAMES = ["Brian", "Sarah", "Alex", "Maria", "James", "Linh", "Omar", "Priya", "Diego", "Mia", "Liam", "Ava", "Noah", "Emma", "Lucas", "Isabella", "Mason", "Sophia", "Ethan", "Olivia"];
const LAST_NAMES = ["Murphy", "Chen", "Rodriguez", "Smith", "Johnson", "Khan", "Patel", "Brown", "Davis", "Garcia", "Wilson", "Anderson", "Thomas", "Lee", "Martinez", "Taylor", "Walker", "Young", "King", "Wright"];

const STARTING_BALANCES: Record<Tier, number> = {
  "50K": 5_000_000,
  "100K": 10_000_000,
  "150K": 15_000_000,
};

const todayISO = (offsetDays = 0) => {
  const d = new Date("2026-05-13T15:30:00Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString();
};

// ---- Builders ----
seed(0xC0FFEE);

function buildUsers(): User[] {
  const users: User[] = [];
  for (let i = 0; i < 20; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const [country, flag] = pick(COUNTRIES);
    const attempts = randInt(0, 14);
    const tierPct = attempts >= 10 ? 10 : attempts >= 5 ? 5 : attempts >= 3 ? 2 : 0;
    users.push({
      id: `usr_${String(i + 1).padStart(4, "0")}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      fullName: `${first} ${last}`,
      initials: `${first[0]}. ${last[0]}.`,
      country,
      countryFlag: flag,
      kycStatus: i === 0 ? "VERIFIED" : pick(["VERIFIED", "VERIFIED", "PENDING", "NONE"] as const),
      createdAt: todayISO(-randInt(10, 220)),
      walletCreditCents: randInt(0, 30_000),
      loyaltyAttempts: attempts,
      loyaltyTierPct: tierPct,
      suspended: chance(0.05),
      affiliateCode: chance(0.3) ? `REF${(i + 1) * 7}` : undefined,
    });
  }
  return users;
}

function buildAccounts(users: User[]): Account[] {
  const accounts: Account[] = [];
  let aId = 1;
  // distribute ~50 accounts
  for (const user of users) {
    const n = randInt(1, 4);
    for (let i = 0; i < n && accounts.length < 50; i++) {
      const tier = pick<Tier>(["50K", "100K", "150K"]);
      const type = chance(0.45) ? "FUNDED" : "EVALUATION";
      const status = (() => {
        const roll = rand();
        if (roll < 0.55) return "ACTIVE" as const;
        if (roll < 0.65) return "DAILY_LOSS_LOCKED" as const;
        if (roll < 0.75) return "PASSED" as const;
        if (roll < 0.85) return "FAILED" as const;
        if (roll < 0.95) return "INACTIVE" as const;
        return "PAUSED" as const;
      })();
      const start = STARTING_BALANCES[tier];
      const drawdown = TIER_CONFIGS[tier].drawdownCents;
      const cumulativePnl = randInt(-Math.floor(drawdown * 0.95), Math.floor(start * 0.25));
      const currentEquity = start + cumulativePnl;
      const today = randInt(-150_000, 250_000);
      accounts.push({
        id: `acc_${String(aId).padStart(5, "0")}`,
        rithmicAccountId: `RITHMIC-${randInt(10000, 99999)}`,
        userId: user.id,
        type,
        tier,
        status,
        nickname: chance(0.45) ? pick(["Main", "Scalping", "Swing", "EU Session", "US Open"]) : undefined,
        archivedAt: status === "FAILED" || status === "PASSED" ? (chance(0.4) ? todayISO(-randInt(1, 20)) : null) : null,
        createdAt: todayISO(-randInt(3, 120)),
        startingBalanceCents: start,
        currentEquityCents: currentEquity,
        highestEquityCents: Math.max(start, currentEquity + randInt(0, 100_000)),
        todayPnlCents: today,
        todayTradesCount: randInt(0, 24),
        cumulativePnlCents: cumulativePnl,
        drawdownFloorCents: start - drawdown,
        greenDaysCount: type === "FUNDED" ? randInt(0, 8) : randInt(0, 4),
        consistencyMaxDayPct: randInt(8, 70),
        buffersBuiltCents: type === "FUNDED" ? randInt(0, TIER_CONFIGS[tier].bufferCents) : 0,
        inactivityResetAt: todayISO(-randInt(0, 10)),
        totalWithdrawnCents: type === "FUNDED" ? randInt(0, 400_000) : 0,
        ruleSnapshot: ruleSnapshotForTier(tier),
        fundedAt: type === "FUNDED" ? todayISO(-randInt(10, 90)) : null,
        lastPayoutAt: type === "FUNDED" && chance(0.6) ? todayISO(-randInt(3, 40)) : null,
        preferredFrontEnd: chance(0.4) ? pick(["TRADESEA", "ONYX_TRADER", "DEEPCHARTS", "NINJATRADER", null] as const) : null,
      });
      aId++;
    }
  }
  return accounts;
}

function buildTrades(accounts: Account[]): Trade[] {
  const trades: Trade[] = [];
  let tId = 1;
  for (const acc of accounts) {
    const tradeCount = randInt(8, 30);
    for (let i = 0; i < tradeCount; i++) {
      const sym = pick(SYMBOLS);
      const side = chance(0.55) ? "BUY" : "SELL";
      const size = randInt(1, acc.ruleSnapshot.maxContracts);
      const entry = randInt(400_000, 600_000);
      const exit = entry + randInt(-200, 200) * 100;
      const pnl = (side === "BUY" ? exit - entry : entry - exit) * size;
      const daysAgo = randInt(0, 30);
      const hour = randInt(9, 15);
      const min = randInt(0, 59);
      const d = new Date("2026-05-13T00:00:00Z");
      d.setUTCDate(d.getUTCDate() - daysAgo);
      d.setUTCHours(hour, min, 0);
      const isLiq = chance(0.04);
      trades.push({
        id: `trd_${String(tId).padStart(6, "0")}`,
        accountId: acc.id,
        ts: d.toISOString(),
        instrument: sym,
        side,
        size,
        entryPriceCents: entry,
        exitPriceCents: exit,
        pnlCents: pnl,
        source: isLiq ? "PLATFORM_LIQUIDATION" : "TRADER",
      });
      tId++;
    }
  }
  return trades.sort((a, b) => b.ts.localeCompare(a.ts));
}

function buildPayouts(accounts: Account[]): Payout[] {
  const payouts: Payout[] = [];
  let pId = 1;
  const fundedAccs = accounts.filter((a) => a.type === "FUNDED");
  for (const acc of fundedAccs) {
    const count = randInt(0, 4);
    for (let i = 0; i < count; i++) {
      const status = (() => {
        const r = rand();
        if (r < 0.55) return "DISBURSED" as const;
        if (r < 0.7) return "PROCESSED" as const;
        if (r < 0.83) return "APPROVED" as const;
        if (r < 0.93) return "REQUESTED" as const;
        return "REJECTED" as const;
      })();
      const amount = randInt(50_000, acc.ruleSnapshot.firstPayoutCapCents);
      const requestedAt = todayISO(-randInt(0, 35));
      const allPass = chance(0.7);
      const gate = (key: string): "PASS" | "FAIL" => (allPass || chance(0.7) ? "PASS" : "FAIL");
      payouts.push({
        id: `pay_${String(pId).padStart(5, "0")}`,
        userId: acc.userId,
        accountId: acc.id,
        sequence: i + 1,
        amountCents: amount,
        status,
        requestedAt,
        approvedAt: ["APPROVED", "PROCESSED", "DISBURSED"].includes(status) ? requestedAt : null,
        processedAt: ["PROCESSED", "DISBURSED"].includes(status) ? requestedAt : null,
        disbursedAt: status === "DISBURSED" ? requestedAt : null,
        rejectionReason: status === "REJECTED"
          ? pick(["Consistency rule breach: single day exceeded 50% of cumulative profit", "Buffer not yet built", "KYC verification incomplete", "Insufficient green days"])
          : undefined,
        gateStatus: {
          kyc: gate("kyc"),
          buffer: gate("buffer"),
          greenDays: gate("greenDays"),
          consistency: gate("consistency"),
          fraudFlags: gate("fraudFlags"),
          dailyCap: gate("dailyCap"),
          details: {
            kyc: allPass ? "Verified" : "Veriff verification pending",
            buffer: allPass ? "Buffer built" : "Buffer at 64% of target",
            greenDays: allPass ? "5/5 green days accumulated" : "3/5 green days accumulated",
            consistency: allPass ? "Compliant" : "Day 04/22 = 58% of cumulative profit",
            fraudFlags: "No active flags",
            dailyCap: "Below daily cap",
          },
        },
        method: chance(0.85) ? "BANK" : "CRYPTO",
      });
      pId++;
    }
  }
  return payouts.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

function buildNotifications(users: User[]): NotificationItem[] {
  const kinds = ["SYSTEM", "ALERT", "PASS", "FAIL", "PAYOUT", "LOYALTY"] as const;
  const out: NotificationItem[] = [];
  let nId = 1;
  for (let i = 0; i < 30; i++) {
    const user = pick(users);
    const kind = pick(kinds);
    out.push({
      id: `not_${String(nId).padStart(4, "0")}`,
      userId: user.id,
      kind,
      title: titleFor(kind),
      body: bodyFor(kind),
      createdAt: todayISO(-randInt(0, 14)),
      readAt: chance(0.5) ? todayISO(-randInt(0, 7)) : null,
    });
    nId++;
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function titleFor(kind: NotificationItem["kind"]) {
  switch (kind) {
    case "PASS": return "Evaluation passed";
    case "FAIL": return "Evaluation closed";
    case "PAYOUT": return "Payout disbursed";
    case "LOYALTY": return "Loyalty tier unlocked";
    case "ALERT": return "Account approaching daily loss limit";
    case "SYSTEM": return "Platform maintenance scheduled";
  }
}
function bodyFor(kind: NotificationItem["kind"]) {
  switch (kind) {
    case "PASS": return "Your funded account credentials are on the way. Check your email.";
    case "FAIL": return "Your evaluation hit the EOD drawdown. Use your loyalty credit on the next attempt.";
    case "PAYOUT": return "Your payout of $2,000 has been sent via bank transfer. ETA 2–3 business days.";
    case "LOYALTY": return "You've reached 5 attempts - 5% loyalty discount unlocked on your next evaluation.";
    case "ALERT": return "Within $120 of daily loss limit. Trade carefully.";
    case "SYSTEM": return "Brief maintenance window Sunday 02:00 UTC.";
  }
}

function buildLeaderboard(users: User[]): LeaderboardRow[] {
  const ranked = users.map((u, i) => {
    const totalPnl = randInt(80_000, 4_500_000);
    const trades = randInt(50, 800);
    const winRate = randInt(35, 68);
    const wins = Math.floor((trades * winRate) / 100);
    const losses = trades - wins;
    const avgWin = randInt(8_000, 35_000);
    const avgLoss = randInt(5_000, 25_000);
    const profitFactor = +(((wins * avgWin) / Math.max(1, losses * avgLoss))).toFixed(2);
    return {
      rank: 0,
      userId: u.id,
      initials: u.initials,
      country: u.country,
      countryFlag: u.countryFlag,
      totalPnlCents: totalPnl,
      winRatePct: winRate,
      trades,
      avgWinCents: avgWin,
      avgLossCents: avgLoss,
      profitFactor,
    } satisfies LeaderboardRow;
  });
  ranked.sort((a, b) => b.totalPnlCents - a.totalPnlCents);
  ranked.forEach((r, i) => (r.rank = i + 1));
  return ranked;
}

function buildCalendar(accounts: Account[]): Record<string, CalendarDay[]> {
  const out: Record<string, CalendarDay[]> = {};
  for (const acc of accounts) {
    const days: CalendarDay[] = [];
    for (let d = 89; d >= 0; d--) {
      const date = new Date("2026-05-13T00:00:00Z");
      date.setUTCDate(date.getUTCDate() - d);
      const weekday = date.getUTCDay();
      const isWeekend = weekday === 0 || weekday === 6;
      const pnl = isWeekend ? 0 : randInt(-180_000, 280_000);
      const trades = isWeekend ? 0 : randInt(0, 18);
      const events: CalendarDay["events"] = [];
      if (!isWeekend && chance(0.06)) events.push("FORCE_LIQUIDATION");
      if (chance(0.02)) events.push("HOLIDAY");
      if (chance(0.015)) events.push("MILESTONE_PASS");
      if (chance(0.02)) events.push("MILESTONE_PAYOUT");
      days.push({
        date: date.toISOString().slice(0, 10),
        pnlCents: pnl,
        tradesCount: trades,
        events,
      });
    }
    out[acc.id] = days;
  }
  return out;
}

function buildKpis(): Kpi[] {
  return [
    { label: "Signups Today", value: 47, formatter: "number", delta: 12.5 },
    { label: "Revenue Today", value: 1_287_900, formatter: "currency", delta: 8.2 },
    { label: "Active Evals", value: 1842, formatter: "number", delta: 3.4 },
    { label: "Funded Count", value: 412, formatter: "number", delta: 5.8 },
    { label: "Payouts Today", value: 482_000, formatter: "currency", delta: -2.1 },
    { label: "Total Accounts", value: 5683, formatter: "number" },
    { label: "Total Users", value: 4218, formatter: "number" },
    { label: "Avg Accounts/User", value: "1.35", formatter: "raw" },
    { label: "Avg Pass Time", value: "8.2d", formatter: "raw" },
    { label: "Avg Breach Time", value: "3.1d", formatter: "raw" },
    { label: "Pass Rate", value: 4.8, formatter: "percent" },
    { label: "Pending Withdrawals", value: 28, formatter: "number" },
  ];
}

function buildAudit(users: User[]): AuditEntry[] {
  const actions = [
    "RULE_CHANGE", "PAYOUT_APPROVE", "PAYOUT_REJECT", "USER_SUSPEND", "USER_REINSTATE",
    "CREDIT_ISSUE", "AFFILIATE_APPROVE", "TIER_CONFIG_UPDATE", "ALERT_THRESHOLD_UPDATE",
    "CREDENTIAL_VIEW",
  ];
  const out: AuditEntry[] = [];
  for (let i = 0; i < 100; i++) {
    out.push({
      id: `aud_${String(i + 1).padStart(5, "0")}`,
      ts: todayISO(-randInt(0, 60)),
      adminUserId: `adm_000${randInt(1, 4)}`,
      adminUserName: pick(["Avery Stone", "Jordan Marsh", "Priya Kapoor", "Sam Ortega"]),
      action: pick(actions),
      entity: pick(users).id,
      before: { value: randInt(100, 1000) },
      after: { value: randInt(100, 1000) },
      ip: `${randInt(1, 250)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(0, 255)}`,
      userAgent: "Mozilla/5.0 (admin panel)",
    });
  }
  return out.sort((a, b) => b.ts.localeCompare(a.ts));
}

function buildPurchases(users: User[]): PurchaseRecord[] {
  const out: PurchaseRecord[] = [];
  let id = 1;
  for (const u of users) {
    const n = randInt(1, 6);
    for (let i = 0; i < n; i++) {
      const tier = pick<Tier>(["50K", "100K", "150K"]);
      out.push({
        id: `pur_${String(id++).padStart(5, "0")}`,
        userId: u.id,
        product: `${tier} Evaluation`,
        tier,
        amountCents: TIER_CONFIGS[tier].evaluationFeeCents,
        status: pick(["PAID", "PAID", "PAID", "REFUNDED", "FAILED"] as const),
        ts: todayISO(-randInt(0, 120)),
      });
    }
  }
  return out;
}

function buildAffiliates(): AffiliateRow[] {
  const names = ["FuturesAlpha", "TraderTV", "Scalp Daily", "PropProphet", "MarketMomentum", "GapWizard", "Charts & Coffee", "DeltaEdge"];
  return names.map((name, i) => {
    const monthSignups = randInt(2, 80);
    const tierPct = monthSignups >= 50 ? 25 : monthSignups >= 20 ? 20 : 15;
    return {
      id: `aff_${String(i + 1).padStart(4, "0")}`,
      name,
      email: `${name.toLowerCase().replace(/\s/g, "")}@partner.com`,
      code: `${name.slice(0, 4).toUpperCase()}${i + 1}`,
      tierPct,
      monthSignups,
      totalCommissionCents: randInt(50_000, 4_000_000),
      pendingCommissionCents: randInt(0, 600_000),
      status: chance(0.85) ? "ACTIVE" : pick(["PENDING", "SUSPENDED"] as const),
    } satisfies AffiliateRow;
  });
}

function buildCohortRetention(): CohortRow[] {
  const months = ["2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04"];
  return months.map((m) => ({
    signupMonth: m,
    buckets: ["0-30d", "31-60d", "61-90d", "91-120d", "121d+"].map((b) => ({
      bucket: b,
      valuePct: randInt(2, 18),
      count: randInt(20, 220),
    })),
  }));
}

function buildPayoutCohort(): CohortRow[] {
  const months = ["2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04"];
  return months.map((m) => ({
    signupMonth: m,
    buckets: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7+"].map((b, i) => ({
      bucket: b,
      valuePct: Math.max(0, 35 - i * 5 + randInt(-6, 6)),
      count: Math.max(0, 60 - i * 8 + randInt(-10, 10)),
    })),
  }));
}

function buildForecast(): ForecastBucket[] {
  return [
    { horizonDays: 7, forecastCents: 1_240_000, low: 980_000, high: 1_510_000 },
    { horizonDays: 30, forecastCents: 5_180_000, low: 4_300_000, high: 6_050_000 },
    { horizonDays: 90, forecastCents: 15_620_000, low: 13_100_000, high: 18_250_000 },
  ];
}

function buildPayoutExposure(): PayoutExposure[] {
  const out: PayoutExposure[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date("2026-05-13T00:00:00Z");
    date.setUTCDate(date.getUTCDate() - d);
    out.push({
      date: date.toISOString().slice(0, 10),
      approvedCents: randInt(200_000, 1_500_000),
      pendingCents: randInt(100_000, 600_000),
      dailyCapCents: 5_000_000,
    });
  }
  return out;
}

function buildAdminUsers(): AdminUser[] {
  return [
    { id: "adm_0001", name: "Avery Stone",  email: "avery@genone.example",  initials: "AS", role: "SUPER_ADMIN",       status: "ACTIVE",    createdAt: todayISO(-220), lastLoginAt: todayISO(-0), totpEnabled: true  },
    { id: "adm_0002", name: "Jordan Marsh", email: "jordan@genone.example", initials: "JM", role: "OPS",                status: "ACTIVE",    createdAt: todayISO(-180), lastLoginAt: todayISO(-1), totpEnabled: true  },
    { id: "adm_0003", name: "Priya Kapoor", email: "priya@genone.example",  initials: "PK", role: "AFFILIATE_MANAGER",  status: "ACTIVE",    createdAt: todayISO(-90),  lastLoginAt: todayISO(-2), totpEnabled: true  },
    { id: "adm_0004", name: "Sam Ortega",   email: "sam@genone.example",    initials: "SO", role: "READ_ONLY",          status: "ACTIVE",    createdAt: todayISO(-60),  lastLoginAt: todayISO(-3), totpEnabled: false },
    { id: "adm_0005", name: "Riley Voss",   email: "riley@genone.example",  initials: "RV", role: "OPS",                status: "SUSPENDED", createdAt: todayISO(-160), lastLoginAt: todayISO(-30), totpEnabled: true  },
    { id: "adm_0006", name: "Casey Lin",    email: "casey@genone.example",  initials: "CL", role: "OPS",                status: "INVITED",   createdAt: todayISO(-2),                                 totpEnabled: false },
  ];
}

function buildSubscriptionProducts(): SubscriptionProduct[] {
  return [
    { id: "sub_prod_depth",   name: "Market Depth Pro",  description: "Level-2 order book + DOM heatmap (CME). Streaming via Rithmic.", priceCents: 5_900,  cadence: "MONTHLY", active: true },
    { id: "sub_prod_signals", name: "Signal Lab",        description: "Daily levels, key events, COT report digest.",                  priceCents: 1_900,  cadence: "MONTHLY", active: true },
    { id: "sub_prod_journal", name: "Trade Journal+",    description: "Automated journaling, replay, AI-assisted reviews (beta).",     priceCents: 2_900,  cadence: "MONTHLY", active: false },
  ];
}

function buildSubscriptions(users: User[], products: SubscriptionProduct[]): Subscription[] {
  const out: Subscription[] = [];
  let id = 1;
  for (const u of users) {
    if (!chance(0.45)) continue;
    const n = randInt(1, 2);
    for (let i = 0; i < n; i++) {
      const p = pick(products.filter((pr) => pr.active));
      const status = (() => {
        const r = rand();
        if (r < 0.7) return "ACTIVE" as const;
        if (r < 0.82) return "PAST_DUE" as const;
        if (r < 0.92) return "CANCELLED" as const;
        return "SUSPENDED" as const;
      })();
      const startedAt = todayISO(-randInt(15, 240));
      const nextBilling = todayISO(randInt(0, 28));
      out.push({
        id: `sub_${String(id++).padStart(5, "0")}`,
        userId: u.id,
        productId: p.id,
        productName: p.name,
        priceCents: p.priceCents,
        status,
        startedAt,
        nextBillingAt: status === "CANCELLED" ? startedAt : nextBilling,
        cancelledAt: status === "CANCELLED" ? todayISO(-randInt(0, 30)) : null,
        failedAttempts: status === "PAST_DUE" ? randInt(1, 3) : 0,
      });
    }
  }
  return out;
}

function buildSubscriptionAttempts(subs: Subscription[]): SubscriptionBillingAttempt[] {
  const out: SubscriptionBillingAttempt[] = [];
  let id = 1;
  for (const s of subs) {
    const n = randInt(1, 6);
    for (let i = 0; i < n; i++) {
      const failed = s.status === "PAST_DUE" && i === n - 1;
      out.push({
        id: `sba_${String(id++).padStart(5, "0")}`,
        subscriptionId: s.id,
        ts: todayISO(-randInt(0, 90)),
        amountCents: s.priceCents,
        result: failed ? "FAILED" : "SUCCESS",
        failureReason: failed ? pick(["Card declined", "Insufficient funds", "Card expired"]) : undefined,
      });
    }
  }
  return out;
}

function buildSymbolAnalytics(): SymbolAnalyticsRow[] {
  return SYMBOLS.map((s) => {
    const totalTrades = randInt(400, 3500);
    const totalProfit = randInt(800_000, 8_000_000);
    const totalLoss = randInt(400_000, 7_000_000);
    return {
      symbol: s,
      totalTrades,
      totalProfitCents: totalProfit,
      totalLossCents: totalLoss,
      avgProfitCents: Math.floor(totalProfit / Math.max(1, Math.floor(totalTrades * 0.55))),
      avgLossCents: Math.floor(totalLoss / Math.max(1, Math.floor(totalTrades * 0.45))),
      lossToProfitRatio: +(totalLoss / totalProfit).toFixed(2),
    };
  });
}

// ---- Aggregate & export ----
const usersData = buildUsers();
const accountsData = buildAccounts(usersData);
const tradesData = buildTrades(accountsData);
const payoutsData = buildPayouts(accountsData);
const notificationsData = buildNotifications(usersData);
const leaderboardData = buildLeaderboard(usersData);
const calendarData = buildCalendar(accountsData);
const kpiData = buildKpis();
const auditData = buildAudit(usersData);
const purchasesData = buildPurchases(usersData);
const affiliatesData = buildAffiliates();
const cohortRetentionData = buildCohortRetention();
const payoutCohortData = buildPayoutCohort();
const forecastData = buildForecast();
const payoutExposureData = buildPayoutExposure();
const symbolAnalyticsData = buildSymbolAnalytics();
const adminUsersData = buildAdminUsers();
const subscriptionProductsData = buildSubscriptionProducts();
const subscriptionsData = buildSubscriptions(usersData, subscriptionProductsData);
const subscriptionAttemptsData = buildSubscriptionAttempts(subscriptionsData);

export const users: User[] = usersData;
export const accounts: Account[] = accountsData;
export const trades: Trade[] = tradesData;
export const payouts: Payout[] = payoutsData;
export const notifications: NotificationItem[] = notificationsData;
export const leaderboard: LeaderboardRow[] = leaderboardData;
export const calendar: Record<string, CalendarDay[]> = calendarData;
export const kpis: Kpi[] = kpiData;
export const audit: AuditEntry[] = auditData;
export const purchases: PurchaseRecord[] = purchasesData;
export const affiliates: AffiliateRow[] = affiliatesData;
export const cohortRetention: CohortRow[] = cohortRetentionData;
export const payoutCohort: CohortRow[] = payoutCohortData;
export const forecast: ForecastBucket[] = forecastData;
export const payoutExposure: PayoutExposure[] = payoutExposureData;
export const symbolAnalytics: SymbolAnalyticsRow[] = symbolAnalyticsData;
export const tierConfigs: TierConfig[] = TIERS;
export const adminUsers: AdminUser[] = adminUsersData;
export const subscriptionProducts: SubscriptionProduct[] = subscriptionProductsData;
export const subscriptions: Subscription[] = subscriptionsData;
export const subscriptionAttempts: SubscriptionBillingAttempt[] = subscriptionAttemptsData;

export const adminUserSummaries: AdminUserSummary[] = users.map((u) => {
  const userAccounts = accounts.filter((a) => a.userId === u.id);
  const userPayouts = payouts.filter((p) => p.userId === u.id);
  const userPurchases = purchases.filter((p) => p.userId === u.id);
  return {
    ...u,
    accountsCount: userAccounts.length,
    totalSpentCents: userPurchases.reduce((s, p) => s + (p.status === "PAID" ? p.amountCents : 0), 0),
    totalPayoutCents: userPayouts.reduce((s, p) => s + (p.status === "DISBURSED" ? p.amountCents : 0), 0),
    lastLoginAt: todayISO(-randInt(0, 14)),
  };
});

// ---- Mock trade stream for WS simulation ----
export function* tradeStream(accountId: string): Generator<Trade> {
  let i = 1;
  while (true) {
    const sym = pick(SYMBOLS);
    const side = chance(0.5) ? "BUY" : "SELL";
    const entry = randInt(400_000, 600_000);
    const exit = entry + randInt(-200, 200) * 100;
    const size = randInt(1, 3);
    const pnl = (side === "BUY" ? exit - entry : entry - exit) * size;
    yield {
      id: `stream_${Date.now()}_${i++}`,
      accountId,
      ts: new Date().toISOString(),
      instrument: sym,
      side,
      size,
      entryPriceCents: entry,
      exitPriceCents: exit,
      pnlCents: pnl,
      source: "TRADER",
    };
  }
}

export const TIER_CONFIGS_BY_KEY = TIER_CONFIGS;
