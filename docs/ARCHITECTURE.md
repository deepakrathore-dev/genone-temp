# Gen One - Frontend Architecture

This is the operating model for the two Next.js apps and the shared packages. The goal
is to make every piece swappable: any mock can become a real API call by editing exactly
one file, and the UI never knows which it is.

## Data flow

```
┌────────────────────────────────────────────────────────────────────┐
│                            React component                          │
│   (uses TanStack Query hooks for server data, Zustand for client    │
│    UI state - never mixes them)                                     │
└─────────────┬───────────────────────────────────┬───────────────────┘
              │                                   │
              ▼                                   ▼
   ┌──────────────────────┐            ┌──────────────────────┐
   │  TanStack Query      │            │  Zustand store       │
   │  (server state)      │            │  (client UI state)   │
   │  • useAccountState   │            │  • selectedAccount   │
   │  • useTrades         │            │  • ui (sidebar,      │
   │  • usePayouts        │            │     rules panel,     │
   │  • useKpis ...       │            │     removal mode)    │
   └──────┬───────────────┘            └──────────────────────┘
          │
          ▼
   ┌──────────────────────┐
   │  lib/api/api-client  │   ◄── single switch:
   │  • MOCK_MODE branch  │       NEXT_PUBLIC_MOCK=false
   │  • real-fetch branch │       NEXT_PUBLIC_API_URL=<…>
   └─────┬────────────────┘
         │
   ┌─────┴──────────┐
   │                │
   ▼                ▼
 mock          fetch(API_URL/…)
 fixtures      with credentials
 (deterministic
  generators in
  @genone/mock-data)
```

For live updates the dashboard also subscribes via `lib/ws/use-dashboard-ws.ts`:

```
WS frame → use-dashboard-ws → qc.setQueryData([account-state, id], merge)
                            → qc.setQueryData([trades, id, {}], prepend)
```

The component never sees the WS event - it just re-renders because the query cache
changed. The fallback `refetchInterval: 60_000` covers the case where the WS dies, so the
UI is _always_ eventually consistent.

## Why this split

- **Server data lives only in TanStack Query**. We never copy it to Zustand. That keeps
  invalidation centralised and avoids fighting two sources of truth.
- **Zustand owns UI choices**: which account is active, whether the sidebar is collapsed,
  removal mode, etc. Persisted to localStorage via the `persist` middleware so the layout
  survives reloads.
- **The api-client is the only seam where mock branches**. Components, hooks, mutations
  and stores have zero awareness of whether they're talking to fixtures or a real backend.

## Mock subsystem

`packages/mock-data` is the source of truth in mock mode:

- `seed.ts` - xorshift32 PRNG (deterministic, seeded with `0xC0FFEE`)
- `src/index.ts` - builders for users, accounts, trades, payouts, notifications,
  leaderboard, calendar, KPIs, audit, purchases, affiliates, cohort matrices, forecast,
  exposure, symbol analytics, tier configs
- `scripts/snapshot.mts` - writes the full dataset to `json/*.json` so it can be
  inspected, diffed, or consumed by external tooling
- `tradeStream(accountId)` - generator used by the mock WS client to emit one trade every
  5–10 s

Every amount is stored as integer cents to avoid float drift; the UI uses
`formatCurrency(cents)` from `@genone/ui`.

## Tailwind v4 + theme tokens

Theme tokens live in `packages/config/theme.css`. They're a flat list of CSS variables
defined twice - once on `:root` (light) and once on `.dark` (dark). Both apps wire them
into Tailwind v4 via `@theme inline` in their own `globals.css`:

```css
@theme inline {
  --color-surface: var(--surface);
  --color-primary: var(--primary);
  --color-success: var(--success);
  ...
}
```

This means a component can write `bg-surface text-primary` and the value is whatever the
current theme says - no JS toggle, no `dark:` variant needed for primitives. The `dark:`
variant is reserved for cases where the light/dark contrast needs more than just a token
swap.

`next-themes` is the toggler. It writes `class="dark"` onto `<html>`. System preference
is the default; the user's manual override is persisted as `genone-theme` / `genone-admin-theme`.

## Mobile responsiveness

Audited at 375 px (iPhone SE). Strategy:

- Sidebars collapse into a hamburger drawer below `lg` (1024 px).
- Tables collapse into card lists below `md` (768 px). Trades, payouts, accounts, and
  leaderboard all do this.
- Calendar grid switches to a vertical day-by-day list below `sm` (640 px).
- Dialogs use `max-w-lg` with `max-h-[92vh]` and centred layout; on small viewports they
  end up effectively full-width with 16 px gutters via Radix's default styles.
- Touch targets are ≥ 36 px (most buttons are 36–44 px, `size="icon"` is 36 px).

## REQ-coverage map

The README has a route-to-REQ mapping. The pages are organised so a reviewer can step
through the feature set top-to-bottom: routes are named after their module, components
named after the requirement they satisfy (e.g. `BufferIndicator`, `GateChecklist`,
`CredentialModal`, `GateBadges`).

## Things deliberately not built

- **No backend code** - the `apps/backend` Fastify stub exists from the initial scaffold
  but isn't consumed by the frontends yet.
- **No real auth** - login forms accept any credentials and route to the dashboard.
  Drop in NextAuth or your IdP of choice in `app/(auth)/login/page.tsx`.
- **No real TOTP** - admin destructive actions ask for a 6-digit code but accept any.
  Wire to a real authenticator app server-side.
- **No real WS endpoint** - flip `NEXT_PUBLIC_MOCK=false` and point `NEXT_PUBLIC_API_URL`
  to a backend that exposes `/ws` and `/api/...`.
- **Email orchestration** - retention emails (§7), payout state-change emails (REQ-048),
  social-proof prompts (REQ-077–079) are server-side concerns.

## Future-proofing for Phase 2

Per Feature Set §29, the 21 deferred features can be slotted into the same patterns
without rework:

- New product types fit the **AccountType** union and the tabbed filter on
  `/profile/accounts` (REQ-237 was designed for this).
- Multi-step / phased evaluations would extend the `RuleSnapshot` interface, not the
  account shape - every account already carries its own rule snapshot per REQ-108.
- Crypto payouts already have `method: "BANK" | "CRYPTO"` in the Payout type - only the
  payout-method picker on the trader's request form needs to surface it.
- AI companion / behaviour classification gets a new module under `app/(trader)/` and a
  new query in `lib/queries/`. No re-architecture.
