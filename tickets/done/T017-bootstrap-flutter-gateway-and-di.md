# T017 — Bootstrap Flutter Project, Domain Gateway & DI

* **Owner**: Flutter Engineer
* **Status**: DONE
* **Branch**: `ticket/T017-bootstrap-flutter-gateway-and-di`
* **Depends on**: T014

---

## 1. Objective

Initialize the Flutter mobile project under `mobile/`, configure Dio and Retrofit (`SlipRestClient`), define the canonical Dart domain models (`BetSlip`, `BetSelection`) and `SlipGateway` abstraction, implement `SlipRemoteGateway`, and wire the centralized `GetIt` Dependency Injection composition root.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 10)
* Invariants: `INV-01` (No direct Betway calls), `INV-03` (Consistent backend API contract), `INV-07` (SOLID Flutter boundary)
* Skill: [`skills/flutter-engineering/SKILL.md`](../../skills/flutter-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Initialize `mobile/` using `flutter create --org com.stellarlogic.betway mobile`.
* Configure `pubspec.yaml` with required dependencies: `dio`, `retrofit`, `retrofit_generator`, `build_runner`, `json_annotation`, `json_serializable`, `get_it`, `flutter_lints`, `mocktail`, `flutter_test`.
* Implement domain models in `mobile/lib/domain/models/`:
  * `bet_slip.dart`: Immutable canonical `BetSlip` model.
  * `bet_selection.dart`: Immutable canonical `BetSelection` model.
  * `app_error.dart`: Domain error taxonomy.
* Define `mobile/lib/domain/gateways/slip_gateway.dart` (`abstract interface class SlipGateway`).
* Implement infrastructure in `mobile/lib/infrastructure/`:
  * `api/slip_rest_client.dart`: Typed Retrofit client (`POST /api/v1/resolve`).
  * `gateways/slip_remote_gateway.dart`: Implements `SlipGateway`, handling Dio timeouts and DTO mapping.
* Implement centralized DI in `mobile/lib/di/injection.dart` using `GetIt`.
* Write unit tests in `mobile/test/infrastructure/` verifying `SlipRemoteGateway` response parsing and error handling using mock HTTP adapters.

---

## 4. Non-Goals

* Do not build Cubit state or UI widgets yet (deferred to T018, T019).
* Do not build APK yet (deferred to T021).

---

## 5. Acceptance Criteria

1. `mobile/` project compiles cleanly with `flutter analyze` passing (0 errors, 0 warnings).
2. `SlipGateway` abstraction is fully decoupled from Dio and Retrofit.
3. `SlipRemoteGateway` correctly maps `/api/v1/resolve` responses into canonical `BetSlip` instances.
4. `mobile/lib/di/injection.dart` centralizes all dependency instantiation (`Dio` → `SlipRestClient` → `SlipRemoteGateway`).
5. Unit tests for gateway and model parsing pass 100% in `flutter test`.

---

## 6. Verification Plan

* `cd mobile && flutter analyze`
* `cd mobile && flutter test`
* `cd mobile && dart format --output=none --set-exit-if-changed .`

---

## 7. STOP CONDITION

Stop immediately once the Flutter project, domain models, gateway abstraction, Dio/Retrofit implementation, and DI composition root are tested and committed. Do not start T018.

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): Flutter client strictly invokes backend route `/api/v1/resolve` via `SlipRestClient`; no external Betway URLs or endpoints referenced.
  - `INV-02` (Canonical Models / Zero DTO Leakage): Domain models `BetSlip` and `BetSelection` remain pure, immutable, and decoupled from network serialization internals.
  - `INV-03` (Consistent API Contract for Web & Flutter): Consumes the standardized JSON envelope `POST /api/v1/resolve` matching Next.js backend expectations.
  - `INV-07` (Centralized DI Composition Root): Centralized `GetIt` container in `mobile/lib/di/injection.dart` decouples domain abstractions (`SlipGateway`) from concrete infrastructure implementations (`SlipRemoteGateway`, `SlipRestClient`, `Dio`).

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - `flutter analyze`: Passed with 0 issues/warnings across entire `mobile/` workspace.
  - `dart format --output=none --set-exit-if-changed .`: Passed with 0 formatting discrepancies.
  - `flutter test`: 38 unit tests passing (100% pass rate across domain models, app error taxonomy, and `SlipRemoteGateway` mock HTTP response/error parsing).

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 5 acceptance criteria satisfied (clean compilation, decoupled `SlipGateway`, response mapping, centralized GetIt DI, 100% passing tests).
- [x] 2. Quality Gates: `flutter analyze`, `dart format`, and `flutter test` pass with 0 errors/warnings.
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-02`, `INV-03`, and `INV-07` strictly preserved.
- [x] 5. QA Verification: Runtime behavior, JSON mapping, error translation, and network timeout handling verified with Mocktail and MockAdapter.
- [x] 6. Documentation: Architecture references and ticket registry updated.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards on ticket branch.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved packages, no premature Cubit/UI widget development (deferred to T018 and T019).
