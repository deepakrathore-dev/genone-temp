/**
 * Plain-English explanations for every tier-rule field. One source of truth used
 * across the admin tier configuration form and the trader-facing rules surfaces.
 * Each entry has a short title and a 2-3 sentence body shown inside an InfoTip
 * popover.
 */
export interface RuleHelpEntry {
  title: string;
  body: string;
}

export const RULE_HELP = {
  evaluationFee: {
    title: "Evaluation fee",
    body: "One-time fee the trader pays to take this evaluation. Charged through NMI's hosted page so card data never touches Gen One infrastructure.",
  },
  profitTarget: {
    title: "Profit target",
    body: "How much profit the trader must accumulate to pass the evaluation. Hit this without breaching any rule and the funded account is provisioned automatically.",
  },
  drawdown: {
    title: "EOD drawdown (fixed)",
    body: "A fixed floor set when the account is created as starting balance minus the drawdown amount. The floor never moves, even after the trader makes profit. Crossing it at end of day fails the account.",
  },
  dailyLoss: {
    title: "Daily loss (soft)",
    body: "Maximum allowed loss in a single trading day. Breaching it locks the account out of trading for the rest of the day. The account is not failed; trading resumes at the next session open (6 PM ET, Sunday through Thursday).",
  },
  maxContracts: {
    title: "Max contracts",
    body: "Largest position size allowed on a single order. Orders for more than this many minis are rejected at order entry. Keeps risk per trade scaled to the account size.",
  },
  buffer: {
    title: "Buffer",
    body: "Funded accounts only. The trader must accumulate this much profit before their first payout request is approved. The default formula is drawdown plus $100. Ensures the firm recoups its drawdown exposure before paying out.",
  },
  firstPayoutCap: {
    title: "First payout cap",
    body: "Hard limit on the trader's very first payout request from a funded account. Subsequent payouts have no cap. Prevents one strong day from triggering an oversized first wire.",
  },
  inactivity: {
    title: "Inactivity window",
    body: "If the trader places no trades for this many calendar days, the evaluation auto-closes and a re-engagement email is sent. The window resets every time the trader places a trade.",
  },
  greenDayThreshold: {
    title: "Green day threshold",
    body: "A day counts as a green day only if its profit meets or exceeds this amount. Green days accumulate toward the payout gate.",
  },
  greenDaysRequired: {
    title: "Green days required",
    body: "How many green days a funded trader must accumulate since their last payout before they can request another. Stops a single lucky day from triggering a payout.",
  },
  consistency: {
    title: "Consistency rule",
    body: "No single trading day may account for more than this percentage of cumulative profit since the last payout. Prevents lottery-style trading.",
  },
  profitSplit: {
    title: "Profit split",
    body: "Trader's share of profit at payout. The firm keeps the rest. The default split is 80/20.",
  },
  maxAccounts: {
    title: "Max accounts per trader",
    body: "A single identity (matched via email, payment source, IP cluster, and device fingerprint) can hold at most this many funded accounts.",
  },
  scaleThreshold: {
    title: "Scale rule",
    body: "Once cumulative withdrawals reach this amount, the trader is automatically upgraded to the next tier at no cost. Uses withdrawals (not profit) because they're a stronger signal of consistent trading.",
  },
  forceLiquidation: {
    title: "Daily force liquidation",
    body: "All open positions are force-closed every trading day at 4:00 PM ET. Eliminates overnight gap risk against the EOD drawdown rule. Liquidation trades appear in history with a distinct source flag.",
  },
  payoutRatio: {
    title: "Payout ratio ceiling",
    body: "If cumulative payouts exceed this percentage of revenue, all automatic approvals freeze until an administrator intervenes. A hard stop that protects the business from systemic risk.",
  },
  dailyPayoutCap: {
    title: "Daily payout cap",
    body: "Maximum total disbursement allowed per calendar day across all funded accounts. Further payouts auto-lock until the next day rolls over.",
  },
} as const satisfies Record<string, RuleHelpEntry>;

export type RuleHelpKey = keyof typeof RULE_HELP;
