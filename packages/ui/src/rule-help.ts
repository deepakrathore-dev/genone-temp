/**
 * Plain-English explanations for every tier-rule field. One source of truth used
 * by:
 *   • Admin /config/tiers form fields
 *   • Trader purchase page tier picker
 *   • Trader dashboard Rules Panel
 *
 * Keep these short — 2-3 sentences max. They appear inside an InfoTip popover.
 */
export interface RuleHelpEntry {
  title: string;
  body: string;
  reqId?: string;
}

export const RULE_HELP = {
  evaluationFee: {
    title: "Evaluation fee",
    body: "One-time fee the trader pays to take this evaluation. Direct revenue per signup. Paid via NMI hosted page — card data never touches our infrastructure.",
    reqId: "REQ-109",
  },
  profitTarget: {
    title: "Profit target",
    body: "How much P&L the trader must accumulate to pass the evaluation. Hit this without breaching any rule and the funded account auto-provisions.",
    reqId: "REQ-110",
  },
  drawdown: {
    title: "EOD drawdown (fixed)",
    body: "A fixed floor set at account creation as (starting balance − drawdown). Never moves — even after the trader makes profit. Crossing it at end-of-day fails the account permanently. This is what powers our 'your wins are protected' position.",
    reqId: "REQ-111",
  },
  dailyLoss: {
    title: "Daily loss (SOFT)",
    body: "Max loss allowed in a single trading day. Breaching it locks the account out of trading for the rest of the day — the account is NOT failed. Trading resumes at the next session open (6 PM ET Sun-Thu).",
    reqId: "REQ-112",
  },
  maxContracts: {
    title: "Max contracts",
    body: "Largest position size allowed on a single order. Orders for more than this many minis are rejected at order entry by the broker. Keeps risk-per-trade scaled to account size.",
    reqId: "REQ-113",
  },
  buffer: {
    title: "Buffer",
    body: "Funded accounts only. The trader must build this much cumulative profit before their first payout request will be approved. Default formula is drawdown + $100. Guarantees the firm recoups its drawdown exposure before paying out.",
    reqId: "REQ-114, REQ-026",
  },
  firstPayoutCap: {
    title: "First payout cap",
    body: "Hard limit on the very first payout request from a funded account. Subsequent payouts have no cap. Stops one big winning day from triggering an oversized first wire.",
    reqId: "REQ-115, REQ-030",
  },
  inactivity: {
    title: "Inactivity window",
    body: "If the trader places zero trades for this many calendar days, the evaluation auto-closes and a re-engagement email goes out. Resets every time the trader places a trade.",
    reqId: "REQ-116, REQ-022",
  },
  greenDayThreshold: {
    title: "Green day threshold",
    body: "A day counts as a 'green day' only if its P&L meets or exceeds this amount. Green days accumulate toward the payout gate. Default $200.",
    reqId: "REQ-117, REQ-028",
  },
  greenDaysRequired: {
    title: "Green days required",
    body: "How many green days a funded trader must accumulate since their last payout before they can request another one. Stops one lucky day from triggering a payout.",
    reqId: "REQ-119, REQ-029",
  },
  consistency: {
    title: "Consistency rule",
    body: "No single trading day may account for more than this percentage of cumulative profit since the last payout. Prevents 'lottery-ticket' trading. Default 50%.",
    reqId: "REQ-118, REQ-027",
  },
  profitSplit: {
    title: "Profit split",
    body: "Trader keeps this percentage of profit at payout. The firm keeps the rest. Default 80/20. Spec also has a 90/10 candidate Gen One can confirm before kick-off.",
    reqId: "REQ-120",
  },
  maxAccounts: {
    title: "Max accounts per user",
    body: "A single identity (detected via email, payment source, IP cluster, device fingerprint) can hold at most this many funded accounts. Default 10.",
    reqId: "REQ-121, REQ-031",
  },
  scaleThreshold: {
    title: "Scale rule threshold",
    body: "Once cumulative withdrawn (not just profit) reaches this amount, the trader is auto-upgraded to the next tier for free. Withdrawn — not profit — because it's a stronger signal of genuine trading success.",
    reqId: "REQ-122, REQ-033",
  },
  forceLiquidation: {
    title: "Daily force liquidation",
    body: "All open positions are force-closed every trading day at 4:00 PM ET via Rithmic order API. Eliminates overnight gap risk against the EOD drawdown rule. Liquidation trades appear in trade history with a distinct source flag.",
    reqId: "REQ-138",
  },
  payoutRatio: {
    title: "Payout ratio ceiling",
    body: "If cumulative payouts exceed this percentage of revenue, all auto-approvals freeze until an admin intervenes. A hard stop that protects the business from systemic risk. Default 15%.",
    reqId: "REQ-129",
  },
  dailyPayoutCap: {
    title: "Daily payout cap",
    body: "Maximum total disbursement allowed per calendar day across all funded accounts. Auto-locks further payouts beyond this until the next day rolls over.",
    reqId: "REQ-131",
  },
} as const satisfies Record<string, RuleHelpEntry>;

export type RuleHelpKey = keyof typeof RULE_HELP;
