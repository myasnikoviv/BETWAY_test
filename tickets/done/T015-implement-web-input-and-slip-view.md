# T015 — Implement Web UI — Input Form & BetSlip Display

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: DONE
* **Branch**: `ticket/T015-implement-web-input-and-slip-view`
* **Depends on**: T014

---

## 1. Objective

Build the primary interactive Web UI in Next.js (`web/src/app/page.tsx`), including the booking code input form, decode trigger, loading states, error alerts, and the canonical `BetSlipCard` displaying fixtures, markets, selections, and total odds.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 9)
* Requirements: `FR-01` (Resolve), `FR-02` (Display)
* Skill: [`skills/full-stack-typescript-engineering/SKILL.md`](../../skills/full-stack-typescript-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Create API client helper in `web/src/lib/api-client.ts` calling `/api/v1/resolve`.
* Create custom React state hook `web/src/hooks/useBetSlip.ts` managing `idle`, `loading`, `success`, and `error` states.
* Implement UI components in `web/src/components/`:
  * `Header.tsx`: Clean top bar with assessment branding.
  * `BookingCodeInputForm.tsx`: Input box, Decode button, paste support, and validation feedback.
  * `BetSlipCard.tsx`: Match header (teams, league), market title, outcome badge, individual odds, and cumulative total odds summary.
  * `StatusFeedback.tsx`: Loading spinner and user-friendly error banners.
* Assemble main page in `web/src/app/page.tsx` with responsive Tailwind CSS layout.
* Add component tests in `web/tests/components/` verifying rendering in loading, success, and error states.

---

## 4. Non-Goals

* Do not implement Convert action bar or Loom verification modal yet (deferred to T016).
* Do not introduce global state libraries (use React component-local state).

---

## 5. Acceptance Criteria

1. User can paste a valid Betway booking code (e.g. `BW6D7ABCFB`) and trigger Decode.
2. Loading spinner displays while the request is in flight.
3. Decoded bet slip renders all selections with match name, market name, outcome name, and decimal odds.
4. Total odds calculation matches the cumulative product of all leg odds.
5. Meaningful error message is displayed when a booking code is not found or invalid.

---

## 6. Verification Plan

* `cd web && npm run test`
* `cd web && npm run build`
* Manual check in local dev server (`npm run dev`) at `http://localhost:3000`.

---

## 7. STOP CONDITION

Stop immediately once the input form, decode action, and BetSlipCard display are implemented and tested. Do not start T016.

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): Client UI calls Next.js `/api/v1/resolve` via `api-client.ts`; zero direct client-to-Betway requests.
  - `INV-02` (Canonical Models / Zero DTO Leakage): UI components render domain model types (`BetSlip`, `BetSelection`) directly from canonical JSON envelope.
  - `INV-03` (Consistent API Contract for Web & Flutter): Consumes `/api/v1/resolve` matching architecture contract shared with Flutter client.
  - `INV-06` (Decoupled Client Architecture): Clean separation across UI components (`Header`, `BookingCodeInputForm`, `BetSlipCard`, `StatusFeedback`), custom state hook (`useBetSlip`), and API client layer (`api-client.ts`).

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - `npm run test`: 23 test suites, 177/177 tests passing (100% pass rate, including 38 component, hook, and page UI tests).
  - `npm run typecheck`: Passed with 0 TypeScript compiler errors.
  - `npm run lint`: Passed with 0 ESLint warnings or errors.
  - `npm run build`: Static production Next.js compilation completed successfully with prerendered page `/` (28.4 kB).

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 5 acceptance criteria satisfied.
- [x] 2. Quality Gates: Typecheck, test, lint, and build pass 100%.
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-02`, `INV-03`, and `INV-06` preserved.
- [x] 5. QA Verification: Runtime behavior verified with 100% component/hook/page test coverage in Vitest (`@testing-library/react`).
- [x] 6. Documentation: Architecture references and ticket logs updated.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved dependencies, no premature Convert action bar or Loom modal (deferred to T016).

