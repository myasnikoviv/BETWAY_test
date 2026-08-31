# T011 — Bootstrap Next.js Workspace & Core Domain Models

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: DONE
* **Branch**: `ticket/T011-bootstrap-web-and-core-domain`
* **Depends on**: None

---

## 1. Objective

Initialize the Next.js TypeScript project structure under `web/` with strict configuration, Vitest test runner, canonical domain models (`BetSlip`, `BetSelection`, `ConvertResult`), and the core error taxonomy (`AppError`).

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Sections 4, 7, 11)
* Approved Stack: [`docs/architecture/ADR-0001-stack-selection.md`](../../docs/architecture/ADR-0001-stack-selection.md)
* Invariants: `INV-02` (Canonical Models), `INV-04` (No Database)
* Skill: [`skills/full-stack-typescript-engineering/SKILL.md`](../../skills/full-stack-typescript-engineering/SKILL.md)

> [!NOTE]
> **Foundation Slice Rationale**: T011 intentionally combines the Next.js scaffold, strict TypeScript configuration, canonical domain interfaces, AppError taxonomy, and Vitest runner as a single foundational slice. This establishes the complete, working local environment required for subsequent integration tickets (T012+) without creating bureaucratic micro-tickets.


---

## 3. Scope & Deliverables

* Initialize `web/` directory with Next.js (App Router, TypeScript, Tailwind CSS).
* Configure `tsconfig.json` with `"strict": true`.
* Configure Vitest for fast, isolated unit testing.
* Create `web/src/core/domain/` containing:
  * `BetSelection.ts`: Canonical selection model.
  * `BetSlip.ts`: Canonical bet slip model with cumulative total odds calculation.
  * `ConvertResult.ts`: Conversion result model.
* Create `web/src/core/errors/AppError.ts` defining standard error codes (`INVALID_INPUT`, `BOOKING_CODE_NOT_FOUND`, `STALE_SELECTIONS`, `UPSTREAM_BETWAY_ERROR`, `INTERNAL_SERVER_ERROR`).
* Add unit tests in `web/tests/core/domain/` verifying model creation and odds calculation.

---

## 4. Non-Goals

* Do not implement Betway HTTP calls yet (deferred to T012).
* Do not implement use cases or API route handlers yet (deferred to T013, T014).
* Do not implement UI components yet (deferred to T015).

---

## 5. Acceptance Criteria

1. `web/` builds cleanly and `npm run typecheck` (`tsc --noEmit`) passes with zero errors.
2. Canonical domain interfaces (`BetSlip`, `BetSelection`, `ConvertResult`) strictly match Section 4 of `02-application-architecture.md`.
3. `AppError` provides typed codes, HTTP status mappings, and user-friendly messages.
4. Vitest is configured and passes 100% of domain unit tests.
5. Zero dependencies on external Betway payload schemas inside `core/domain/`.

---

## 6. Verification Plan

* `cd web && npm run typecheck`
* `cd web && npm run test`
* `cd web && npm run lint`
* `cd web && npm run build`

---

## 7. STOP CONDITION

Stop immediately once the `web/` project is initialized, domain models and error taxonomy are implemented, unit tests pass, and changes are committed. Do not start T012.

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**: `INV-02` (Canonical Models) and `INV-04` (No Database) strictly honored. Pure domain models with zero external Betway payload coupling, strict TypeScript configuration, and comprehensive unit tests.

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - `npm run typecheck`: Passed cleanly with zero TypeScript errors.
  - `npm run test`: 4 test suites, 19/19 tests passed (100%).
  - `npm run lint`: Passed with zero ESLint warnings or errors.
  - `npm run build`: Static production compilation completed successfully with zero build errors.

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 5 functional/non-functional criteria satisfied.
- [x] 2. Quality Gates: Typecheck, test, lint, and build pass 100%.
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01` through `INV-06` preserved.
- [x] 5. QA Verification: Runtime behavior verified with automated test evidence.
- [x] 6. Documentation: Architecture references and ticket logs updated.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved dependencies or database entities.
