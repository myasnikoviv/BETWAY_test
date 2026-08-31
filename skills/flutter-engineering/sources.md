# Flutter Engineering Skill Provenance & Research Log

This document records the external Flutter and Dart agent skills and architectural guidelines researched during the bootstrapping and refinement of the project-local `flutter-engineering` skill.

---

## 1. Researched Sources Summary

| Source / Repository | Type | Inspected Topics | Adoption Decision |
| :--- | :--- | :--- | :--- |
| **`dart-lang/skills`** ([github.com/dart-lang/skills](https://github.com/dart-lang/skills)) | Official Dart | Unit testing, static analysis, error diagnostics | **Adopted core testing & static analysis rules** |
| **`flutter/agent-plugins`** ([github.com/flutter/agent-plugins](https://github.com/flutter/agent-plugins)) | Official Flutter | HTTP networking, JSON serialization, widget testing, architecture practices | **Adopted testing & declarative patterns** |
| **`flutter-conventions-best-practices`** ([mcpmarket.com/tools/skills/flutter-conventions-best-practices](https://mcpmarket.com/tools/skills/flutter-conventions-best-practices)) | Third-Party | SOLID principles, BLoC/Cubit, Retrofit/Dio, Dependency Injection | **Adopted SOLID baseline with domain gateway abstraction and DI** |

---

## 2. Architectural Decisions & Principle Adoption

### 2.1 State Management: BLoC / Cubit
* **Adopted**: `flutter_bloc` with `Cubit` as the primary presentation-state manager. Cubit provides predictable, testable state transitions (`SlipInitial`, `SlipLoading`, `SlipSuccess`, `SlipError`) without the verbose event-boilerplate of full BLoC where simple intent-to-state mapping suffices.
* **Correction from T005**: Replaced `ChangeNotifier`/`ValueNotifier` with `Cubit` to guarantee explicit immutable state modeling and enable `bloc_test` fixture-based testing.

### 2.2 Domain Boundary: Gateway Abstraction (DIP & ISP)
* **Adopted**: `abstract interface class SlipGateway` decouples the presentation layer (`SlipCubit`) from transport details.
* **Rationale**: Enforces the Dependency Inversion Principle (DIP) and Interface Segregation Principle (ISP), enabling easy mocking during unit/widget tests while avoiding redundant use-case / repository wrapping.

### 2.3 Transport & Infrastructure: Dio + Retrofit
* **Adopted**: `package:dio` with `package:retrofit` for type-safe REST endpoint declarations, automated JSON header management, and interceptor-based logging/error mapping.
* **Correction from T005**: Replaced bare `package:http` with `Dio` + `Retrofit` to provide structured, typed API interaction and resilient timeout handling.

### 2.4 Centralized Dependency Injection (DI)
* **Adopted**: Mandatory centralized composition root via `package:get_it`.
* **Rationale**: Decouples component construction from usage. Widgets and Cubits never instantiate dependencies ad hoc.

---

## 3. Deliberately Rejected Over-Engineering
* **Redundant Use Cases & Repository Layers**: Introducing separate `ResolveSlipUseCase`, `BetSlipRepository`, and `BetSlipRemoteDataSource` classes for a single endpoint adds empty indirection. The `SlipGateway` abstraction fully achieves DIP and testability without ceremonial file bloat.
* **Local Persistence (DB)**: No SQLite/Hive/SharedPreferences is introduced (`INV-04`), preserving a clean stateless mobile architecture.
