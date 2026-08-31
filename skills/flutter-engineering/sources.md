# Flutter Engineering Skill Provenance & Research Log

This document records the external Flutter and Dart agent skills and industry guidelines researched during the bootstrapping of the project-local `flutter-engineering` skill.

---

## 1. Researched Sources Summary

| Source / Repository | Type | Inspected Topics | Adoption Decision |
| :--- | :--- | :--- | :--- |
| **`dart-lang/skills`** ([github.com/dart-lang/skills](https://github.com/dart-lang/skills)) | Official Dart | Unit testing, static analysis, error diagnostics | **Adopted core testing & analysis rules** |
| **`flutter/agent-plugins`** ([github.com/flutter/agent-plugins](https://github.com/flutter/agent-plugins)) | Official Flutter | HTTP networking, JSON serialization, widget testing, architecture practices | **Adopted lightweight patterns; rejected code-gen boilerplate** |
| **`flutter-conventions-best-practices`** ([mcpmarket.com/tools/skills/flutter-conventions-best-practices](https://mcpmarket.com/tools/skills/flutter-conventions-best-practices)) | Third-Party | Project structure, widget decomposition, Clean Architecture | **Adopted naming & widget rules; rejected multi-layer Clean Architecture** |

---

## 2. Detailed Research Analysis

### 2.1 Official Dart Skills (`dart-lang/skills`)
* **Inspected Guidelines**:
  * `dart-run-static-analysis`: Enforcing zero warnings/errors via `flutter analyze` / `dart analyze`.
  * `dart-add-unit-test`: Writing deterministic tests using package `test` / `flutter_test`.
* **Adopted Principles**:
  * Mandatory static analysis verification with zero ignored warnings.
  * Deterministic unit testing for model deserialization and API error mapping.
* **Deliberately Excluded**:
  * FFI/native build tool configurations (not required for a pure Flutter web/mobile REST client).

---

### 2.2 Official Flutter Plugins (`flutter/agent-plugins`)
* **Inspected Guidelines**:
  * `flutter-use-http-package`: Idiomatic REST communication using package `http`.
  * `flutter-implement-json-serialization`: Strategies for JSON parsing in Dart (manual vs. `json_serializable` / `freezed`).
  * `flutter-add-widget-test`: Testing widget trees and state transitions.
* **Adopted Principles**:
  * Standard `http` package for backend communication with centralized error envelope parsing.
  * Manual `fromJson` / `toJson` serialization: for a small model surface (`BetSlip`, `BetSelection`), manual mapping is simpler, requires zero code-generation dependencies (`build_runner`), and keeps build times instantaneous.
  * Focused widget tests verifying `loading`, `success`, and `error` states.
* **Deliberately Excluded**:
  * `json_serializable` + `build_runner` code generation (violates YAGNI for 2 small DTOs).

---

### 2.3 Flutter Conventions & Best Practices (`flutter-conventions-best-practices`)
* **Inspected Guidelines**:
  * Feature-first organization vs. layer-first organization.
  * Clean Architecture recommendations (`domain/usecases/`, `domain/repositories/`, `data/datasources/`, `core/di/`).
  * Widget decomposition and `const` optimizations.
* **Adopted Principles**:
  * Dart naming conventions (`snake_case` files, `PascalCase` classes, `camelCase` functions).
  * Widget decomposition into small, single-responsibility components with `const` constructors.
  * Clear separation between networking, model parsing, screen state, and UI rendering.
* **Deliberately Rejected with Rationale**:
  * **Clean Architecture Layers for 1 Screen**: Mandating `domain/usecases/`, `domain/repositories/`, `data/datasources/`, and `core/di/` for a single-screen view introduces excessive ceremony and indirection without adding any testability or maintainability benefits.
  * **Heavy State Management Packages**: Mandating `flutter_bloc` or `flutter_riverpod` for a view with 3 simple states (idle, loading, success/error) adds unnecessary boilerplate. `ChangeNotifier` / `ValueNotifier` or simple controller state is fully sufficient and professionally clean.
