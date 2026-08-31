---
name: flutter-engineering
description: Practical Flutter and Dart engineering guidelines for lightweight, proportional, and testable mobile client implementations.
---

# Flutter Engineering Skill

This skill defines the technical standards, architectural constraints, and engineering practices for implementing Flutter deliverables within this repository.

---

## 1. Core Principles & Architecture Proportionality

### 1.1 Scope Proportionality (YAGNI)
The Flutter scope for this project is explicitly limited to a **single-screen bet slip viewer** consuming our backend API (`FR-06`, `docs/04-scope-and-boundaries.md`).

* **DO NOT** implement multi-layer Clean Architecture (`domain/usecases/`, `domain/repositories/`, `data/datasources/`, `core/di/`) for a single-screen application.
* **DO NOT** introduce heavy dependency-injection frameworks (`get_it`, `injectable`) or complex code generators (`freezed`, `build_runner`) unless the model surface grows significantly and concretely justifies them.
* **DO** maintain clean, readable separation between:
  1. **Networking / API Access**: Isolated HTTP client calling our backend.
  2. **Model Parsing**: Null-safe, immutable DTO models.
  3. **Screen State**: Simple controller managing `idle`, `loading`, `success`, and `error` states.
  4. **Widget Composition**: Focused, small, and reusable presentation widgets.

### 1.2 Target Directory Layout
A professional, lightweight structure proportional to a single screen:

```text
mobile/lib/
├── main.dart                   # Application entry point & theme
├── api/                        # HTTP client & backend endpoint communication
│   ├── bet_api_client.dart
│   └── api_constants.dart
├── models/                     # Canonical domain models (BetSlip, BetSelection)
│   ├── bet_slip.dart
│   ├── bet_selection.dart
│   └── api_error.dart
├── screens/                    # Top-level screen view
│   └── slip_viewer_screen.dart
└── widgets/                    # Decomposed UI components
    ├── booking_code_input.dart
    ├── selection_card.dart
    ├── odds_summary_card.dart
    └── state_feedback_view.dart
```

---

## 2. Architecture Invariants & Networking Boundary

The Flutter Engineer must strictly enforce the following repository-level architecture invariants:

* **INV-01**: **Never call Betway Nigeria endpoints directly.** All requests must go through our backend API gateway (`/api/v1/*`).
* **INV-02**: **Never use raw Betway DTO schemas.** The Flutter application models only the canonical backend API contract defined in `docs/architecture/02-application-architecture.md`.
* **INV-03**: **Web and Flutter consume identical contracts.** Flutter must serialize/deserialize the same JSON structure as the Web client.
* **INV-04**: **No local persistent storage.** The mobile app is stateless and does not introduce SQLite, Hive, or Shared Preferences.

### 2.1 API Communication
* Use the official `http` package for REST requests.
* Centralize the backend base URL (e.g. `https://<deployed-vercel-domain>/api/v1` or local dev fallback `http://10.0.2.2:3000/api/v1` for Android emulator).
* Enforce request timeouts (e.g. 10 seconds) using `.timeout()`.
* Handle HTTP status codes and parse backend error envelopes (`{ "success": false, "error": { ... } }`).

---

## 3. Canonical Models & JSON Serialization

* Keep models **immutable** and **null-safe**.
* Use explicit, manual `fromJson` and `toJson` methods for lightweight DTOs.
* Provide meaningful fallback values or handle nullable optional fields (`sportId`, `league`, `region`).

```dart
class BetSelection {
  final String eventId;
  final String eventName;
  final String marketId;
  final String marketName;
  final String selectionId;
  final String selectionName;
  final double odds;
  final String? league;

  const BetSelection({
    required this.eventId,
    required this.eventName,
    required this.marketId,
    required this.marketName,
    required this.selectionId,
    required this.selectionName,
    required this.odds,
    this.league,
  });

  factory BetSelection.fromJson(Map<String, dynamic> json) {
    return BetSelection(
      eventId: json['eventId'] as String? ?? '',
      eventName: json['eventName'] as String? ?? '',
      marketId: json['marketId'] as String? ?? '',
      marketName: json['marketName'] as String? ?? '',
      selectionId: json['selectionId'] as String? ?? '',
      selectionName: json['selectionName'] as String? ?? '',
      odds: (json['odds'] as num?)?.toDouble() ?? 1.0,
      league: json['league'] as String?,
    );
  }
}
```

---

## 4. State Management

For a single-screen view, choose the simplest state management mechanism that maintains testability and clean UI reactivity:

* **Recommended**: `ChangeNotifier` or `ValueNotifier` managing an explicit state enum / sealed class:
  * `SlipState.idle`: Ready for user input.
  * `SlipState.loading`: Fetching bet slip from `/api/v1/resolve`.
  * `SlipState.success`: Slip data available (`BetSlip`).
  * `SlipState.error`: Failure occurred with a user-facing error message.
* **Avoid**: Adding heavy external dependencies (BLoC, Riverpod, Redux) unless a multi-screen or persistent requirement emerges.

---

## 5. Widget Design & UI Guidelines

* **Small Composable Widgets**: Break the screen down into discrete components (e.g. `SelectionCard`, `OddsSummaryCard`, `StateFeedbackView`). Avoid monolithic 500-line `build()` methods.
* **`const` Constructors**: Use `const` wherever widget subtrees are immutable to optimize Flutter build performance.
* **Responsive Layout**: Use `ListView.builder` or `SingleChildScrollView` to prevent layout overflow on smaller screens.
* **State Safety**: Verify `mounted` before executing state updates after asynchronous operations in `StatefulWidget` controllers.

---

## 6. Error Handling & User Experience

* Map technical network exceptions (`SocketException`, `TimeoutException`) and API error codes (`BOOKING_CODE_NOT_FOUND`, `INVALID_INPUT`) into clear, actionable messages.
* Provide an immediate **Retry** button in error states.
* Display clear visual indicators (loading spinner) during network operations.

---

## 7. Testing & Quality Standards

Every Flutter implementation ticket must satisfy the following verification steps:

1. **Static Analysis**: `flutter analyze` must pass with **0 errors and 0 warnings**.
2. **Formatting**: `dart format --output=none --set-exit-if-changed .` must pass.
3. **Unit Testing**:
   * Model parsing tests verifying JSON deserialization with valid and missing/null fields.
   * API client tests verifying successful parsing and error handling using a mock HTTP client.
4. **Widget Testing**:
   * Screen widget test verifying rendering in `loading`, `success`, and `error` states.

---

## 8. Dependencies Policy

Add packages to `pubspec.yaml` only when they solve a concrete requirement that cannot be handled cleanly with the Flutter/Dart SDK:
* Standard approved dependencies: `http`, `flutter_lints`.
* Test dependencies: `flutter_test`, `http_mock_adapter` or `mocktail`.
* Reject preemptive utility or architecture packages without an explicit technical need.
