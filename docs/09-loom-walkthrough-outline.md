# 5-Minute Loom Walkthrough Script & Presenter Guide

**Target Audience**: Stellar Logic Hiring Team & Technical Leadership  
**Target Role**: Product-Minded Full-Stack Engineer (Node.js / React / Flutter)  
**Recorded Loom Walkthrough**: [https://www.loom.com/share/ebed64ee0395485aa5a9624fcd4b73b2](https://www.loom.com/share/ebed64ee0395485aa5a9624fcd4b73b2)  
**Total Target Video Duration**: **4:30 – 5:00 minutes** (Strict assessment time limit)  
**Presenter Objective**: Demonstrate full-stack ownership, explain architectural strategy and the trickiest decision, perform live verification on `betway.com.ng`, and showcase the Flutter mobile client and Firebase release.

---

## 0. Presenter Setup (Only 3 Tabs / Windows Needed)

No file opening or IDE code navigation is needed during recording. Keep these 3 tabs open:

1. **Tab 1 (Web App)**: [https://betway-nigeria-booking-code.vercel.app](https://betway-nigeria-booking-code.vercel.app)
2. **Tab 2 (Live Betway Nigeria)**: [https://www.betway.com.ng](https://www.betway.com.ng) (Open Bet Slip / Book-a-Bet input)
3. **Window / Tab 3 (Flutter Mobile & Firebase)**: Running Flutter app on emulator/device + [Firebase App Distribution](https://console.firebase.google.com/project/flutter-dev-395b5/appdistribution/app/android:com.stellarlogic.betway.mobile/releases/4in8io63t25g8?utm_source=firebase-tools)

---

## 1. Timing Breakdown & Presenter Script

```text
┌───────────────────────────┬──────────────┬────────────────────────────────────────────────────────┐
│ Section                   │ Timestamp    │ Focus & On-Screen Action                               │
├───────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ 1. Challenge & Stack      │ 0:00 - 1:00  │ Web UI: Open challenge, Next.js BFF, stateless design  │
│ 2. Architecture & Decision│ 1:00 - 1:45  │ Web UI: BFF mediation, why no database, 6 invariants  │
│ 3. Live Web & Betway Demo │ 1:45 - 3:15  │ Web UI ⇄ betway.com.ng: Decode, 1-Click Convert, Load  │
│ 4. Flutter Mobile & FAD   │ 3:15 - 4:15  │ Mobile Emulator & Firebase: BLoC, APK release, iOS note│
│ 5. Wrap-up & Compliance   │ 4:15 - 4:45  │ Web UI / Terminal: 296 tests, full docs in repo, thanks│
└───────────────────────────┴──────────────┴────────────────────────────────────────────────────────┘
```

---

### Section 1: Intro, Challenge & Strategic Choices (0:00 – 1:00)

* **Visual on Screen**: Browser on our live web app ([`https://betway-nigeria-booking-code.vercel.app`](https://betway-nigeria-booking-code.vercel.app)) with presenter camera bubble.
* **Presenter Script**:
  > *"Hi everyone! I'm presenting my solution for the Stellar Logic Product-Minded Full-Stack Engineer assessment.*
  > 
  > *The brief was open-ended: build a working product that integrates with Betway Nigeria (`betway.com.ng`) to decode, create, and convert booking codes, verify them on the live Betway site, deploy on a public URL, and deliver a Flutter mobile viewer via Firebase App Distribution.*
  > 
  > *The assessment gave complete freedom over technology choices: 'UI, backend, and a database if required... using any tools you consider appropriate'.*
  > 
  > *As a product-minded engineer, I approached this by selecting a cohesive modern stack aligned with Stellar Logic:*
  > * **Next.js 15 (React 19 / TypeScript)** on Vercel as a unified Backend-For-Frontend (BFF);*
  > * **Flutter 3.x with Clean Architecture & BLoC** for mobile;*
  > * And a **100% Stateless Engine** without a database."*

---

### Section 2: Architecture & The Trickiest Decision (1:00 – 1:45)

* **Visual on Screen**: Still on the Web UI (showing the clean layout, live status badges).
* **Presenter Script**:
  > *"Two key architectural decisions define this solution:*
  > 
  > *First, **Unified BFF & Invariants**: Neither the web app nor Flutter mobile client ever talks directly to Betway. Everything routes through our serverless `/api/v1/*` backend, which sanitizes upstream schemas into canonical domain models (`BetSlip`, `BetSelection`).*
  > 
  > *Second, **The Trickiest Decision — Why No Database?** The brief suggested 'a database if required', but in sports betting, odds fluctuate constantly. Caching booking codes in a local database risks serving stale odds. Instead, our `Convert` operation is a pure, real-time stateless composition: it calls `Resolve`, validates active legs, and immediately calls `Create` to generate a fresh Betway code. This guarantees 100% data freshness with zero database cost or sync issues.*
  > 
  > *All detailed Mermaid architecture diagrams, ADRs, and specifications are documented in the repository `docs/` folder."*

---

### Section 3: Live Web Demo & Betway Verification (1:45 – 3:15)

* **Visual on Screen**: Web UI ([`betway-nigeria-booking-code.vercel.app`](https://betway-nigeria-booking-code.vercel.app)) ⇄ `betway.com.ng`.
* **Actions**:
  1. On Web UI, click the sample chip `BW6D7ABCFB` and click **Decode Slip**.
  2. Show the decoded card: Premier League matches, market names, selections, and total odds.
  3. Click **1-Click Re-encode & Convert** → generates a fresh code (e.g. `BW6DCAD773`).
  4. Click **Copy Code**.
  5. Switch to [`betway.com.ng`](https://www.betway.com.ng) tab → open Bet Slip drawer → paste code into Book-a-Bet → click **Load Betslip**.
  6. Point out that Betway resolves the exact same matches, selections, and odds!
* **Presenter Script**:
  > *"Let's see it live on production:*
  > 
  > *I'll select our sample code `BW6D7ABCFB` and click Decode. Here is the resolved slip: Premier League fixtures with market names, selections, and total odds.*
  > 
  > *Now I'll click 1-Click Convert. Our backend decodes the live slip in real time and re-encodes it into a fresh Betway booking code: `BW6DCAD773`.*
  > 
  > *Let's copy this new code and head over to the live `betway.com.ng` website. I paste `BW6DCAD773` into Betway's own bet slip loader and click Load. As you can see, Betway immediately loads the exact same matches and odds! Round-trip verification verified live."*

---

### Section 4: Flutter Mobile Viewer & Firebase App Distribution (3:15 – 4:15)

* **Visual on Screen**: Switch to Flutter Mobile Emulator / Screen, then Firebase Console tab.
* **Actions**:
  1. In Flutter app, tap sample code `BW6D7ABCFB` and tap **Decode**. Show smooth loading and rendered slip.
  2. Switch to Firebase App Distribution dashboard showing release `4in8io63t25g8`.
* **Presenter Script**:
  > *"Next, the mobile deliverable: In `mobile/`, I built a Flutter client structured with Clean Architecture, BLoC/Cubit state management (`SlipCubit`), abstract `SlipGateway`, and GetIt dependency injection.*
  > 
  > *Entering a booking code decodes the slip using the exact same `/api/v1/resolve` backend API.*
  > 
  > *For delivery, the Android release APK was compiled and distributed via **Firebase App Distribution** (Release ID `4in8io63t25g8`, Project `flutter-dev-395b5`) with active tester invitations. The complete iOS IPA distribution path via TestFlight and Fastlane is also fully documented in `docs/07-ios-ipa-distribution.md`."*

---

### Section 5: Wrap-up & Technical Compliance (4:15 – 4:45)

* **Visual on Screen**: Web UI or root README.
* **Presenter Script**:
  > *"To wrap up: 100% of the assessment requirements are delivered across 12 structured ticket milestones (`T011`–`T022`), backed by **296 passing automated tests** (215 Web + 81 Mobile) with 100% offline determinism and clean Git history.*
  > 
  > *Live URLs, diagrams, and documentation are all in the root README. Thank you for your time, and I look forward to discussing the solution with the Stellar Logic team!"*

---

## 2. Quick Reference Summary for Recording

| Item | Value |
| :--- | :--- |
| **Web Production URL** | `https://betway-nigeria-booking-code.vercel.app` |
| **Backend API Base** | `https://betway-nigeria-booking-code.vercel.app/api/v1` |
| **Sample Booking Code** | `BW6D7ABCFB` (Click chip on Web UI) |
| **Betway Live Site** | `https://www.betway.com.ng` (Book-a-Bet) |
| **Firebase Project / Release** | Project `flutter-dev-395b5` / Release `4in8io63t25g8` |
| **Total Automated Tests** | **296 tests passing** (Web: 215, Mobile: 81) |
