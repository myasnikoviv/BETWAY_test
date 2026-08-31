---
name: flutter-engineering
description: Practical Flutter and Dart engineering guidelines enforcing SOLID principles, BLoC/Cubit state management, domain gateway abstractions, Dio/Retrofit networking, and dependency injection.
---

# Flutter Engineering Skill

This skill defines the technical standards, architectural constraints, and engineering practices for implementing the Flutter client in accordance with SOLID principles and approved system boundaries.

---

## 1. Architectural Baseline & Dependency Flow

The Flutter application strictly enforces a unidirectional dependency hierarchy:

```mermaid
graph TD
    UI["Flutter UI (Screens & Widgets)<br/>Pure Presentation Layer"]
    Cubit["BLoC / Cubit (SlipCubit)<br/>Application & Presentation State"]
    GatewayInterface["Domain Gateway Abstraction (SlipGateway)<br/>abstract interface class"]
    GatewayImpl["Gateway Implementation (SlipRemoteGateway)<br/>DTO & Exception Mapping"]
    RetrofitDio["Infrastructure (SlipRestClient & Dio)<br/>Typed Retrofit API Client"]
    BackendAPI["Our Backend Gateway (/api/v1/*)<br/>Next.js Serverless API"]

    UI -->|dispatches actions / renders state| Cubit
    Cubit -->|calls abstraction (DIP)| GatewayInterface
    GatewayImpl -.->|implements| GatewayInterface
    GatewayImpl -->|executes HTTP| RetrofitDio
    RetrofitDio -->|HTTPS POST| BackendAPI
```

### 1.1 Strict Responsibility Boundaries
* **UI (`screens/`, `widgets/`)**: Renders `SlipState` and captures user interactions.
  * **MUST NOT**: Perform HTTP requests, parse JSON, execute business flows, or catch transport exceptions.
* **State Management (`cubit/`)**: `SlipCubit` manages `SlipState` transitions (`initial`, `loading`, `success`, `error`).
  * **MUST NOT**: Depend directly on Dio, Retrofit, or concrete network clients. Depends strictly on `SlipGateway`.
* **Domain Gateway Abstraction (`domain/gateways/`)**: Declares the feature contract (`SlipGateway`).
* **Infrastructure (`infrastructure/gateways/`)**: Implements `SlipGateway` using typed Retrofit endpoints and Dio. Maps raw transport responses and HTTP exceptions into canonical domain models (`BetSlip`) and domain error types before returning to the Cubit.
* **Composition Root (`di/`)**: Centralizes dependency instantiation and injection.

---

## 2. SOLID Principles in Flutter

The implementation must explicitly uphold the SOLID principles:

* **Single Responsibility Principle (SRP)**:
  * UI is responsible only for rendering.
  * Cubit is responsible only for state coordination.
  * Gateway is responsible only for domain data access.
  * Dio/Retrofit are responsible only for HTTP transport.
* **Open/Closed Principle (OCP)**: Presentation logic is closed to modification but open to extension by depending on `SlipGateway`. Implementations (e.g. `MockSlipGateway` for tests) can be swapped without modifying Cubit or UI code.
* **Liskov Substitution Principle (LSP)**: Any implementation of `SlipGateway` must fulfill the contract without unexpected side effects.
* **Interface Segregation Principle (ISP)**: Abstractions are kept small and feature-specific (`SlipGateway` contains only the operations required by the slip view).
* **Dependency Inversion Principle (DIP)**: High-level modules (`SlipCubit`) depend on abstractions (`SlipGateway`), not low-level transport modules (`Dio`, `SlipRestClient`).

---

## 3. Recommended Directory Structure

Proportional to the single-screen scope while strictly preserving architectural boundaries:

```text
mobile/lib/
├── main.dart                       # Application entry point & theme
├── di/                             # Centralized Dependency Injection
│   └── injection.dart              # Service locator / composition root (GetIt)
├── domain/                         # Canonical Models & Gateway Abstractions
│   ├── models/
│   │   ├── bet_slip.dart
│   │   ├── bet_selection.dart
│   │   └── app_error.dart
│   └── gateways/
│       └── slip_gateway.dart       # abstract interface class SlipGateway
├── infrastructure/                 # Transport & Concrete Implementations
│   ├── api/
│   │   ├── slip_rest_client.dart   # Retrofit typed API declaration
│   │   └── dio_client.dart         # Configured Dio instance (timeouts, interceptors)
│   └── gateways/
│       └── slip_remote_gateway.dart # Implements SlipGateway
└── presentation/                   # UI & State Management
    ├── cubit/
    │   ├── slip_cubit.dart
    │   └── slip_state.dart
    ├── screens/
    │   └── slip_viewer_screen.dart
    └── widgets/
        ├── booking_code_input.dart
        ├── selection_card.dart
        ├── odds_summary_card.dart
        └── state_feedback_view.dart
```

---

## 4. Domain Gateway Abstraction & Models

### 4.1 Gateway Abstraction
```dart
abstract interface class SlipGateway {
  Future<BetSlip> resolve(String bookingCode);
}
```

### 4.2 Canonical Domain Models
* Models are **immutable** and **null-safe**.
* Fields represent canonical domain concepts, not raw Betway schemas.

```dart
class BetSlip {
  final String bookingCode;
  final List<BetSelection> selections;
  final double totalOdds;
  final bool isSingleBet;
  final String createdAt;

  const BetSlip({
    required this.bookingCode,
    required this.selections,
    required this.totalOdds,
    required this.isSingleBet,
    required this.createdAt,
  });
}
```

---

## 5. State Management with BLoC / Cubit

* Use `package:flutter_bloc`.
* Prefer **Cubit** for straightforward intent-to-state flows; use full **BLoC** if event streaming/debouncing is required.

### 5.1 State Modeling
```dart
sealed class SlipState {
  const SlipState();
}

class SlipInitial extends SlipState {
  const SlipInitial();
}

class SlipLoading extends SlipState {
  const SlipLoading();
}

class SlipSuccess extends SlipState {
  final BetSlip slip;
  const SlipSuccess(this.slip);
}

class SlipError extends SlipState {
  final String message;
  final String? code;
  const SlipError(this.message {this.code});
}
```

### 5.2 Cubit Implementation
```dart
class SlipCubit extends Cubit<SlipState> {
  final SlipGateway _slipGateway;

  SlipCubit({required SlipGateway slipGateway})
      : _slipGateway = slipGateway,
        super(const SlipInitial());

  Future<void> resolveBookingCode(String bookingCode) async {
    final trimmed = bookingCode.trim();
    if (trimmed.isEmpty) {
      emit(const SlipError('Please enter a valid booking code.'));
      return;
    }

    emit(const SlipLoading());
    try {
      final slip = await _slipGateway.resolve(trimmed);
      emit(SlipSuccess(slip));
    } on AppError catch (e) {
      emit(SlipError(e.message, code: e.code));
    } catch (e) {
      emit(const SlipError('An unexpected error occurred. Please retry.'));
    }
  }
}
```

---

## 6. Infrastructure: Dio & Retrofit

### 6.1 Retrofit Endpoint Declaration
```dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'slip_rest_client.g.dart';

@RestApi()
abstract class SlipRestClient {
  factory SlipRestClient(Dio dio, {String baseUrl}) = _SlipRestClient;

  @POST('/api/v1/resolve')
  Future<HttpResponse<dynamic>> resolve(@Body() Map<String, dynamic> body);
}
```

### 6.2 Gateway Implementation
`SlipRemoteGateway` invokes `SlipRestClient`, handles Dio errors, and maps JSON DTOs to canonical `BetSlip` instances before returning data to the Cubit:

```dart
class SlipRemoteGateway implements SlipGateway {
  final SlipRestClient _client;

  const SlipRemoteGateway(this._client);

  @override
  Future<BetSlip> resolve(String bookingCode) async {
    try {
      final response = await _client.resolve({'bookingCode': bookingCode});
      return _mapToBetSlip(response.data);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }
}
```

---

## 7. Dependency Injection (DI)

Dependency Injection is **mandatory**. All object construction is centralized in a composition root (`lib/di/injection.dart` using `get_it` or `RepositoryProvider`):

```dart
import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';

final sl = GetIt.instance;

Future<void> setupInjection({String? baseUrl}) async {
  // 1. External / Core
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl ?? 'https://betway-assessment.vercel.app',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
  sl.registerLazySingleton<Dio>(() => dio);

  // 2. REST Client
  sl.registerLazySingleton<SlipRestClient>(() => SlipRestClient(sl<Dio>()));

  // 3. Gateways
  sl.registerLazySingleton<SlipGateway>(() => SlipRemoteGateway(sl<SlipRestClient>()));

  // 4. Cubits
  sl.registerFactory<SlipCubit>(() => SlipCubit(slipGateway: sl<SlipGateway>()));
}
```

* **Rule**: Widgets obtain their Cubit via `BlocProvider(create: (_) => sl<SlipCubit>())` or `context.read<SlipCubit>()`. Widgets and Cubits **never instantiate `new Dio()` or `new SlipRemoteGateway()`**.

---

## 8. Architecture Invariants & Boundaries

* **INV-01**: **Never call Betway directly.** All networking routes to our backend API (`/api/v1/*`).
* **INV-02**: **Never use raw Betway DTO schemas.** Flutter models the canonical contract.
* **INV-03**: **Web and Flutter consume identical contracts.**
* **INV-04**: **No persistent local database.**
* **INV-07 (Flutter SOLID Boundary)**: The UI interacts only with `SlipCubit`; `SlipCubit` interacts only with `SlipGateway`; `Dio`/`Retrofit` are encapsulated in `infrastructure/`.

---

## 9. Testing Guidelines

The architectural separation enables clean, isolated testing at every layer:

1. **BLoC / Cubit Tests (`bloc_test`)**:
   * Test state transitions (`loading` → `success`, `loading` → `error`) by injecting a mock `SlipGateway` (`mocktail` or `mockito`).
   * No HTTP network calls or Dio instances needed.
2. **Gateway Implementation Tests**:
   * Test DTO parsing, successful response mapping, and `DioException` translation using a mock `SlipRestClient` or Dio HTTP adapter.
3. **Widget Tests**:
   * Test UI rendering in `SlipLoading`, `SlipSuccess`, and `SlipError` states using `BlocProvider.value` with a mock `SlipCubit`.
   * No networking or gateway dependencies required in widget tests.
4. **Static Analysis & Quality**:
   * `flutter analyze` must pass with **0 errors and 0 warnings**.
   * `dart format --output=none --set-exit-if-changed .` must pass.
