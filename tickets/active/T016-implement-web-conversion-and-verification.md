# T016 — Implement Web UI — Conversion Panel & Verification Modal

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: IN_PROGRESS
* **Branch**: `ticket/T016-implement-web-conversion-and-verification`
* **Depends on**: T015

---

## 1. Objective

Implement the 1-click Convert UI workflow, code diff comparison view, clipboard copy toast, and embedded Betway Verification Guide modal with direct links to `betway.com.ng` for seamless Loom walkthrough demonstration.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 9)
* Requirements: `FR-03` (Create), `FR-04` (Convert), `FR-05` (Verify on Betway), `NFR-08` (Loom Walkthrough)
* Skill: [`skills/full-stack-typescript-engineering/SKILL.md`](../../skills/full-stack-typescript-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Extend `web/src/hooks/useBetSlip.ts` and `api-client.ts` to support `POST /api/v1/convert`.
* Implement UI components in `web/src/components/`:
  * `ConvertActionBar.tsx`: "Convert / Re-Encode Bet" button, loading state during conversion, and generated code display with 1-click copy-to-clipboard button.
  * `CodeComparisonBadge.tsx`: Visual comparison highlighting `Original Code` vs `New Generated Code`.
  * `VerificationGuideModal.tsx`: Step-by-step instructions showing how to load the new code in `https://www.betway.com.ng`, with direct outbound link button and live verification tips.
* Integrate components into `web/src/app/page.tsx`.
* Add component tests verifying Convert button interaction and copy toast triggers.

---

## 4. Non-Goals

* Do not deploy to Vercel yet (deferred to T020).
* Do not modify backend API routes (already completed in T014).

---

## 5. Acceptance Criteria

1. Clicking "Convert" sends `POST /api/v1/convert` and receives a new valid Betway booking code.
2. The UI displays both original and newly generated booking codes with copy-to-clipboard buttons.
3. Verification Guide modal opens with clear instructions and direct link to `https://www.betway.com.ng`.
4. Responsive design renders cleanly across desktop and mobile screen viewports.
5. All component tests and production build (`npm run build`) pass with zero errors.

---

## 6. Verification Plan

* `cd web && npm run test`
* `cd web && npm run build`
* Manual verification in browser (`npm run dev`).

---

## 7. STOP CONDITION

Stop immediately once the conversion panel, comparison badge, and verification modal are implemented, tested, and committed. Do not start T017.
