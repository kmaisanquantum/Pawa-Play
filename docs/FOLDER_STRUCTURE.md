# C. Folder Structure

```
pawaplay/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/                  # env schema, jurisdiction config, regulatory-mode config
│   │   ├── common/
│   │   │   ├── guards/              # AuthGuard, RbacGuard, RegulatoryModeGuard, RgLimitGuard
│   │   │   ├── interceptors/        # AuditInterceptor, IdempotencyInterceptor
│   │   │   ├── decorators/          # @RealMoney(), @Roles(), @CurrentUser()
│   │   │   └── filters/             # global exception filter (no stack traces to client)
│   │   └── modules/
│   │       ├── identity/            # OTP, PIN/password, JWT, refresh tokens, sessions
│   │       ├── users/               # profile, account status
│   │       ├── kyc/                 # kyc workflow + document storage
│   │       ├── aml/                 # risk scoring, AML case management
│   │       ├── wallet/              # ledger, wallet_transactions
│   │       ├── payments/            # PaymentProviderInterface + adapters (sandbox, ...)
│   │       ├── betting/             # bet slip validation, placement, bet_items
│   │       ├── sports/              # sports/leagues/events/markets/odds
│   │       ├── numbers/             # draw config, tickets, results
│   │       ├── virtual/             # VirtualGameProviderAdapter framework
│   │       ├── settlement/          # bet settlement engine
│   │       ├── promotions/          # campaigns, bonuses
│   │       ├── loyalty/             # points, tiers
│   │       ├── agents/              # agent accounts, agent transactions, commissions
│   │       ├── notifications/       # push/SMS/email/WhatsApp abstraction
│   │       ├── support/             # WhatsApp support bridge, ticketing
│   │       ├── reporting/           # scheduled + on-demand reports
│   │       ├── audit/               # append-only audit_logs writer/reader
│   │       └── admin/               # admin-only aggregation endpoints, RBAC roles/permissions
│   ├── test/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── security/
│   │   └── e2e/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── mobile-customer/         # React Native customer app
├── mobile-agent/            # React Native agent app
├── admin-dashboard/         # React (or Next.js) admin web app
│
├── database/
│   ├── migrations/          # SQL migrations, timestamp-ordered
│   └── seed/                # DEMO-mode seed data only
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FOLDER_STRUCTURE.md
│   ├── API_SPEC.md (+ openapi.yaml)
│   └── DEPLOYMENT.md
│
├── .github/workflows/       # CI: lint, typecheck, unit+integration tests, build
├── docker-compose.yml
├── .env.example
└── README.md
```

Rule of thumb enforced by lint/CI: a file under `modules/X/` may only import from `modules/Y/` via `Y`'s exported `*.service.ts` interface — never a repository, entity, or internal file. This is what makes future microservice extraction low-risk.
