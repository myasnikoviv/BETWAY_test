# T019 — Implement Flutter Slip Viewer Screen & Widget Tests

* **Owner**: Flutter Engineer
* **Status**: IMPLEMENTED
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
