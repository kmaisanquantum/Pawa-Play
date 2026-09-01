-- PawaPlay core schema
-- Convention: all money columns are NUMERIC(14,2) in minor-neutral decimal PGK.
-- Convention: every mutable-looking table has created_at/updated_at; financial tables are append-only.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- CONFIG / JURISDICTION (never hard-code these elsewhere)
-- =========================================================
CREATE TABLE jurisdiction_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jurisdiction_code   TEXT NOT NULL UNIQUE,           -- e.g. 'PG'
    currency_code       TEXT NOT NULL DEFAULT 'PGK',
    minimum_age         INT NOT NULL,
    kyc_required        BOOLEAN NOT NULL DEFAULT TRUE,
    aml_threshold_amount NUMERIC(14,2),
    default_deposit_limit NUMERIC(14,2),
    default_bet_limit   NUMERIC(14,2),
    default_loss_limit  NUMERIC(14,2),
    tax_config          JSONB NOT NULL DEFAULT '{}',
    licence_reference   TEXT,                            -- operator's licence number/doc ref
    regulatory_mode     TEXT NOT NULL DEFAULT 'DEMO' CHECK (regulatory_mode IN ('DEMO','TEST','PRODUCTION')),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_providers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL UNIQUE,                -- 'sandbox', 'provider_x'
    name            TEXT NOT NULL,
    is_approved     BOOLEAN NOT NULL DEFAULT FALSE,       -- must be explicitly approved for PRODUCTION use
    supports_deposit BOOLEAN NOT NULL DEFAULT TRUE,
    supports_withdrawal BOOLEAN NOT NULL DEFAULT TRUE,
    config          JSONB NOT NULL DEFAULT '{}',          -- non-secret config only; secrets in secret manager
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- IDENTITY / USERS
-- =========================================================
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number       TEXT NOT NULL UNIQUE,
    email               TEXT UNIQUE,
    password_hash       TEXT,                             -- argon2id
    pin_hash            TEXT,                              -- argon2id, separate from password
    status              TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','SELF_EXCLUDED','CLOSED','PENDING_VERIFICATION')),
    role                TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER','AGENT','ADMIN','SUPPORT','COMPLIANCE')),
    mfa_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    date_of_birth   DATE NOT NULL,
    address         JSONB,
    preferred_language TEXT DEFAULT 'en',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE authentication_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    device_id       TEXT,
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_auth_sessions_user ON authentication_sessions(user_id);

-- =========================================================
-- KYC
-- =========================================================
CREATE TABLE kyc_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'NOT_STARTED'
                       CHECK (status IN ('NOT_STARTED','PENDING','VERIFIED','REJECTED','EXPIRED','MANUAL_REVIEW')),
    verification_method TEXT,
    verified_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    reviewer_id     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kyc_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_profile_id  UUID NOT NULL REFERENCES kyc_profiles(id) ON DELETE CASCADE,
    document_type   TEXT NOT NULL,               -- 'NATIONAL_ID','PASSPORT','DRIVERS_LICENCE','PROOF_OF_ADDRESS'
    storage_ref     TEXT NOT NULL,               -- pointer to encrypted object storage, never raw file in DB
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kyc_verifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_profile_id  UUID NOT NULL REFERENCES kyc_profiles(id) ON DELETE CASCADE,
    outcome         TEXT NOT NULL CHECK (outcome IN ('PASSED','FAILED','MANUAL_REVIEW')),
    notes           TEXT,
    performed_by    UUID REFERENCES users(id),   -- null if automated
    performed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- AML / RISK
-- =========================================================
CREATE TABLE risk_scores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score           NUMERIC(5,2) NOT NULL,
    factors         JSONB NOT NULL DEFAULT '{}',
    calculated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_risk_scores_user ON risk_scores(user_id, calculated_at DESC);

CREATE TABLE aml_cases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trigger_type    TEXT NOT NULL,                -- 'VELOCITY','LARGE_DEPOSIT','MULTI_ACCOUNT', ...
    status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','UNDER_REVIEW','CLOSED_NO_ACTION','ESCALATED')),
    details         JSONB NOT NULL DEFAULT '{}',
    assigned_to     UUID REFERENCES users(id),
    opened_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at       TIMESTAMPTZ
);

-- =========================================================
-- RESPONSIBLE GAMBLING
-- =========================================================
CREATE TABLE responsible_gambling_limits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    limit_type      TEXT NOT NULL CHECK (limit_type IN ('DEPOSIT','BET','LOSS','SESSION')),
    period          TEXT NOT NULL CHECK (period IN ('DAILY','WEEKLY','MONTHLY')),
    amount          NUMERIC(14,2),
    minutes         INT,                          -- for SESSION limits
    effective_from  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE self_exclusions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    starts_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at         TIMESTAMPTZ,                  -- null = indefinite
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- WALLET (ledger style — append only)
-- =========================================================
CREATE TABLE wallets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    currency_code   TEXT NOT NULL DEFAULT 'PGK',
    cached_balance  NUMERIC(14,2) NOT NULL DEFAULT 0,  -- derived; reconciled against wallet_transactions
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallet_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id       UUID NOT NULL REFERENCES wallets(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    type            TEXT NOT NULL CHECK (type IN ('DEPOSIT','WITHDRAWAL','BET','WIN','REFUND','BONUS','ADJUSTMENT','COMMISSION')),
    amount          NUMERIC(14,2) NOT NULL,          -- signed: +credit / -debit
    currency_code   TEXT NOT NULL DEFAULT 'PGK',
    status          TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','FAILED','REVERSED')),
    reference       TEXT NOT NULL,                    -- external/internal reference
    idempotency_key TEXT NOT NULL UNIQUE,
    related_bet_id  UUID,
    related_payment_transaction_id UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    -- NOTE: no updated_at — rows are never mutated. Corrections happen via a new REVERSED/ADJUSTMENT row.
);
CREATE INDEX idx_wallet_txn_wallet ON wallet_transactions(wallet_id, created_at DESC);

CREATE TABLE deposits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    payment_provider_id UUID NOT NULL REFERENCES payment_providers(id),
    amount          NUMERIC(14,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED','PENDING','COMPLETED','FAILED','CANCELLED')),
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE withdrawals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    payment_provider_id UUID NOT NULL REFERENCES payment_providers(id),
    amount          NUMERIC(14,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED','APPROVED','PROCESSING','COMPLETED','FAILED','REJECTED')),
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    approved_by     UUID REFERENCES users(id),
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id     UUID NOT NULL REFERENCES payment_providers(id),
    direction       TEXT NOT NULL CHECK (direction IN ('DEPOSIT','WITHDRAWAL')),
    external_ref    TEXT,
    status          TEXT NOT NULL,
    raw_webhook_payload JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- SPORTS / BETTING
-- =========================================================
CREATE TABLE sports (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    TEXT NOT NULL,
    slug    TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE leagues (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES sports(id),
    name    TEXT NOT NULL,
    country TEXT
);

CREATE TABLE teams (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    TEXT NOT NULL,
    sport_id UUID NOT NULL REFERENCES sports(id)
);

CREATE TABLE events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id   UUID NOT NULL REFERENCES leagues(id),
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    start_time  TIMESTAMPTZ NOT NULL,
    status      TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','LIVE','SUSPENDED','FINISHED','CANCELLED')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE markets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id),
    market_type TEXT NOT NULL,                    -- '1X2','OVER_UNDER', etc.
    status      TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','SUSPENDED','SETTLED','CANCELLED'))
);

CREATE TABLE selections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id   UUID NOT NULL REFERENCES markets(id),
    name        TEXT NOT NULL,                    -- 'Arsenal', 'Draw', 'Over 2.5'
    result      TEXT CHECK (result IN ('PENDING','WON','LOST','VOID'))
);

CREATE TABLE odds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    selection_id    UUID NOT NULL REFERENCES selections(id),
    decimal_odds    NUMERIC(8,3) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    stake           NUMERIC(14,2) NOT NULL,
    total_odds      NUMERIC(10,3) NOT NULL,
    potential_return NUMERIC(14,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','OPEN','WON','LOST','VOID','CASHED_OUT')),
    idempotency_key TEXT NOT NULL UNIQUE,
    placed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    settled_at      TIMESTAMPTZ
);

CREATE TABLE bet_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bet_id          UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
    selection_id    UUID NOT NULL REFERENCES selections(id),
    odds_at_placement NUMERIC(8,3) NOT NULL,      -- snapshot, never trust live odds retroactively
    result          TEXT CHECK (result IN ('PENDING','WON','LOST','VOID'))
);

CREATE TABLE bet_settlements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bet_id          UUID NOT NULL REFERENCES bets(id),
    outcome         TEXT NOT NULL CHECK (outcome IN ('WON','LOST','VOID')),
    payout_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    settled_by      TEXT NOT NULL DEFAULT 'SYSTEM',  -- 'SYSTEM' or admin user id
    settled_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- NUMBERS GAME
-- =========================================================
CREATE TABLE numbers_games (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    number_range_min INT NOT NULL,
    number_range_max INT NOT NULL,
    ticket_price    NUMERIC(10,2) NOT NULL,
    prize_structure JSONB NOT NULL DEFAULT '{}',
    max_tickets     INT,
    status          TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PAUSED','RETIRED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE numbers_draws (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id         UUID NOT NULL REFERENCES numbers_games(id),
    draw_time       TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','CLOSED','DRAWN','SETTLED','CANCELLED')),
    result_source_ref TEXT                          -- proof/seed reference for auditable RNG
);

CREATE TABLE numbers_tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id         UUID NOT NULL REFERENCES numbers_draws(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    selected_numbers INT[] NOT NULL,
    stake           NUMERIC(10,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','WON','LOST','VOID')),
    idempotency_key TEXT NOT NULL UNIQUE,
    purchased_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE numbers_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id         UUID NOT NULL UNIQUE REFERENCES numbers_draws(id),
    winning_numbers INT[] NOT NULL,
    published_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- VIRTUAL GAMES
-- =========================================================
CREATE TABLE virtual_games (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code   TEXT NOT NULL,                  -- resolved via VirtualGameProviderAdapter registry
    game_code       TEXT NOT NULL,
    name            TEXT NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE virtual_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    virtual_game_id UUID NOT NULL REFERENCES virtual_games(id),
    external_round_id TEXT,
    status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED','SETTLED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- PROMOTIONS / LOYALTY
-- =========================================================
CREATE TABLE promotions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    rules           JSONB NOT NULL DEFAULT '{}',
    starts_at       TIMESTAMPTZ,
    ends_at         TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE bonuses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    promotion_id    UUID REFERENCES promotions(id),
    amount          NUMERIC(14,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CREDITED','EXPIRED','FORFEITED')),
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE loyalty_accounts (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    points_balance  INT NOT NULL DEFAULT 0,
    tier            TEXT NOT NULL DEFAULT 'BRONZE',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE loyalty_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    points          INT NOT NULL,                   -- signed
    reason          TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- AGENTS
-- =========================================================
CREATE TABLE agents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id),
    float_balance   NUMERIC(14,2) NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','TERMINATED')),
    location        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id        UUID NOT NULL REFERENCES agents(id),
    customer_id     UUID REFERENCES users(id),
    type            TEXT NOT NULL CHECK (type IN ('DEPOSIT_ASSIST','WITHDRAWAL_ASSIST','REGISTRATION_ASSIST','KYC_ASSIST')),
    amount          NUMERIC(14,2),
    status          TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','FAILED','FLAGGED')),
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_commissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id        UUID NOT NULL REFERENCES agents(id),
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    amount          NUMERIC(14,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- SUPPORT / NOTIFICATIONS
-- =========================================================
CREATE TABLE support_tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    channel         TEXT NOT NULL CHECK (channel IN ('WHATSAPP','APP','EMAIL','PHONE')),
    category        TEXT,
    status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
    assigned_to     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    channel         TEXT NOT NULL CHECK (channel IN ('PUSH','SMS','EMAIL','WHATSAPP')),
    template_code   TEXT NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED','SENT','FAILED','SUPPRESSED')),
    suppression_reason TEXT,                          -- e.g. 'SELF_EXCLUDED'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- AUDIT / ADMIN / RBAC
-- =========================================================
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID,                              -- user/admin/agent/system
    actor_type      TEXT NOT NULL DEFAULT 'USER',
    action          TEXT NOT NULL,                       -- 'BET_PLACED','WITHDRAWAL_APPROVED', ...
    entity_type     TEXT NOT NULL,
    entity_id       UUID,
    before_state    JSONB,
    after_state     JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
-- audit_logs has no UPDATE/DELETE grants in application role — enforced at DB permission level.

CREATE TABLE admin_users (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    department      TEXT,
    mfa_enforced    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE roles (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    TEXT NOT NULL UNIQUE
);

CREATE TABLE permissions (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code    TEXT NOT NULL UNIQUE
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);
