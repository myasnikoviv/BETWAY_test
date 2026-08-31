# T013 — Implement Application Use Cases (Resolve, Create, Convert)

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: DONE
* **Branch**: `ticket/T013-implement-application-use-cases`
* **Depends on**: T012

---

## 1. Objective

Implement the three core application use cases (`ResolveBookingCodeUseCase`, `CreateBookingCodeUseCase`, `ConvertBookingCodeUseCase`) enforcing input validation, canonical data transformations, and stateless Convert composition.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 5)
* Invariants: `INV-05` (Convert composes Resolve + Create), `INV-06` (Isolated gateway dependency)
* Skill: [`skills/full-stack-typescript-engineering/SKILL.md`](../../skills/full-stack-typescript-engineering/SKILL.md)

> [!IMPORTANT]
> **Stateless Composition Guardrail**: `ConvertBookingCodeUseCase` combines Resolve, selection extraction, and Create into a single stateless workflow. It **must remain concise and direct** (invoking `ResolveBookingCodeUseCase` → validating active selections → invoking `CreateBookingCodeUseCase`). It must **NOT** introduce stateful tracking, complex command buses, or orchestration spaghetti. The Code Reviewer will explicitly audit this invariant (`INV-05`).


---

## 3. Scope & Deliverables

* Create `web/src/core/use-cases/`:
  * `ResolveBookingCodeUseCase.ts`: Validates booking code syntax, invokes `gateway.resolve()`, normalizes to `BetSlip`, and computes total odds.
  * `CreateBookingCodeUseCase.ts`: Validates input selections, maps to Betway outcomes payload, invokes `gateway.create()`, and returns generated code.
  * `ConvertBookingCodeUseCase.ts`: Orchestrates Resolve → checks active selections → Create → returns `ConvertResult` (`sourceCode`, `newCode`, `slip`).
* Create `web/src/core/use-cases/index.ts` exporting all use cases.
* Write comprehensive Vitest unit tests in `web/tests/core/use-cases/`:
  * `ResolveBookingCodeUseCase.test.ts` (valid code, invalid format, code not found).
  * `CreateBookingCodeUseCase.test.ts` (valid legs, empty legs validation).
  * `ConvertBookingCodeUseCase.test.ts` (verifying stateless composition using `MockBetwayGateway`).

---

## 4. Non-Goals

* Do not bind to HTTP transport or Next.js Route Handlers yet (deferred to T014).
* Do not introduce DI frameworks; use constructor dependency injection.

---

## 5. Acceptance Criteria

1. `ResolveBookingCodeUseCase` validates inputs and returns a complete canonical `BetSlip`.
2. `CreateBookingCodeUseCase` validates selection inputs and returns a valid `bookingCode`.
3. `ConvertBookingCodeUseCase` strictly composes `Resolve` and `Create` without duplicated Betway logic (`INV-05`).
4. All use cases depend on `IBetwayGateway` via constructor injection (DIP).
5. 100% unit test coverage for use cases with `MockBetwayGateway`.

---

## 6. Verification Plan

* `cd web && npm run test`
* `cd web && npm run typecheck`

---

## 7. STOP CONDITION

Stop immediately once all three use cases are implemented, unit tests pass, and changes are committed. Do not start T014.

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): Client/domain never directly interacts with Betway; mediated strictly through `IBetwayGateway`.
  - `INV-02` (Canonical Models / Zero DTO Leakage): Domain use cases operate exclusively on canonical domain models (`BetSlip`, `BetSelection`, `ConvertResult`).
  - `INV-05` (Convert Composition): `ConvertBookingCodeUseCase` strictly composes `ResolveBookingCodeUseCase` and `CreateBookingCodeUseCase` without duplicated Betway logic or stateful orchestration.
  - `INV-06` (Gateway Isolation): Use cases depend strictly on `IBetwayGateway` abstraction via constructor dependency injection.

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - `npm run test`: 10 test suites, 82/82 tests passing (100% pass rate, 30 new use-case unit tests).
  - `npm run typecheck`: Passed with 0 TypeScript compiler errors.
  - `npm run lint`: Passed with 0 ESLint warnings or errors.
  - `npm run build`: Static production compilation completed successfully with zero build errors.

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 5 acceptance criteria satisfied.
- [x] 2. Quality Gates: Typecheck, test, lint, and build pass 100%.
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-02`, `INV-05`, and `INV-06` preserved.
- [x] 5. QA Verification: Runtime behavior verified with 100% unit test coverage using `MockBetwayGateway`.
- [x] 6. Documentation: Architecture references and ticket logs updated.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved dependencies, no route handlers or database entities introduced.
