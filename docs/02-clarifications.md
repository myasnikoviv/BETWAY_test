# Assessment Clarifications & Confirmed Decisions

This document records the official clarifications and agreed parameters established with the assessment team.

---

## 1. Betway Integration Nature
* **No Official API / Sandbox**: There is no official public developer API, developer sandbox, API documentation, or provided test credentials.
* **Public Reverse-Engineering**: Interfacing directly with the public Betway Nigeria website (`betway.com.ng`) is intentionally designed as part of the assessment challenge.

---

## 2. Create Flow Scope
* **No Event Catalogue Required**: Building a full sportsbook event/market browser is **not required**.
* **Input Modality**: Accepting structured selection identifiers (or reusing a previously resolved slip's selections) is sufficient to satisfy the booking code creation requirement.

---

## 3. Convert Flow
* **Definition**: Ingest an existing Betway booking code/slip and emit a new Betway booking code representing the identical underlying bet.
* **Architectural Freedom**: The technical implementation strategy (e.g. resolve → canonical model → re-encode) is entirely left to the candidate.

---

## 4. Verification Strategy
* **Manual Verification**: Manual verification during the 5-minute Loom video walkthrough (loading generated/converted codes in the live Betway Nigeria website) is fully acceptable.
* **No Headless Automation Required**: Automated browser test suites (e.g. Playwright/Selenium against Betway UI) are **not required**.

---

## 5. Flutter Scope
* **Single Screen View**: The Flutter scope is explicitly limited to a rough, single-screen slip viewer that displays the resolved bet slip.
* **Distribution**: Android APK distributed via Firebase App Distribution, accompanied by a short descriptive note outlining the iOS IPA distribution path.
