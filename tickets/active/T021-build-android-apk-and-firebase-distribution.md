# T021 — Build Android APK & Complete Firebase App Distribution Upload

* **Owner**: Flutter Engineer
* **Status**: IN_PROGRESS
* **Branch**: `ticket/T021-firebase-app-distribution-upload`
* **Depends on**: T019, T020

---

## 1. Objective

Build the release Android APK (`app-release.apk`) configured to query the live Vercel backend API, execute actual Firebase project/app setup and Firebase App Distribution APK upload for tester delivery, and maintain the iOS IPA distribution documentation in `docs/07-ios-ipa-distribution.md`.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 10)
* Requirements: `NFR-07` (Firebase App Distribution & iOS IPA note)
* Skill: [`skills/flutter-engineering/SKILL.md`](../../skills/flutter-engineering/SKILL.md)

---

## 3. Scope & Deliverables

* Configure production backend URL in Flutter DI (`lib/di/injection.dart`) pointing to the live Vercel deployment URL.
* Build release Android APK (`cd mobile && flutter build apk --release`).
* Set up/configure Firebase Project & Android App (via Firebase CLI / Console / Fastlane / Gradle distribution plugin).
* Upload release APK to Firebase App Distribution with tester group / distribution configuration.
* Provide and verify live Firebase App Distribution invitation / download links and instructions in `mobile/README.md`.
* Maintain [`docs/07-ios-ipa-distribution.md`](../../docs/07-ios-ipa-distribution.md) detailing the iOS IPA distribution workflow (Apple Developer Account, Ad-Hoc / TestFlight provisioning profile, Fastlane `gym` export).
* Update `mobile/README.md` with complete installation, Firebase distribution access links, and verification instructions.

---

## 4. Non-Goals

* Do not perform final Loom walkthrough recording yet (handled in T022).

---

## 5. Acceptance Criteria

1. Android APK compiles cleanly in release mode (`app-release.apk`).
2. Release APK resolves booking codes against the live Vercel backend over HTTPS.
3. Firebase Project & Android App configured, and release APK is successfully uploaded to Firebase App Distribution with active tester access and download/invitation links verified.
4. `docs/07-ios-ipa-distribution.md` clearly explains the iOS IPA build and distribution steps.

---

## 6. Verification Plan

* `cd mobile && flutter build apk --release`
* Execute Firebase App Distribution upload command / pipeline and verify successful upload artifact and release note.
* Verify APK loading and API response against live Vercel backend.
* Automated quality gates: `dart format`, `flutter analyze`, `flutter test`.

---

## 7. STOP CONDITION

Stop immediately once the APK is built, uploaded to Firebase App Distribution, documentation is updated with live links/instructions, and local quality gates pass. Do not start T022.
