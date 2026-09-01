# T021 — Build Android APK & Configure Firebase App Distribution

* **Owner**: Flutter Engineer
* **Status**: IMPLEMENTED
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
