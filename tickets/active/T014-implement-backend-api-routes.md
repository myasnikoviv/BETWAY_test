# T014 — Implement Backend API Route Handlers (/api/v1/*)

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: IN_PROGRESS
* **Branch**: `ticket/T014-implement-backend-api-routes`
* **Depends on**: T013

---

## 1. Objective

Implement the public HTTP API boundary using Next.js Route Handlers (`/api/v1/resolve`, `/api/v1/create`, `/api/v1/convert`, `/api/v1/health`) with Zod request validation, standardized JSON error/success envelopes, and CORS headers.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Sections 6, 7)
* Invariants: `INV-01` (No direct client calls to Betway), `INV-03` (Consistent API contract for Web & Flutter)
* Skill: [`skills/full-stack-typescript-engineering/SKILL.md`](../../skills/full-stack-typescript-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Create Zod validation schemas in `web/src/lib/validation/`:
  * `resolveSchema` (`bookingCode: string` 4–15 chars).
  * `createSchema` (`selections: array`, `isSingleBet?: boolean`).
  * `convertSchema` (`bookingCode: string`).
* Implement Next.js Route Handlers in `web/src/app/api/v1/`:
  * `resolve/route.ts`: `POST /api/v1/resolve`
  * `create/route.ts`: `POST /api/v1/create`
  * `convert/route.ts`: `POST /api/v1/convert`
  * `health/route.ts`: `GET /api/v1/health`
* Implement standardized JSON response helper (`web/src/lib/api-response.ts`) setting status codes and CORS headers (`Access-Control-Allow-Origin: *`).
* Add integration tests in `web/tests/api/` testing all endpoints for valid requests, validation errors (400), not-found (404), and upstream failures (502).

---

## 4. Non-Goals

* Do not implement UI pages yet (deferred to T015).
* Do not put business/domain logic inside Route Handlers (handlers must remain thin).

---

## 5. Acceptance Criteria

1. Endpoints match the JSON contract in Section 6 of `02-application-architecture.md`.
2. All endpoints validate incoming JSON and return `400 Bad Request` with structured error details on malformed payloads.
3. CORS headers are returned to support cross-origin requests from Flutter.
4. Route Handlers delegate execution directly to use cases without inline Betway logic.
5. All API integration tests pass 100% in Vitest.

---

## 6. Verification Plan

* `cd web && npm run test`
* `cd web && npm run typecheck`
* `cd web && npm run build`

---

## 7. STOP CONDITION

Stop immediately once all `/api/v1/*` Route Handlers are implemented, integration tests pass, and changes are committed. Do not start T015.
