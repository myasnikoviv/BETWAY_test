# T018 — Implement Flutter Presentation State (SlipCubit) & Tests

* **Owner**: Flutter Engineer
* **Status**: DONE
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
* `cd mobile && dart format --output=none --set-exit-if-changed .`

---

## 7. STOP CONDITION

Stop immediately once `SlipCubit` and `SlipState` are implemented, `bloc_test` suites pass, and changes are committed. Do not start T019.

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): `SlipCubit` has zero reference to external Betway APIs; interacts exclusively through the `SlipGateway` interface.
  - `INV-02` (Canonical Models): `SlipSuccess` holds immutable canonical `BetSlip` domain model without leaking serialization details.
  - `INV-07` (SOLID & Dependency Inversion): `SlipCubit` strictly relies on constructor-injected `SlipGateway` abstraction; registered as a factory in `mobile/lib/di/injection.dart` with optional test factory override support.

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - `flutter analyze`: Passed with 0 issues/warnings across `mobile/`.
  - `dart format --output=none --set-exit-if-changed .`: Passed with 0 formatting issues.
  - `flutter test`: 53 unit and BLoC tests passing (100% pass rate across domain models, app error taxonomy, `SlipRemoteGateway`, GetIt DI locator, and `SlipCubit` state transitions).
  - State machine transitions verified: `SlipInitial` → `[SlipLoading, SlipSuccess]`, `[SlipError]` on empty/whitespace input (without gateway invocation), `[SlipLoading, SlipError]` on `AppError` (`notFound`, `staleSelections`, `upstreamError`, `networkError`, `invalidInput`, `internal`) and unexpected exceptions, and `reset()` returning to `SlipInitial`.

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 4 acceptance criteria satisfied (clean compilation, pure immutable state hierarchy, decoupled `SlipGateway` constructor injection, 100% passing tests).
- [x] 2. Quality Gates: `flutter analyze`, `dart format`, and `flutter test` pass with 0 errors/warnings.
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-02`, and `INV-07` strictly preserved.
- [x] 5. QA Verification: Runtime behavior, state transitions, whitespace trimming, error code propagation, and locator registration verified with `bloc_test` and `mocktail`.
- [x] 6. Documentation: Architecture references and ticket registry updated.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards on ticket branch.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved packages, no premature UI widget development (deferred to T019).
