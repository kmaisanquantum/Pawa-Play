# PawaPlay

PNG-focused mobile gaming platform. **Play. Win. Withdraw.**

This repo is scaffolded per `docs/ARCHITECTURE.md`. It currently implements **Phase 0**: a
functional vertical slice running in `REGULATORY_MODE=DEMO` —
register → login → demo KYC → demo wallet → sports → bet slip → place demo bet → settlement → demo withdrawal.

No real-money functionality is enabled anywhere in this codebase yet. `REGULATORY_MODE` defaults
to `DEMO`; switching to `PRODUCTION` requires an operator to supply jurisdiction, licence, and
approved-payment-provider configuration (see `.env.example`) — see `RegulatoryConfigService`.

## Quickstart (local dev)

```bash
cp .env.example .env
docker compose up -d postgres redis rabbitmq
psql "$DATABASE_URL" -f database/migrations/001_init_schema.sql
psql "$DATABASE_URL" -f database/seed/demo_seed.sql   # DEMO data only
cd backend && npm install && npm run start:dev
```

API docs (Swagger): `http://localhost:3000/api/docs`

## Docs

- `docs/ARCHITECTURE.md` — system architecture, UX flow, roadmap
- `docs/FOLDER_STRUCTURE.md` — repo layout and module-boundary rules
- `docs/API_SPEC.md` + `docs/openapi.yaml` — API reference
- `database/migrations/001_init_schema.sql` — full normalized schema

## What's implemented vs. stubbed (Phase 0)

| Area | Status |
|---|---|
| Regulatory-mode gate (`RegulatoryModeGuard`, `@RealMoney()`) | ✅ implemented |
| Wallet ledger (append-only, idempotent) | ✅ implemented |
| Bet placement (12-step server-side validation) | ✅ implemented |
| Sports/odds read endpoints | 🔲 stub — wire up `sports` module next |
| Auth (OTP + PIN + JWT/refresh) | 🔲 `AuthGuard` verifies JWTs; register/login/OTP handlers not yet written |
| KYC, AML, Payments, Numbers, Virtual, Agents, Admin, WhatsApp support | 🔲 tables + interfaces defined in schema/docs; module code is Phase 1–4 |

## Development rule (per brief)

Do not build every module simultaneously. Finish the vertical slice (this phase) working
end-to-end against real Postgres before expanding into Phase 1.
