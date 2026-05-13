// Writes a JSON snapshot of every generated dataset under ./json.
// Run: pnpm --filter @genone/mock-data snapshot
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as data from "../src/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, "..", "json");
await fs.mkdir(out, { recursive: true });

const datasets: Array<[string, unknown]> = [
  ["users", data.users],
  ["accounts", data.accounts],
  ["trades", data.trades],
  ["payouts", data.payouts],
  ["notifications", data.notifications],
  ["leaderboard", data.leaderboard],
  ["calendar", data.calendar],
  ["kpi-metrics", data.kpis],
  ["audit-log", data.audit],
  ["purchases", data.purchases],
  ["affiliates", data.affiliates],
  ["cohort-retention", data.cohortRetention],
  ["payout-cohort", data.payoutCohort],
  ["forecast", data.forecast],
  ["payout-exposure", data.payoutExposure],
  ["symbol-analytics", data.symbolAnalytics],
  ["tiers", data.tierConfigs],
  ["admin-users", data.adminUsers],
  ["subscription-products", data.subscriptionProducts],
  ["subscriptions", data.subscriptions],
  ["subscription-attempts", data.subscriptionAttempts],
];

for (const [name, payload] of datasets) {
  await fs.writeFile(path.join(out, `${name}.json`), JSON.stringify(payload, null, 2), "utf8");
  console.log(`wrote ${name}.json`);
}
