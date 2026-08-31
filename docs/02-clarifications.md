# Assessment Clarifications & Confirmed Decisions

This document records the official Q&A exchange and confirmed technical parameters established with the assessment team / CTO.

---

## Official Q&A Record

### 1. Betway Integration

* **Question**:
  > *Is there an official/partner API, sandbox, documentation, or credentials available for resolving and creating Betway Nigeria booking codes, or is discovering and integrating with the endpoints used by the public Betway website intentionally part of the assessment?*
* **Confirmed Answer**:
  > **No official API, sandbox, or credentials. Working from the public Betway NG site is part of the task.**
* **Architectural Impact**:
  * Reverse-engineering public endpoints is an explicit core requirement.
  * Betway integration must be isolated behind an adapter to protect our application from third-party contract volatility.

---

### 2. Create Flow

* **Question**:
  > *For "take user selections and generate a new booking code", should the product allow users to browse Betway events/markets and make selections, or is it sufficient to accept an already structured set of selections / modify a resolved slip?*
* **Confirmed Answer**:
  > **Structured selections or a resolved slip is enough. No full event browser.**
* **Architectural Impact**:
  * No requirement to build or maintain a complex sportsbook catalogue, live event trees, or league navigation.
  * Simple structured input forms or slip modification capabilities completely satisfy the requirement.

---

### 3. Convert Flow

* **Question**:
  > *Could you clarify the expected distinction between Create and Convert? If a booking code can be resolved into a slip and that slip encoded again, should Convert simply compose those two operations, or is a different input/source expected?*
* **Confirmed Answer**:
  > **Existing slip / code → new Betway code for the same bet. How they get there is up to them.**
* **Architectural Impact**:
  * Implementation strategy is left entirely to candidate design.
  * Stateless composition (`Resolve -> Canonical Slip -> Create`) is valid and fully approved.

---

### 4. Verification

* **Question**:
  > *Should verification against Betway be automated as part of the solution (for example, browser automation), or is manually demonstrating generated/converted codes on Betway during the walkthrough sufficient?*
* **Confirmed Answer**:
  > **Show the codes load on Betway during the Loom. Manual is fine.**
* **Architectural Impact**:
  * No need for brittle Playwright / Selenium browser test infrastructure against Betway's live anti-bot/WAF.
  * Manual demonstration in the 5-minute Loom walkthrough satisfies all verification criteria.

---

### 5. Flutter Scope

* **Question**:
  > *The brief mentions a "rough one-screen" Flutter slip view. Should the Flutter build only render the slip, or should any Resolve / Create / Convert functionality also be implemented there?*
* **Confirmed Answer**:
  > **One-screen slip view only. APK via Firebase App Distribution + a note on IPA.**
* **Architectural Impact**:
  * Flutter app is strictly a single-screen viewer rendering the resolved slip DTO.
  * No complex mobile navigation or stateful mobile betting engines needed.
  * Build delivered as an Android APK via Firebase App Distribution with a written note detailing the iOS IPA distribution path.
