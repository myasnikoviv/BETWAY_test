# T012 — Implement Betway Gateway Adapter & Fixture Tests

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: READY
* **Branch**: `ticket/T012-implement-betway-gateway`
* **Depends on**: T011

---

## 1. Objective

Implement the server-side Betway integration gateway (`IBetwayGateway` and `BetwayHttpGateway`) encapsulating all undocumented Betway Nigeria HTTP endpoints, timeouts, fallback routing, and DTO normalization, with deterministic Vitest tests using static fixtures.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 8)
* Forensic Findings: [`docs/03-betway-integration-findings.md`](../../docs/03-betway-integration-findings.md)
* Static Research Fixtures: [`research/betway/samples/resolve_response.json`](../../research/betway/samples/resolve_response.json), [`research/betway/samples/create_response.json`](../../research/betway/samples/create_response.json)
* Invariants: `INV-01` (Clients never call Betway), `INV-02` (No raw DTO leakage), `INV-06` (Gateway isolation)
* Skill: [`skills/full-stack-typescript-engineering/SKILL.md`](../../skills/full-stack-typescript-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Create `web/src/core/gateway/`:
  * `IBetwayGateway.ts`: Gateway abstraction interface.
  * `BetwayTypes.ts`: Internal private Betway request/response DTO interfaces.
  * `BetwayHttpGateway.ts`: Production implementation calling `https://www.betway.com.ng/appsynapse/bet-api-sr02` with 8-second timeout (`AbortSignal.timeout`), fallback to `/bet-api-sr`, and upstream error translation.
  * `MockBetwayGateway.ts`: Test mock implementation reading static JSON fixtures.
* Copy sanitized sample responses from `research/betway/samples/` to `web/tests/fixtures/`.
* Write Vitest unit tests in `web/tests/core/gateway/` verifying:
  * Raw Betway FindBookABet response normalization into canonical `BetSelection[]`.
  * Create outcomes payload mapping.
  * Timeout and 5xx error mapping into `AppError('UPSTREAM_BETWAY_ERROR', 502)`.
  * Not-found response mapping into `AppError('BOOKING_CODE_NOT_FOUND', 404)`.

---

## 4. Non-Goals

* Do not expose Route Handlers yet (deferred to T014).
* Do not call live Betway in automated unit tests (must run deterministically offline).

---

## 5. Acceptance Criteria

1. `IBetwayGateway` defines `resolve(bookingCode)` and `create(outcomes, isSingleBet)`.
2. `BetwayHttpGateway` encapsulates all Betway endpoint URLs, headers, timeouts, and error handling.
3. Raw Betway DTO schemas are strictly contained in `core/gateway/` and not exported to domain consumers.
4. Normalization converts raw nested Betway legs into clean canonical `BetSelection` items with correct decimal odds.
5. All gateway tests pass 100% in Vitest without network calls.

---

## 6. Verification Plan

* `cd web && npm run test`
* `cd web && npm run typecheck`

---

## 7. STOP CONDITION

Stop immediately once `IBetwayGateway`, `BetwayHttpGateway`, and `MockBetwayGateway` are implemented, unit tests pass, and changes are committed. Do not start T013.
