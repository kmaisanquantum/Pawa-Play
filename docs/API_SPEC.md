# E. API Specification

Full machine-readable spec: `docs/openapi.yaml` (Phase-0 vertical slice endpoints only; grows each phase).

## Conventions

- All endpoints under `/api/v1`.
- Auth: `Authorization: Bearer <jwt>`. Refresh via `/auth/refresh`.
- All money-moving endpoints (`@RealMoney()`) require header `Idempotency-Key: <uuid>` and are rejected without one.
- Pagination: `?page=1&limit=20`, response envelope `{ data: [...], meta: { page, limit, total } }`.
- Errors: RFC7807-style `{ statusCode, error, message, correlationId }`. No stack traces/internal detail leak to client.
- Rate limits: per-IP and per-user token buckets (Redis-backed); `429` includes `Retry-After`.
- Regulatory-mode: response includes `X-Regulatory-Mode: DEMO|TEST|PRODUCTION` header so clients can render a demo-money banner.

## Endpoint groups (Phase 0 slice implemented; rest are Phase 1+ placeholders in the spec)

```
/auth
  POST /auth/register          mobile + OTP request
  POST /auth/verify-otp        confirm OTP, set password/PIN
  POST /auth/login             mobile + PIN/password -> access+refresh JWT
  POST /auth/refresh
  POST /auth/logout

/users
  GET  /users/me
  PATCH /users/me

/kyc
  GET  /kyc/status
  POST /kyc/documents           (stubbed in Phase 0 as auto-VERIFIED in DEMO mode)

/wallet
  GET  /wallet/balance
  GET  /wallet/transactions
  POST /wallet/deposit          [@RealMoney, DEMO-simulated in Phase 0]
  POST /wallet/withdraw         [@RealMoney, DEMO-simulated in Phase 0]

/sports
  GET  /sports
  GET  /sports/:id/events
  GET  /events/:id/markets

/bets
  POST /bets/validate            server-side pre-check of a prospective slip
  POST /bets                     [@RealMoney] place bet — full 12-step validation from brief
  GET  /bets                     open/settled bets for current user

/admin, /aml, /agents, /numbers, /virtual, /promotions, /loyalty, /support, /reports
  -> defined as stub paths in openapi.yaml, implemented in later phases
```

## Bet placement contract (implements section 8 of the brief)

`POST /bets`
```json
{
  "selections": [{ "selectionId": "uuid" }],
  "stake": "20.00"
}
```
Server executes, in a single DB transaction, in this order — any failure aborts with no wallet mutation:
1. Resolve authenticated user from JWT
2. Load KYC status — reject if not `VERIFIED` (in `PRODUCTION`/`TEST`; DEMO allows `NOT_STARTED`)
3. Reject if `self_exclusions` row is active
4. Reject if stake breaches `responsible_gambling_limits`
5. Lock wallet row (`SELECT ... FOR UPDATE`), recompute balance from ledger, reject if insufficient
6. Re-fetch each selection's odds/market/event status server-side — reject if market not `OPEN` or odds changed beyond configured tolerance
7. Recompute `total_odds` and `potential_return` server-side (ignore any client-sent values)
8. Insert `bets` + `bet_items` (odds snapshot)
9. Insert `wallet_transactions` row type `BET` (negative amount), same transaction
10. Insert `audit_logs` row
11. Commit
12. Return `{ betId, status, potentialReturn }`

Idempotency: `Idempotency-Key` header checked against a Redis + DB unique constraint before step 1 begins; a repeat request with the same key returns the original result without re-executing.
