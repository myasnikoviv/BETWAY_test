# T020 — Configure Vercel Public Web Deployment

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: DONE
* **Branch**: `ticket/T020-configure-vercel-deployment`
* **Depends on**: T016

---

## 1. Objective

Deploy the Next.js full-stack application (`web/`) to Vercel (Hobby Tier), verify public HTTPS availability, confirm operational Route Handlers, and record the live URL in repository documentation.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 3)
* Approved Stack: [`docs/architecture/ADR-0001-stack-selection.md`](../../docs/architecture/ADR-0001-stack-selection.md)
* Requirements: `NFR-01` (Public Web Deployment)

---

## 3. Scope & Deliverables

* Create Vercel project configuration (`vercel.json` if needed).
* Configure root directory (`web`) and environment variables on Vercel.
* Deploy to Vercel and obtain public production URL (e.g. `https://betway-assessment.vercel.app`).
* Perform live verification against public URL:
  * Health check: `GET /api/v1/health`
  * Resolve: `POST /api/v1/resolve`
  * Web UI interactive loading in browser.
* Update `README.md` with the live production URL.

---

## 4. Non-Goals

* Do not build mobile APK in this ticket (handled in T021).
* Do not attach database or paid addons.

---

## 5. Acceptance Criteria

1. Web application is live and publicly accessible over HTTPS.
2. Next.js Route Handlers (`/api/v1/*`) respond with < 500ms latency without cold start sleep.
3. Web UI is fully functional on the public URL for Decode, Create, and Convert flows.
4. Public live URL is documented in `README.md`.

---

## 6. Verification Plan

* `curl -s https://<deployed-url>/api/v1/health`
* Live browser test of Decode and Convert on the public URL.

---

## 7. STOP CONDITION

Stop immediately once public deployment is verified, documented in `README.md`, and changes are committed. Do not start T021.

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): Route handlers mediate all Betway requests server-side on Node.js/Vercel Serverless; zero client-side direct calls.
  - `INV-03` (Uniform Backend API Contract): `/api/v1/*` route handlers and CORS headers serve both web and mobile clients identically.
  - `INV-04` (Stateless Architecture): 100% stateless serverless execution with no databases or persistent session dependencies.
  - `INV-06` (Isolated Integration Adapter): `BETWAY_BASE_URL` and `BETWAY_TIMEOUT_MS` are configurable via environment variables with zero hardcoded credentials.

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - Web quality gates: `npm run lint`, `npm run typecheck`, `npm run test` (27 test files, 215 tests passing), `npm run build` pass with 0 errors/warnings.
  - Mobile quality gates: `dart format`, `flutter analyze`, `flutter test` (81/81 tests passing) pass with 0 errors/warnings.
  - Public Production URL: `https://betway-nigeria-booking-code.vercel.app` verified live over HTTPS.
  - API Base URL: `https://betway-nigeria-booking-code.vercel.app/api/v1` (`/health`, `/resolve`, `/create`, `/convert`, CORS OPTIONS preflights) verified functional.
  - Documentation: `README.md` and `web/README.md` contain accurate production URLs and verification commands.

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 4 acceptance criteria satisfied (live HTTPS web deployment, low latency route handlers without sleep, interactive web UI functionality, live URLs documented in `README.md`).
- [x] 2. Quality Gates: All automated quality gates pass 100% across both Web (lint, typecheck, 215 tests, build) and Mobile (format, analyze, 81 tests).
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-03`, `INV-04`, and `INV-06` verified and preserved.
- [x] 5. QA Verification: `VERIFIED` with reproducible test execution and live endpoint verification evidence.
- [x] 6. Documentation: Repository `README.md` and `web/README.md` updated with public topology, endpoints table, and Vercel guide.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards on ticket branch.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved packages, no database/paid addons, mobile APK deferred to T021.

