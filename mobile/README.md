# Betway Nigeria Booking Code — Flutter Mobile Client

A high-performance, single-screen Flutter application providing mobile bet slip decoding and odds inspection for Betway Nigeria booking codes, adhering strictly to SOLID principles, BLoC/Cubit state management, and clear architectural boundaries.

---

## 1. Architectural Architecture & Design Principles

The mobile client is built strictly against the system architecture defined in [`docs/architecture/02-application-architecture.md`](../docs/architecture/02-application-architecture.md):

```mermaid
graph TD
    UI["Flutter Presentation Layer<br/>(SlipViewerScreen, SelectionCard, OddsSummaryCard)"]
    Cubit["BLoC / Cubit (SlipCubit)<br/>(Initial, Loading, Success, Error)"]
    GatewayInterface["Domain Gateway Abstraction<br/>(SlipGateway)"]
    GatewayImpl["Infrastructure Gateway<br/>(SlipRemoteGateway)"]
    Client["HTTP Infrastructure<br/>(SlipRestClient & Dio)"]
    Backend["Vercel Backend API<br/>(/api/v1/resolve)"]

    UI -->|Dispatches code / Renders state| Cubit
    Cubit -->|Calls abstraction (DIP)| GatewayInterface
    GatewayImpl -.->|Implements| GatewayInterface
    GatewayImpl -->|Invokes| Client
    Client -->|HTTPS POST| Backend
```

### Architectural Guardrails
* **INV-01 (Backend Mediation)**: The mobile client **never** queries Betway Nigeria directly. All network traffic routes through our `/api/v1/resolve` backend.
* **INV-02 (Canonical Models)**: Presentation and state layers consume clean domain models (`BetSlip`, `BetSelection`), completely decoupled from external Betway DTO formats.
* **Dependency Inversion Principle (DIP)**: `SlipCubit` depends strictly on the `SlipGateway` interface, never on Dio or concrete HTTP clients.
* **Centralized Dependency Injection**: All object instantiation is configured in the GetIt composition root at [`lib/di/injection.dart`](lib/di/injection.dart).

---

## 2. API Configuration & Environment Overrides

The application targets the live production Vercel backend by default:
* **Default Production URL**: `https://betway-nigeria-booking-code.vercel.app`

### Runtime Environment Overrides
To target a local or custom backend, pass `--dart-define=API_BASE_URL=...` at build or run time:

```bash
# Run on Android Emulator targeting local Next.js server (http://10.0.2.2:3000)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000

# Run on iOS Simulator or Desktop targeting localhost:3000
flutter run --dart-define=API_BASE_URL=http://localhost:3000

# Run targeting production deployment
flutter run
```

---

## 3. Building the Release Android APK

### 3.1 Standard Production Build
Compile the release APK pointing to the default production Vercel backend:

```bash
cd mobile
flutter build apk --release
```

### 3.2 Custom Environment Build
To build a release APK pointing to a specific backend endpoint:

```bash
cd mobile
flutter build apk --release --dart-define=API_BASE_URL=https://betway-nigeria-booking-code.vercel.app
```

### 3.3 Output Artifact
Upon successful build, the release APK binary is generated at:
* **Artifact Path**: `mobile/build/app/outputs/flutter-apk/app-release.apk`

---

## 4. Installing on Android Device or Emulator (ADB)

To install the release APK onto a connected physical Android device or running emulator:

```bash
# 1. Verify connected device
adb devices

# 2. Install (or reinstall with -r to preserve app data)
adb install -r build/app/outputs/flutter-apk/app-release.apk

# 3. Launch application directly
adb shell am start -n com.example.mobile/.MainActivity
```

---

## 5. Firebase App Distribution

Firebase App Distribution provides rapid over-the-air distribution of test builds to QA engineers and stakeholders.

### 5.1 CLI Upload & Distribution
Ensure the Firebase CLI is installed and authenticated:

```bash
# 1. Install & Login
npm install -g firebase-tools
firebase login

# 2. Distribute APK to tester groups
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk \
  --app <FIREBASE_APP_ID> \
  --groups "qa-testers, stakeholders" \
  --release-notes "Release candidate v1.0.0 pointing to live Vercel backend"
```

### 5.2 Tester Onboarding Flow
1. **Invitation**: Testers receive an email invite from Firebase App Distribution.
2. **App Tester Client**: Testers accept the invite and install the **Firebase App Tester** app on their Android device.
3. **One-Tap Updates**: Subsequent release builds uploaded via CLI/CI are delivered with automatic in-app update notifications.

---

## 6. iOS Distribution Pathway

For detailed technical guidance, code signing architecture, Fastlane automation, and TestFlight distribution for iOS, refer to the dedicated guide:
* 📄 [`docs/07-ios-ipa-distribution.md`](../docs/07-ios-ipa-distribution.md)

---

## 7. Quality Gates & Test Execution

Run the complete local verification suite:

```bash
# 1. Formatting check
dart format --output=none --set-exit-if-changed .

# 2. Static analysis (0 errors, 0 warnings)
flutter analyze

# 3. Unit and Widget test suite
flutter test
```
