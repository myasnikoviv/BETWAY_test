# T019 — Implement Flutter Slip Viewer Screen & Widget Tests

* **Owner**: Flutter Engineer
* **Status**: DONE
* **Branch**: `ticket/T019-implement-flutter-slip-viewer-screen`
* **Depends on**: T018

---

## 1. Objective

Implement the single-screen Flutter slip viewer (`mobile/lib/presentation/screens/slip_viewer_screen.dart`), decomposed into small, reusable widgets (`BookingCodeInput`, `SelectionCard`, `OddsSummaryCard`, `StateFeedbackView`), with widget tests verifying rendering across all states.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 10)
* Requirements: `FR-06` (Flutter Slip View)
* Skill: [`skills/flutter-engineering/SKILL.md`](../../skills/flutter-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Implement decomposed UI widgets in `mobile/lib/presentation/widgets/`:
  * `booking_code_input.dart`: Clean text field, paste helper, and Decode button dispatching `cubit.resolveBookingCode()`.
  * `selection_card.dart`: Match name, league/sport badge, market title, outcome name, and decimal odds chip.
  * `odds_summary_card.dart`: Cumulative total odds calculation and selection count.
  * `state_feedback_view.dart`: Loading indicator, empty initial placeholder, and user-friendly error view with Retry button.
* Assemble `mobile/lib/presentation/screens/slip_viewer_screen.dart` using `BlocBuilder<SlipCubit, SlipState>`.
* Set up `mobile/lib/main.dart` with application theme and `BlocProvider` providing `sl<SlipCubit>()`.
* Write widget tests in `mobile/test/presentation/screens/slip_viewer_screen_test.dart`:
  * Verifies rendering of initial input state.
  * Verifies rendering of loading indicator when `SlipLoading` is emitted.
  * Verifies rendering of all selection cards and total odds when `SlipSuccess` is emitted.
  * Verifies error message and retry button when `SlipError` is emitted.

---

## 4. Non-Goals

* Do not introduce multi-screen routing or navigation stacks (single-screen assessment scope).
* Do not build release APK yet (deferred to T021).

---

## 5. Acceptance Criteria

1. UI strictly renders `SlipState` and dispatches intents to `SlipCubit` with zero direct networking logic in widgets.
2. Layout is responsive and handles long match names/market titles without pixel overflow (`ListView`).
3. Clean theme and visual hierarchy consistent with the Web product.
4. Widget tests cover `initial`, `loading`, `success`, and `error` states using mock Cubit (`BlocProvider.value`).
5. `flutter analyze` and `flutter test` pass 100% with zero warnings.

---

## 6. Verification Plan

* `cd mobile && flutter test`
* `cd mobile && flutter analyze`
* `cd mobile && dart format --output=none --set-exit-if-changed .`

---

## 7. STOP CONDITION

Stop immediately once the Flutter slip viewer screen and widget tests are complete, verified, and committed. Do not start T020.

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): Mobile presentation and widget layers communicate solely via `SlipCubit` / `SlipGateway`; zero direct Betway API references.
  - `INV-02` (Canonical Models): `SelectionCard`, `OddsSummaryCard`, and `SlipViewerScreen` render canonical `BetSlip` and `BetSelection` domain models.
  - `INV-07` (SOLID & Dependency Inversion): UI widgets depend strictly on immutable `SlipState` and dispatch intents to `SlipCubit` via `BlocBuilder` / `BlocProvider`; no networking logic in widgets.

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - `flutter analyze`: Passed with 0 issues/warnings across `mobile/`.
  - `dart format --output=none --set-exit-if-changed .`: Passed with 0 formatting issues.
  - `flutter test`: 81 unit, BLoC, and widget tests passing (100% pass rate).
  - Decomposed widget rendering and user interaction verified across all 4 states (`SlipInitial`, `SlipLoading`, `SlipSuccess`, `SlipError`) in `slip_viewer_screen_test.dart`, `booking_code_input_test.dart`, `selection_card_test.dart`, `odds_summary_card_test.dart`, and `state_feedback_view_test.dart`.

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 5 acceptance criteria satisfied (pure state-driven UI, responsive scrollable layout, cohesive green/dark theme, complete widget test coverage across all states, 100% passing quality gates).
- [x] 2. Quality Gates: `flutter analyze`, `dart format`, and `flutter test` pass with 0 errors/warnings (81/81 tests passing).
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-02`, and `INV-07` strictly preserved.
- [x] 5. QA Verification: Runtime behavior, state transitions, clipboard pasting, error retry, and odds summary verified with comprehensive widget test suites.
- [x] 6. Documentation: Architecture references and ticket registry updated.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards on ticket branch.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved packages, single-screen scope maintained, release APK packaging deferred to T021.
