# PawaPlay — Architecture Overview

**Tagline:** Play. Win. Withdraw.
**Regulatory posture:** All real-money functionality gated behind `REGULATORY_MODE` (`DEMO` / `TEST` / `PRODUCTION`). Production mode requires explicit operator licence configuration — nothing here assumes a licence exists.

---

## A. System Architecture

Modular monolith (NestJS) with hard module boundaries so any module can be extracted into its own microservice later without rewriting business logic. Each module owns its own DB schema/tables and only talks to other modules through injected service interfaces (never direct cross-module repository access) and domain events on RabbitMQ.

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway (NestJS)                   │
│   Auth Guard → RBAC Guard → Regulatory-Mode Guard → Rate Limit│
└───────────────┬────────────────────────────┬──────────────────┘
                 │                            │
       ┌─────────▼─────────┐        ┌─────────▼─────────┐
       │  Sync REST/WS API  │        │  Domain Event Bus  │
       │  (per module)      │        │  (RabbitMQ)         │
       └─────────┬─────────┘        └─────────┬─────────┘
                 │                            │
  ┌──────────────┼────────────────────────────┼──────────────┐
  │  Identity │ Users │ KYC │ AML/Risk │ Wallet │ Payments      │
  │  Betting │ Sports │ Numbers │ Virtual │ Settlement          │
  │  Promotions │ Loyalty │ Agents │ Notifications │ Support     │
  │  Reporting │ Audit │ Admin                                  │
  └──────────────┬────────────────────────────┬──────────────┘
                 │                            │
         ┌───────▼───────┐            ┌───────▼───────┐
         │  PostgreSQL    │            │     Redis      │
         │  (ledger, txn) │            │ (session/cache)│
         └────────────────┘            └────────────────┘
```

Key architectural rules baked in from day one:

1. **Server is the only source of truth.** Client never sends balances, odds, or KYC status — only intents (e.g. "place this selection at this stake"). Server re-derives everything from DB state at transaction time.
2. **Ledger-style wallet.** `wallet_transactions` is append-only. Balance = `SUM(signed amount)` for a wallet, never a mutable `balance` column updated in place (a cached balance column is allowed for read performance but is always reconcilable from the ledger).
3. **Idempotency everywhere money moves.** Every deposit, withdrawal, bet placement, and settlement call takes a client-supplied idempotency key, stored and checked before any write.
4. **Regulatory-mode gate.** A global `RegulatoryModeGuard` blocks any endpoint tagged `@RealMoney()` unless `REGULATORY_MODE=PRODUCTION` *and* the relevant `payment_providers` / `jurisdiction_config` rows are marked `approved`.
5. **Audit-first.** Every state-changing service call writes an `audit_logs` row in the same DB transaction as the business write (not best-effort/after-the-fact).

---

## D. UX Flow / Screen Map

### Customer App (React Native)
```
Splash → Onboarding (Sports/Numbers/Virtual/Wallet/RG explainer)
  → Registration (mobile + OTP) → PIN setup → T&Cs
  → Home
      ├── Sports → League → Event → Market → Bet Slip → Place Bet → Confirmation
      ├── Numbers → Draw list → Number selection → Ticket purchase → Ticket confirmation
      ├── Virtual → Provider game list → Play (via VirtualGameProviderAdapter) → Result
      ├── Wallet → Balance → Deposit → Withdraw → Transaction history
      ├── Promotions → Campaign detail → Opt-in
      └── Profile → KYC status/upload → Responsible Gambling controls → Support (WhatsApp deep link)
```

### Agent App (React Native, separate binary)
```
Agent Login (PIN + device binding) → Dashboard (float balance, today's activity)
  → Assist Registration → Assist KYC → Process Deposit → Process Withdrawal
  → Customer Lookup → Commission Statement
```

### Admin Dashboard (Web)
```
Dashboard → Users → Sports/Odds → Numbers → Wallet/Reconciliation
  → Agents → Compliance (KYC/AML/RG/Self-exclusion) → Promotions → Reports
```

State handling: every screen that shows money or eligibility (balance, odds, bet status, KYC status) re-fetches from server on focus rather than trusting cached/local state, with optimistic UI only for non-critical elements (e.g. bet-slip stake input before submission).

---

## F. Development Roadmap (as specified)

| Phase | Scope |
|---|---|
| **0 (this delivery)** | Docs (architecture, schema, folder structure, API spec) + vertical-slice backend skeleton in DEMO mode: register → login → demo KYC stub → demo wallet → list sports/odds → bet slip → place demo bet → settle → demo withdrawal |
| **1** | Full auth (OTP+PIN, JWT/refresh), Users, real KYC workflow, real Wallet ledger, baseline Admin |
| **2** | Sports catalog, odds ingestion, bet slip, bet placement engine, settlement engine |
| **3** | Payment provider adapters (sandbox first), Agent app, Notifications, WhatsApp support integration |
| **4** | Numbers game, Virtual game adapter framework, Promotions, Loyalty |
| **5** | Security hardening, load/perf, Prometheus/Grafana, full compliance reporting, production readiness review |

Phase 0 is what's scaffolded in this repo now — a working demo-money path end to end, matching the "vertical slice first" rule in the brief.

---

## Non-negotiable compliance guardrails (apply to every phase)

- No module ships a hard-coded PNG legal assumption (age, tax %, licence text) — all pulled from `jurisdiction_config`.
- `PRODUCTION` regulatory mode cannot be set via a mobile/admin UI toggle — it's an infra-level env var requiring a deploy, so it can't be flipped accidentally or by a compromised admin account.
- AML engine only ever *flags* — it has no code path that blocks/freezes/reports a user automatically without a human compliance reviewer action.
