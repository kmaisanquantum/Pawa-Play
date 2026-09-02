# Deploying PawaPlay Fullstack Application on Coolify

This guide explains how to deploy the unified PawaPlay fullstack application (NestJS API + React Web UI) on Coolify using a single Docker container and a managed PostgreSQL database.

---

## 1. Prerequisites & Overview

The application is built as a single container serving both the React SPA frontend and NestJS REST API endpoints:

- **Web UI:** Available at `/` (serves React SPA built from `frontend/`)
- **REST API:** Available at `/api/v1`
- **Health Check Path:** `/health` (returns `{ "status": "ok" }`)
- **Exposed Port:** `3000`
- **Build Context:** `./backend` using `backend/Dockerfile` (or `docker-compose.prod.yml`)

> **Mobile Apps:** The React app in `frontend/` can also be built into iOS/Android native packages via Capacitor. See `docs/MOBILE.md` for mobile wrapper setup instructions.

---

## 2. Managed PostgreSQL Setup & Database Migrations

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

## 3. Environment Variable Configuration

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

## 4. Deploying via Coolify

1. **Create Application in Coolify:**
   - Select Dockerfile deployment with build context `./backend` and Dockerfile path `Dockerfile` (or Docker Compose using `docker-compose.prod.yml`).
2. **Configure Environment:**
   - Add all environment variables listed above in the Coolify UI. Ensure `DATABASE_URL` references the managed Postgres connection string.
3. **Configure Health Check & Ports:**
   - Set exposed port to `3000`.
   - Set health check target path to `/health`.
4. **Deploy:**
   - Trigger deployment. Coolify will build the Docker container via `npm ci` and `npm run build` and launch `dist/main.js` serving the Web UI at `/`, REST API at `/api/v1`, and health check at `/health`.
