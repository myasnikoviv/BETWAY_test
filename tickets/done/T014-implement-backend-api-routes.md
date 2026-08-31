# T014 — Implement Backend API Route Handlers (/api/v1/*)

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: DONE
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

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): Client and frontend requests mediated strictly through `/api/v1/*` route handlers without direct client-to-Betway calls.
  - `INV-02` (Canonical Models / Zero DTO Leakage): Endpoints return canonical domain envelopes (`ApiResponse<T>`) without leaking raw upstream Betway DTOs.
  - `INV-03` (Consistent API Contract for Web & Flutter): Unified endpoints (`/api/v1/resolve`, `/api/v1/create`, `/api/v1/convert`, `/api/v1/health`) return consistent JSON schema and CORS headers for both Next.js frontend and Flutter mobile client.
  - `INV-05` (Convert Composition): `/api/v1/convert` delegates directly to `ConvertBookingCodeUseCase`.
  - `INV-06` (Gateway & Use Case Isolation): Route handlers instantiate use cases with singleton/gateway dependencies without inline Betway logic.

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - `npm run test`: 16 test suites, 139/139 tests passing (100% pass rate, including 57 API route and validation tests).
  - `npm run typecheck`: Passed with 0 TypeScript compiler errors.
  - `npm run lint`: Passed with 0 ESLint warnings or errors.
  - `npm run build`: Static production Next.js compilation completed successfully with dynamic Route Handlers `/api/v1/resolve`, `/api/v1/create`, `/api/v1/convert`, `/api/v1/health`.

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 5 acceptance criteria satisfied.
- [x] 2. Quality Gates: Typecheck, test, lint, and build pass 100%.
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-02`, `INV-03`, `INV-05`, and `INV-06` preserved.
- [x] 5. QA Verification: Runtime behavior verified with 100% integration test coverage in Vitest.
- [x] 6. Documentation: Architecture references and ticket logs updated.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved dependencies, no premature UI code or database entities introduced.
