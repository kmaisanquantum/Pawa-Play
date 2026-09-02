# Deploying PawaPlay Fullstack Application on Coolify

This guide explains how to deploy the unified PawaPlay fullstack application (NestJS API + React Web UI) on Coolify using **Nixpacks** (recommended) or Docker.

---

## 1. Prerequisites & Overview

The application is built as a single unified service serving both the React SPA frontend and NestJS REST API endpoints:

- **Web UI:** Available at `/` (serves React SPA built from `frontend/` placed in `backend/client/`)
- **REST API:** Available at `/api/v1`
- **Health Check Path:** `/health` (returns `{ "status": "ok" }`)
- **Exposed Port:** `3000`
- **Primary Deployment Method:** Coolify **Nixpacks** Build Pack

> **Mobile Apps:** The React app in `frontend/` can also be built into iOS/Android native packages via Capacitor. See `docs/MOBILE.md` for mobile wrapper setup instructions.

---

## 2. Nixpacks Deployment on Coolify (Recommended)

Coolify auto-detects the repository root `package.json` and `nixpacks.toml`:

### Build & Start Lifecycle
- **Install & Build (`npm run build`):** Installs dependencies and builds `frontend/`, builds `backend/`, and copies `frontend/dist/*` to `backend/client/`.
- **Start (`npm run start`):** Executes `node backend/dist/main.js`.

---

## 3. Managed PostgreSQL Setup & Database Migrations

Because Coolify-managed PostgreSQL instances do not automatically execute initialisation scripts in `/docker-entrypoint-initdb.d`, schema migrations must be applied manually prior to initial service boot.

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

## 4. Environment Variable Configuration

In Coolify UI, configure the following environment variables for the application service:

| Variable | Description | Example / Default |
|---|---|---|
| `REGULATORY_MODE` | Operating mode (`DEMO`, `TEST`, `PRODUCTION`) | `DEMO` |
| `DATABASE_URL` | Connection URL to Coolify managed Postgres | `postgres://user:password@coolify-db-host:5432/pawaplay` |
| `DATABASE_SSL` | Enable SSL for managed Postgres | `true` (if managed DB enforces SSL) or `false` |
| `JWT_SECRET` | Secret key for signing access JWTs | Strong random 32+ byte string |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh JWTs | Strong random 32+ byte string |
| `PORT` | HTTP server port | `3000` |

---

## 5. Coolify Configuration Steps

1. **Build Pack:** Select **Nixpacks**.
2. **Ports & Health Check:**
   - Set Port to `3000`.
   - Set Health Check Path to `/health`.
3. **Environment Variables:** Set required env vars from Section 4.
4. **Deploy:** Click Deploy. Nixpacks will run `npm run build` followed by `npm run start`.

---

## 6. Docker Deployment Alternative

Docker files (`Dockerfile`, `docker-compose.prod.yml`) remain available as an alternative deployment method if Docker engine deployment is selected instead of Nixpacks.
