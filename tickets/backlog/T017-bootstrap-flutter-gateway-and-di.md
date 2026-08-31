# T017 — Bootstrap Flutter Project, Domain Gateway & DI

* **Owner**: Flutter Engineer
* **Status**: READY
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
