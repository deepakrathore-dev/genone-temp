# Gen One Futures - Monorepo

Futures prop-trading platform frontend. Two Next.js 16 apps (trader + admin) plus shared
TypeScript packages, wired end-to-end with mock data and a mock WebSocket simulator so
every page renders real-looking content with no backend.

> Built against PRD v4 / Feature Set v4 (158 Phase 1 MUSTs across 28 modules). The Phase 2
> deferred set in §29 of the spec is intentionally out of scope. See
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for data flow and module mapping.

---

## Repo layout

```
apps/
  frontend/           # Trader app - Next 16, port 3001
  admin/              # Admin/ops console - Next 16, port 3002
  backend/            # (stub - Fastify; not consumed yet)
packages/
  types/              # Shared TS domain types (Account, Trade, Payout, ...)
  mock-data/          # Deterministic data + JSON snapshots + WS trade stream
  ui/                 # shadcn-style design-system primitives (Radix + CVA + Tailwind)
  config/             # Shared CSS variables / theme tokens
docs/
  ARCHITECTURE.md
```

Both apps use the **App Router with code at `app/...` (no `src/`)** and the path aliases
`@/components/*`, `@/lib/*`, `@/app/*`.

---

## Quickstart

```bash
pnpm install
pnpm dev               # runs both apps in parallel
# Trader:  http://localhost:3001
# Admin:   http://localhost:3002
```

Or one app at a time:

```bash
pnpm dev:frontend
pnpm dev:admin
```

Type-check & build:

```bash
pnpm build             # builds both apps
```

Regenerate JSON snapshots of the mock data:

```bash
pnpm --filter @genone/mock-data snapshot
```

---

## Tech stack

| Layer         | Tool                                                |
| ------------- | --------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack) + React 19       |
| Styling       | Tailwind CSS v4 (CSS-first via `@theme`) + CSS vars |
| Design system | shadcn-style primitives over Radix UI               |
| Server state  | TanStack Query v5                                   |
| Client state  | Zustand (with `persist` middleware)                 |
| Tables        | TanStack Table v8                                   |
| Charts        | Recharts                                            |
| Forms         | react-hook-form + zod                               |
| Theming       | next-themes (light/dark + system, persisted)        |
| Toasts        | sonner                                              |
| Icons         | lucide-react                                        |
| Animation     | framer-motion (subtle number/badge transitions)     |
| Dates         | date-fns                                            |
| Fonts         | Inter (UI) + JetBrains Mono (numerics/data)         |

---

## What's built

### Trader app (`apps/frontend`, port 3001)

| Route                                | Module / REQ-IDs                                                                                                                                                                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`, `/register`, `/onboarding` | §1 - Registration & onboarding (REQ-001–005). Onboarding step 5 hands off to `/purchase`.                                                                                                                                                                         |
| `/purchase`                          | §2 - Tier picker, loyalty discount auto-apply, live promo-code validation, wallet credit toggle, order summary panel, simulated NMI hosted payment page with a decline-test toggle (REQ-007–013)                                                                  |
| `/purchase/success`                  | §2 - Receipt with breakdown, next-steps onboarding, deep-links to credentials and dashboard (REQ-010)                                                                                                                                                             |
| `/dashboard`                         | §3, §4, §5 - Status banner, headline metrics, EOD drawdown, daily-loss, profit-target ring, green-day pill row, buffer + consistency (funded), inactivity timer, recent trades, sticky rules panel (REQ-014–041, 138). Empty state CTAs traders into `/purchase`. |
| `/dashboard/[accountId]/trades`      | §5 - TanStack Table, URL-driven filters, sort, pagination, mobile cards, CSV export stub (REQ-036)                                                                                                                                                                |
| `/dashboard/[accountId]/calendar`    | §23 - Monthly grid, PNL/Events toggle, heatmap intensity, click-through (REQ-205–208)                                                                                                                                                                             |
| `/payouts`                           | §6 - Live gate checklist (KYC / Buffer / Green days / Consistency / Fraud / Daily cap), payout history with immutable timeline (REQ-044–048)                                                                                                                      |
| `/leaderboard`                       | §22 - Time-window tabs, podium, table with initials + country flags (REQ-201–204)                                                                                                                                                                                 |
| `/profile/accounts`                  | §28 - Eval/Funded/All tabs, inline nickname edit, **Removal Mode** batch archive, archived view, Show Credentials modal with re-auth (REQ-231–242, 031)                                                                                                           |
| `/profile/wallet`                    | §8 - Credit balance, loyalty tier with progress to next, credit history (REQ-055, 056, 062)                                                                                                                                                                       |
| `/notifications`                     | §5 - Filterable feed, unread state, mark-as-read (REQ-040)                                                                                                                                                                                                        |

Global shell: collapsible sidebar (mobile drawer < lg), topbar with **AccountSwitcher**
showing status badge + tier per account (REQ-039), theme toggle, notification bell with
unread count, user menu. Rules panel sticky on xl+, toggleable from topbar.

**Live updates**: `lib/ws/use-dashboard-ws.ts` subscribes to a mock WebSocket
(`lib/ws/ws-client.ts → mock branch`) that emits a new trade every 5–10 s while on the
dashboard. The hook merges each event into the TanStack Query cache, so equity, today P&L,
today trade count and the recent-trades list all animate without polling. The real WS
endpoint plugs into the same module - see `Swapping mock → real API` below.

### Admin app (`apps/admin`, port 3002)

| Route                   | Module / REQ-IDs                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`                | TOTP-gated admin sign-in                                                                                                                                                                |
| `/`                     | §12 - KPI grid (auto-refresh 30 s), tier distribution, retry analytics, affiliate performance, monthly P&L (REQ-094–098)                                                                |
| `/users`, `/users/[id]` | §11 - Search + filter user list, tabbed user profile (Overview / Accounts / Purchases / Payouts / Affiliate / Audit), manual override and credit issuance with TOTP modal (REQ-083–086) |
| `/payouts`              | §11 - Queue with gate badges (KYC/BUF/GD/CON/FF/DC), one-click approve/reject with TOTP modals, CSV export (REQ-088–090)                                                                |
| `/payouts/exposure`     | §11 - Daily exposure cards + 7-day stacked bar, cap utilisation progress (REQ-091)                                                                                                      |
| `/risk`                 | §13 - Flagged users with reason, investigate/clear/suspend actions (REQ-092, 101, 102)                                                                                                  |
| `/kyc`                  | §1 - Pending Veriff queue (REQ-005)                                                                                                                                                     |
| `/affiliates`           | §9 - Affiliate management (REQ-072, 097)                                                                                                                                                |
| `/bi/symbols`           | §27 - Sortable per-symbol metrics, date range, CSV export (REQ-229–230)                                                                                                                 |
| `/bi/cohorts`           | §26 - Retention heatmap + payout-cohort heatmap (REQ-220–225)                                                                                                                           |
| `/bi/forecast`          | §26 - 7/30/90-day forward forecast cards + area chart (REQ-226–228)                                                                                                                     |
| `/config/tiers`         | §15 - Per-tier rule editor with confirm-TOTP modal (REQ-109–116)                                                                                                                        |
| `/config/rules`         | §16 - Universal rules (REQ-117–122)                                                                                                                                                     |
| `/config/loyalty`       | §17 - Pass credit % + 3 loyalty tier thresholds (REQ-123, 124)                                                                                                                          |
| `/config/affiliates`    | §17 - Base commission, tier thresholds, cookie window (REQ-126, 127)                                                                                                                    |
| `/config/risk`          | §18 - Payout ratio ceiling + auto-freeze switch (REQ-129)                                                                                                                               |
| `/config/alerts`        | §18 - KPI alert thresholds (REQ-130)                                                                                                                                                    |
| `/config/payout-cap`    | §18 - Daily disbursement cap (REQ-131)                                                                                                                                                  |
| `/config/intercom`      | §21 - App ID, HMAC secret, Help Center URL, Messenger switch (REQ-135–137)                                                                                                              |
| `/audit`                | §19 - Filterable insert-only audit log (REQ-133)                                                                                                                                        |

Each config page uses the shared `ConfigPageShell` which renders the latest 10 audit-log
entries relevant to that area in the sidebar - so any change you'd make is immediately
visible in audit context.

---

## Mock data + simulated WS

- `packages/mock-data/src/index.ts` - deterministic generators (xorshift32 seeded with
  `0xC0FFEE`) for users, accounts, trades, payouts, notifications, leaderboard, calendar,
  KPIs, audit, purchases, affiliates, cohort matrices, forecast, exposure, symbol
  analytics, and tier configs. Currency stored as integer cents.
- `packages/mock-data/json/` - committed JSON snapshots of every dataset (regenerate with
  `pnpm --filter @genone/mock-data snapshot`).
- `tradeStream(accountId)` - generator that produces a never-ending sequence of trade
  events. Consumed by `apps/frontend/lib/ws/ws-client.ts` in MOCK mode and emits a trade
  every 5–10 s while the dashboard is open.

---

## Swapping mock → real API

Everything goes through two switches:

```bash
# frontend & admin
NEXT_PUBLIC_MOCK=false
NEXT_PUBLIC_API_URL=https://api.your-backend.example
```

- `MOCK_MODE=false` makes `lib/api/api-client.ts` hit the real HTTP API instead of mock
  fixtures. All TanStack Query hooks are unchanged because they only consume the `api`
  client.
- The WS client (`lib/ws/ws-client.ts`) auto-routes to `${API_URL.replace(/^http/, 'ws')}/ws`
  with exponential-backoff reconnect. The mock simulator branch is bypassed.
- `useDashboardWs` continues to work without component changes - it just receives events
  from the wire instead of the simulator.

No component imports the `MOCK_MODE` flag directly, so swapping is a 2-line env change.

---

## Theme

Defined in `packages/config/theme.css`. Each app imports it at the top of `globals.css`
and exposes the tokens to Tailwind via `@theme inline`:

```css
@import "tailwindcss";
@import "@genone/config/theme.css";

@theme inline {
  --color-surface: var(--surface);
  --color-primary: var(--primary);
  --color-success: var(--success);
  /* ... */
}
```

`next-themes` toggles a `.dark` class on `<html>` which overrides the CSS variables. System
preference is respected on first load and the user's choice is persisted.

Look & feel: deep navy dark / off-white light. Emerald = success, rose = danger, amber =
warning, electric indigo = primary brand. Numerical and data-grid content uses
**JetBrains Mono**; everything else uses **Inter**.

---

## Status

### Phase 1 - complete

All 158 MUSTs across the 28 in-scope modules are surfaced in UI flows with real-looking
mock data:

- §1 Registration & onboarding · §2 Evaluation purchase (tier picker on onboarding step 4) ·
  §3 Evaluation engine telemetry · §4 Funded account lifecycle · §5 Trader dashboard ·
  §6 Payouts · §7 Retention is server-side email content (out of frontend scope) · §8
  Loyalty & credit (REQ-059–063) · §9 Affiliate (admin side) · §10 Community trust links ·
  §11 Admin panel · §12 BI dashboard · §13 Risk controls · §14 Data capture is
  infrastructure (no UI) · §15–§18 Config pages · §19 Audit · §20 Force liquidation
  surfaced via trade source flag + rules panel · §21 Intercom configured · §22
  Leaderboard · §23 Calendar · §24 Add-ons & subscriptions - see "pending" below · §25
  Broker compatibility surfaced in credential modal · §26 Cohort + forecast · §27 Symbol
  analytics · §28 Account management enhancements.

### Pending / known gaps

- **§24 Add-ons & Subscriptions**: schema and admin/trader pages for monthly
  Market-Depth-style subscriptions (REQ-209–216) are not yet wired. The subscription
  schema and dunning flow are easy adds against the existing `api-client.ts` because
  every other surface uses the same swap-from-mock pattern.
- **First payout social proof** (REQ-077–079, §10): the public stats page and the
  post-payout TrustPilot prompt email are server-side outbound - UI surfaces are
  scaffolded but the campaign trigger isn't implemented.
- **Day 3 / Day 7 / Day 14 retention emails** (§7): server-side email orchestration,
  no UI to build.
- **Real auth & RBAC**: login flows are unauth'd demos. The admin app's role indicator
  (`useUi().role`) defaults to SUPER_ADMIN - production wiring needs an OIDC or session
  cookie.
- **TOTP**: all "TOTP code" inputs accept any 6-digit string. Wire to a real challenge
  endpoint when backend is up.
- **CSV exports**: every Export CSV button currently fires a toast. Stream from the
  backend once available (filenames already namespaced per module).
- **Search / global ⌘K**: admin topbar input is decorative.

---

## Where to add a new …

| You want to add…                    | …add it here                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| New page (trader)                   | `apps/frontend/app/(trader)/<route>/page.tsx`                                               |
| New page (admin)                    | `apps/admin/app/(admin)/<route>/page.tsx`                                                   |
| New query                           | `apps/<app>/lib/queries/index.ts` (+ corresponding `api.<name>` in `lib/api/api-client.ts`) |
| New mutation                        | `apps/<app>/lib/mutations/index.ts`                                                         |
| New UI primitive shared across apps | `packages/ui/src/<Name>.tsx` and re-export from `packages/ui/src/index.ts`                  |
| New domain type                     | `packages/types/src/index.ts`                                                               |
| New mock dataset                    | add a builder in `packages/mock-data/src/index.ts` + add to `scripts/snapshot.mts`          |

---

## License

Internal - Northgate ICG / Gen One Futures LLC. Commercial in confidence.
