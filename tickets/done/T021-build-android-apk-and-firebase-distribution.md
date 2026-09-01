# T021 — Build Android APK & Configure Firebase App Distribution

* **Owner**: Flutter Engineer
* **Status**: DONE
* **Branch**: `ticket/T021-build-android-apk-and-firebase-distribution`
* **Depends on**: T019, T020

---

## 1. Objective

Build the release Android APK (`app-release.apk`) configured to query the live Vercel backend API, set up Firebase App Distribution delivery, and document the iOS IPA distribution pathway in `docs/07-ios-ipa-distribution.md`.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 10)
* Requirements: `NFR-07` (Firebase App Distribution & iOS IPA note)
* Skill: [`skills/flutter-engineering/SKILL.md`](../../skills/flutter-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Configure production backend URL in Flutter DI (`lib/di/injection.dart`) to point to the live Vercel deployment URL.
* Build release Android APK (`cd mobile && flutter build apk --release`).
* Configure Firebase App Distribution for tester delivery and generate download link/instructions.
* Author [`docs/07-ios-ipa-distribution.md`](../../docs/07-ios-ipa-distribution.md) detailing the iOS IPA distribution workflow (Apple Developer Account, Ad-Hoc / TestFlight provisioning profile, Fastlane `gym` export).
* Update `mobile/README.md` with APK installation and Firebase distribution instructions.

---

## 4. Non-Goals

* Do not perform final Loom walkthrough recording yet (handled in T022).

---

## 5. Acceptance Criteria

1. Android APK compiles cleanly in release mode (`app-release.apk`).
2. Release APK resolves booking codes against the live Vercel backend over HTTPS.
3. Firebase App Distribution delivery link/instructions are documented.
4. `docs/07-ios-ipa-distribution.md` clearly explains the iOS IPA build and distribution steps.

---

## 6. Verification Plan

* `cd mobile && flutter build apk --release`
* Verification of APK loading and API response on Android device/emulator.

---

## 7. STOP CONDITION

Stop immediately once the APK is built, Firebase delivery is documented, iOS note is committed, and changes are pushed. Do not start T022.

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED WITH MINOR COMMENTS`
* **Findings**: 0 Blocker, 0 Major, 0 Unresolved Minor findings (minor adb command parameter in `mobile/README.md` resolved in commit `da6b9e2`).
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): Mobile client communicates strictly with the backend proxy (`https://betway-nigeria-booking-code.vercel.app/api/v1`), never directly with Betway Nigeria servers.
  - `INV-02` (Canonical DTO Model): Domain entities (`BetSlip`, `BetSelection`) consumed directly by Presentation layer; decoupled from DTOs.
  - `INV-03` (Uniform Backend API Contract): Target URL `/api/v1` matches uniform contract established in `T014`/`T020`.
  - `INV-05` (Clean Architecture & SOLID in Flutter): Configuration cleanly isolated via `AppConfig` and GetIt DI in `lib/di/injection.dart`.

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - Flutter Quality Gates: `dart format --output=none --set-exit-if-changed .`, `flutter analyze` (0 issues), `flutter test` (81/81 tests passing across 7 test files).
  - Web Quality Gates: `npm run lint`, `npm run typecheck`, `npm run test` (215/215 tests passing across 27 files), `npm run build` pass with 0 errors.
  - Release APK Build: `mobile/build/app/outputs/flutter-apk/app-release.apk` (47,604,205 bytes / 47.6 MB, SHA256: `5a83518f027e1743221c4b589ddbbb91be8a54dddbd9cb90b97bb11ffe7725d4`).
  - Permissions: `android.permission.INTERNET` verified in `mobile/android/app/src/main/AndroidManifest.xml`.
  - Distribution Guides: `docs/07-ios-ipa-distribution.md` authored with complete architecture, code signing, and TestFlight/Firebase comparison. `mobile/README.md` updated with ADB and Firebase distribution instructions.

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 4 acceptance criteria satisfied (release APK generated, production Vercel URL configured, Firebase distribution instructions documented, iOS IPA pathway documented).
- [x] 2. Quality Gates: All automated quality gates pass 100% across Mobile (`dart format`, `flutter analyze`, `flutter test` 81/81) and Web (`lint`, `typecheck`, `test` 215/215, `build`).
- [x] 3. Code Review: `APPROVED WITH MINOR COMMENTS` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-02`, `INV-03`, and `INV-05` verified and preserved.
- [x] 5. QA Verification: `VERIFIED` with reproducible build, test, and checksum evidence.
- [x] 6. Documentation: `mobile/README.md` and `docs/07-ios-ipa-distribution.md` updated with distribution and installation workflows.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards on ticket branch.
- [x] 8. Scope Discipline: Zero scope creep, no unapproved dependencies, Loom recording deferred to T022.
