# Deploying PawaPlay Backend on Coolify

This guide explains how to deploy the PawaPlay NestJS backend API (`backend/`) on Coolify using a managed PostgreSQL database.

> **Note:** Only the NestJS backend API is currently deployable from this repository. Mobile client applications (`mobile-customer/`, `mobile-agent/`) do not exist yet.

---

## 1. Prerequisites & Overview

Coolify provides a managed PostgreSQL instance and handles container building and orchestration for the backend API.

- **Build Context:** `./backend` (uses `backend/Dockerfile`) or `docker-compose.prod.yml`.
- **Exposed Port:** `3000`
- **Health Check Path:** `/health` (returns `{ "status": "ok" }`)

---

## 2. Managed PostgreSQL Setup & Database Migrations

Because Coolify-managed PostgreSQL instances do not automatically execute initialisation scripts (such as `/docker-entrypoint-initdb.d`), schema migrations must be applied manually prior to initial service boot.

### Apply Schema Migration

Execute the schema migration file against your managed PostgreSQL database:

```bash
psql "$DATABASE_URL" -f database/migrations/001_init_schema.sql
```

### Apply Seed Data (DEMO Mode)

If running in `REGULATORY_MODE=DEMO`, load the initial demo seed data:

```bash
psql "$DATABASE_URL" -f database/seed/demo_seed.sql
```

---

## 3. Environment Variable Configuration

In Coolify, configure the following environment variables for the backend service:

| Variable | Description | Example / Default |
|---|---|---|
| `REGULATORY_MODE` | Operating mode (`DEMO`, `TEST`, `PRODUCTION`) | `DEMO` |
| `DATABASE_URL` | Connection URL to Coolify managed Postgres | `postgres://user:password@coolify-db-host:5432/pawaplay` |
| `DATABASE_SSL` | Enable SSL for managed Postgres | `true` (if managed DB enforces SSL) or `false` |
| `JWT_SECRET` | Secret key for signing access JWTs | Strong random 32+ byte string |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh JWTs | Strong random 32+ byte string |
| `PORT` | HTTP server port | `3000` |

---

## 4. Deploying via Coolify

1. **Create Application in Coolify:**
   - Connect repository and select Dockerfile deployment using `backend/Dockerfile` or Docker Compose deployment using `docker-compose.prod.yml`.
2. **Configure Environment:**
   - Add all environment variables listed above. Ensure `DATABASE_URL` references the managed Postgres connection string.
3. **Configure Health Check:**
   - Set health check target path to `/health` on port `3000`.
4. **Deploy:**
   - Trigger deployment. Coolify will build the backend Docker container (`npm ci && npm run build`) and launch `dist/main.js`.
