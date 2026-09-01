# T018 — Implement Flutter Presentation State (SlipCubit) & Tests

* **Owner**: Flutter Engineer
* **Status**: IMPLEMENTED
* **Branch**: `ticket/T018-implement-flutter-cubit-and-state`
* **Depends on**: T017

---

## 1. Objective

Implement the Flutter presentation state layer using BLoC / Cubit (`SlipCubit` and `SlipState`), managing `initial`, `loading`, `success`, and `error` states, with comprehensive `bloc_test` unit tests using a mocked `SlipGateway`.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 10)
* Invariants: `INV-07` (Cubit depends on SlipGateway abstraction, DIP)
* Skill: [`skills/flutter-engineering/SKILL.md`](../../skills/flutter-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Add `flutter_bloc` and `bloc_test` to `mobile/pubspec.yaml`.
* Implement state classes in `mobile/lib/presentation/cubit/slip_state.dart`:
  * `SlipInitial`, `SlipLoading`, `SlipSuccess(BetSlip slip)`, `SlipError(String message, String? code)`.
* Implement `mobile/lib/presentation/cubit/slip_cubit.dart`:
  * `resolveBookingCode(String bookingCode)` handling whitespace trimming, empty input validation, loading emission, gateway invocation, and error mapping.
* Register `SlipCubit` in `mobile/lib/di/injection.dart`.
* Write unit tests in `mobile/test/presentation/cubit/slip_cubit_test.dart` using `bloc_test` and `mocktail`:
  * Emits `[SlipLoading, SlipSuccess]` when `resolve` succeeds.
  * Emits `[SlipError]` on empty/whitespace input.
  * Emits `[SlipLoading, SlipError]` when `SlipGateway` throws `AppError` or network failure.

---

## 4. Non-Goals

* Do not build screen widgets yet (deferred to T019).
* Do not call concrete network classes from `SlipCubit`.

---

## 5. Acceptance Criteria

1. `SlipCubit` depends strictly on `SlipGateway` interface via constructor injection.
2. `SlipState` represents all four UI lifecycle states immutably.
3. 100% of state transitions are covered by `bloc_test` suites.
4. `flutter analyze` passes with zero warnings.

---

## 6. Verification Plan

* `cd mobile && flutter test`
* `cd mobile && flutter analyze`

---

## 7. STOP CONDITION

Stop immediately once `SlipCubit` and `SlipState` are implemented, `bloc_test` suites pass, and changes are committed. Do not start T019.
