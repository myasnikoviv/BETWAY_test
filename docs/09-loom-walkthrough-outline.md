# 5-Minute Loom Walkthrough Script & Presenter Guide

**Target Audience**: Stellar Logic Hiring Team & Technical Leadership  
**Target Role**: Product-Minded Full-Stack Engineer (Node.js / React / Flutter)  
**Total Target Video Duration**: **5:00 minutes** (Strict assessment time limit)  
**Presenter Objective**: Demonstrate full-stack and mobile ownership, explain architectural invariants, dive deep into the trickiest technical decision, and perform live end-to-end verification against `betway.com.ng`.

---

## 0. Presenter Setup & Pre-Recording Checklist

Before clicking **Record** on Loom:

1. **Tab 1 (Public Web App)**: [https://betway-nigeria-booking-code.vercel.app](https://betway-nigeria-booking-code.vercel.app)
2. **Tab 2 (Live Betway Nigeria)**: [https://www.betway.com.ng](https://www.betway.com.ng) (Bet slip section visible on right-hand side or mobile view).
3. **Tab 3 (Firebase Console / Tester Portal)**: [Firebase App Distribution Release Dashboard](https://console.firebase.google.com/project/flutter-dev-395b5/appdistribution/app/android:com.stellarlogic.betway.mobile/releases/4in8io63t25g8?utm_source=firebase-tools)
4. **Window 2 (IDE / Repository)**: VS Code / Cursor open showing `README.md` and `architecture/02-application-architecture.md` (or Mermaid preview).
5. **Window 3 (Android Emulator / Device Screen Mirror)**: Running the Flutter `mobile` app pointing to the live backend.
6. **Sample Codes Ready on Clipboard/Notes**:
   * Multi-bet code: `BW6D7ABCFB` (Premier League accumulator)
   * Alternate code: `BW6D7AB843`

---

## 1. Section-by-Section Script & Timing Breakdown

```text
┌───────────────────────────┬──────────────┬────────────────────────────────────────────────────────┐
│ Section                   │ Timestamp    │ Primary Focus                                          │
├───────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ 1. Introduction & Context │ 0:00 - 0:45  │ Assessment scope, role alignment, high-level approach  │
│ 2. System Architecture    │ 0:45 - 1:45  │ BFF pattern, clean boundaries, invariants (INV-01..06) │
│ 3. The Trickiest Decision │ 1:45 - 2:45  │ Reverse-engineering Betway & Stateless Convert vs DB   │
│ 4. Live Web & Betway Demo │ 2:45 - 4:00  │ Decode, 1-Click Convert, live verify on betway.com.ng  │
│ 5. Flutter Mobile & FAD   │ 4:00 - 4:45  │ BLoC/Cubit, GetIt DI, Android APK on Firebase App Dist │
│ 6. Wrap-up & Engineering  │ 4:45 - 5:00  │ 296 tests, DoD rigor, clean Git history, closeout      │
└───────────────────────────┴──────────────┴────────────────────────────────────────────────────────┘
```

---

### Section 1: Intro & Assessment Challenge (0:00 – 0:45)

* **Visual on Screen**: Browser showing the live web application ([`https://betway-nigeria-booking-code.vercel.app`](https://betway-nigeria-booking-code.vercel.app)) with presenter camera bubble active.
* **What to Show**: The clean, responsive header with the **Stellar Logic Assessment** badge, live status indicators, and the booking code input card.
* **Presenter Script**:
  > *"Hi everyone, I'm excited to present my solution for the technical assessment.*
  > 
  > *The core challenge from the brief was open-ended: build a working product that integrates with Betway Nigeria (`betway.com.ng`) to solve booking code resolution, creation, and 1-click conversion, verify codes on the live Betway platform, provide a public web URL, and deliver a Flutter mobile viewer via Firebase App Distribution.*
  > 
  > *The assessment explicitly allowed full freedom of technology choice: 'UI, backend, and a database if required... using any tools you consider appropriate'.*
  > 
  > *As a product-minded engineer, I approached this by designing a production-grade, unified full-stack architecture tailored specifically to Stellar Logic's primary stack: Next.js, React 19, TypeScript, Node.js, and Flutter."*
* **Key Point to Emphasize**: Clear understanding of the original open assessment brief and product-minded ownership in selecting an optimal modern stack.

---

### Section 2: Strategic Tech Stack & Architectural Design (0:45 – 1:45)

* **Visual on Screen**: Switch to `architecture/02-application-architecture.md` or Mermaid diagram viewer showing the System Architecture diagram.
* **What to Show**: The 3 distinct layers: Client Layer (Web + Flutter), Unified Serverless Backend Gateway (`/api/v1/*`), and External Betway Infrastructure.
* **Presenter Script**:
  > *"Let's examine why I structured the solution this way:*
  > 
  > *1. **Why Next.js 15 on Vercel**: Instead of maintaining separate frontend and backend servers, I chose Next.js 15 (React 19 / TypeScript) as a unified Backend-For-Frontend (BFF). This deploys serverless route handlers on Vercel with zero server management and low edge latency.*
  > 
  > *2. **Why Clean Architecture for Flutter**: For the mobile client, rather than building a quick throwaway prototype, I implemented Clean Architecture using BLoC/Cubit state management, the abstract `SlipGateway` interface, and GetIt dependency injection.*
  > 
  > *3. **Six Non-Negotiable Invariants**:*
  > * **INV-01**: Neither client ever touches Betway directly; all outbound traffic routes through our serverless backend.*
  > * **INV-02 & INV-03**: Both Web and Flutter consume the exact same `/api/v1/*` REST contract with canonical domain models (`BetSlip`, `BetSelection`), isolating our UI from external Betway changes.*
  > * **INV-06**: Betway HTTP calls are isolated behind the `IBetwayGateway` interface, enabling 100% offline, deterministic fixture-based testing."*
* **Key Point to Emphasize**: Intentional architectural choices: Next.js BFF for the web, Clean Architecture + BLoC for Flutter, and strict SOLID boundaries decoupling core domain logic.

---

### Section 3: The Trickiest Technical Decision (1:45 – 2:45)

* **Visual on Screen**: Highlight the `ConvertBookingCodeUseCase` sequence diagram and code in `../web/src/core/use-cases/ConvertBookingCodeUseCase.ts`.
* **What to Show**: The pure composition of `Resolve` + `Create` and the absence of a database layer.
* **Presenter Script**:
  > *"The trickiest technical decision in this project was twofold:*
  > 
  > *1. **Reverse-Engineering Undocumented REST Endpoints**: Betway Nigeria has no public API docs or developer sandbox. Through network forensics, I isolated two anonymous REST endpoints: `FindBookABet` for decoding, and `BookABet` for encoding. Crucially, I discovered that Betway generates odds server-side during creation, meaning we only need to supply structured outcome IDs (`outcomeId`, `marketId`, `eventId`), not price quotes.*
  > 
  > *2. **Stateless 1-Click Convert vs. Database Persistence**: The brief mentioned 'a database if required'. I made the conscious architectural decision **NOT** to introduce a database (`INV-04`). Why? Sports betting odds are inherently volatile. Storing booking codes in a local database risks serving stale odds if match prices shift or fixtures conclude.*
  > 
  > *Instead, our `Convert` use case acts as a pure, stateless composition: it calls `Resolve` against Betway in real time, validates active legs, and immediately calls `Create` to generate a brand-new Betway code. This delivers 100% data freshness, zero database maintenance overhead, and zero synchronization drift."*
* **Key Point to Emphasize**: Product-minded pragmatism (YAGNI) and deep understanding of domain data volatility.

---

### Section 4: Live Web Demonstration & Live Betway Nigeria Verification (2:45 – 4:00)

* **Visual on Screen**: Split-screen or quick tab toggle between the live app ([`betway-nigeria-booking-code.vercel.app`](https://betway-nigeria-booking-code.vercel.app)) and [`betway.com.ng`](https://www.betway.com.ng).
* **Step-by-Step Actions to Perform**:
  1. Click the quick sample chip `BW6D7ABCFB` on the web app.
  2. Click **Decode Slip**.
  3. Show the resolved card: 3 matches (Aston Villa vs Arsenal, Brighton vs Wolves, Fulham vs Crystal Palace), market names, selection names, and cumulative odds (`21.57`).
  4. Click the **1-Click Re-encode & Convert** button.
  5. Watch the conversion badge generate a fresh Betway code (e.g. `BW6D7AC4BA`).
  6. Click the **Copy Code** button (toast confirms clipboard copy).
  7. Switch to the [`betway.com.ng`](https://www.betway.com.ng) tab. Open the Betway Bet Slip drawer, paste the newly generated booking code into their booking code input box, and click **Load Betslip**.
  8. Show that Betway loads the exact same 3 matches with identical markets and odds!
* **Presenter Script**:
  > *"Let's see it live in action on production. I'll select our sample accumulator code `BW6D7ABCFB` and click Decode.*
  > 
  > *Here is the resolved slip: 3 Premier League fixtures with full market details and cumulative odds of 21.57.*
  > 
  > *Now, I'll trigger 1-Click Convert. Notice our backend decodes the live slip, validates the selections, and calls Betway's encoder to issue a fresh code: `BW6D7AC4BA`.*
  > 
  > *Let's copy this new code and head over to the live `betway.com.ng` website. I paste `BW6D7AC4BA` into Betway's own bet slip loader and click Load. As you can see, Betway resolves the exact same 3 matches and odds! Complete round-trip verification verified live."*
* **Key Point to Emphasize**: Live, unmistakable proof that generated codes are 100% valid on the official operator platform.

---

### Section 5: Flutter Mobile Viewer & Firebase App Distribution (4:00 – 4:45)

* **Visual on Screen**: Switch to the running Android Emulator / Flutter Mobile Screen, then briefly show the Firebase Console release tab.
* **Step-by-Step Actions to Perform**:
  1. In the Flutter mobile view, tap the sample chip `BW6D7ABCFB` and tap **Decode**.
  2. Show the smooth loading state and rendered slip UI (fixture cards, market chips, odds summary).
  3. Switch to Firebase App Distribution dashboard showing release `4in8io63t25g8` (Project `flutter-dev-395b5`).
* **Presenter Script**:
  > *"Now let's examine the mobile deliverable. In `mobile/`, I built a single-screen Flutter application adhering to Clean Architecture and SOLID principles:*
  > 
  > *The presentation layer uses BLoC/Cubit (`SlipCubit`), the domain layer defines the abstract `SlipGateway` interface, and the infrastructure layer uses Retrofit and Dio with centralized GetIt dependency injection.*
  > 
  > *Notice that entering a booking code decodes the slip using the exact same `/api/v1/resolve` backend contract.*
  > 
  > *For delivery, the Android release APK (`app-release.apk`) was built and distributed via **Firebase App Distribution** (Project `flutter-dev-395b5`, Release ID `4in8io63t25g8`) with active tester onboarding links. Furthermore, [`07-ios-ipa-distribution.md`](07-ios-ipa-distribution.md) documents the complete iOS IPA pathway via Apple TestFlight and Fastlane."*
* **Key Point to Emphasize**: Clean mobile architecture (DIP, SRP) and real-world mobile CI/CD distribution.

---

### Section 6: Delivery Wrap-up & Engineering Discipline (4:45 – 5:00)

* **Visual on Screen**: Terminal showing test results or root `README.md`.
* **What to Show**: The 296 automated passing tests (215 web + 81 mobile) and clean Git commit log.
* **Presenter Script**:
  > *"To wrap up: the entire repository is backed by 296 passing automated tests with 100% offline determinism, an 8-point Definition of Done across 11 structured ticket workstreams, zero database overhead, and clean Git history.*
  > 
  > *All documentation, live URLs, and test suites are linked in the root README. Thank you for your time, and I look forward to discussing the solution with the Stellar Logic team!"*

---

## 2. Strict Evidence Boundary Reminders (What NOT to Claim)

During the recording, adhere strictly to these verified facts:

| DO Claim (Verified Fact) | DO NOT Claim (Unverified / Excluded) |
| :--- | :--- |
| **DO** claim that `FindBookABet` and `BookABet` are public anonymous REST endpoints verified by network forensics. | **DO NOT** claim Betway provides an official developer API or API documentation. |
| **DO** claim that the conversion workflow is a pure stateless composition of Resolve and Create. | **DO NOT** claim the booking code generator is a deterministic hash (Betway issues different random codes for the same wager). |
| **DO** claim that Android APK release `4in8io63t25g8` is live on Firebase App Distribution. | **DO NOT** claim an iOS IPA is published to the App Store (iOS is documented in `07-ios-ipa-distribution.md`). |
| **DO** claim 296 passing automated unit, integration, and widget tests. | **DO NOT** claim headless automated Playwright tests run against live Betway in CI (excluded per clarification). |

---

## 3. Quick Reference Card for Recording

| Item | Value |
| :--- | :--- |
| **Web Production URL** | `https://betway-nigeria-booking-code.vercel.app` |
| **Backend API Base** | `https://betway-nigeria-booking-code.vercel.app/api/v1` |
| **Sample Code 1 (Accumulator)** | `BW6D7ABCFB` (Aston Villa, Brighton, Fulham) |
| **Sample Code 2 (Alternate)** | `BW6D7AB843` |
| **Firebase Project ID** | `flutter-dev-395b5` |
| **Firebase Release ID** | `4in8io63t25g8` |
| **Total Automated Tests** | **296 tests** (Web: 215 tests / 27 files, Mobile: 81 tests) |
