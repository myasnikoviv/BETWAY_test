# T021 — Build Android APK & Complete Firebase App Distribution Upload

* **Owner**: Flutter Engineer
* **Status**: DONE
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

---

## 8. Code & Architecture Review Verdict

* **Reviewer**: Code & Architecture Reviewer
* **Verdict**: `APPROVED`
* **Findings**: 0 Blocker, 0 Major, 0 Minor.
* **Invariant Compliance**:
  - `INV-01` (Direct Betway Prohibition): Mobile client queries the Vercel backend (`/api/v1/resolve`); zero direct calls to Betway.
  - `INV-02` (Canonical Domain Models): Domain layer consumes canonical models (`BetSlip`, `BetSelection`), decoupled from external formats.
  - `INV-03` (Uniform Backend API Contract): Consumes `/api/v1/resolve` matching Web contract.
  - `INV-05` (Zero-Secret Client): Client binary contains no secrets or API keys; Firebase App Distribution authentication handled out-of-band.
  - `INV-06` (Configurable Endpoints): Production Vercel base URL configured in DI with `--dart-define=API_BASE_URL` override support.

---

## 9. QA / Verification Verdict

* **Engineer**: QA / Verification Engineer
* **Verdict**: `VERIFIED`
* **Verification Evidence**:
  - Release APK built successfully (`mobile/build/app/outputs/flutter-apk/app-release.apk`, 21MB).
  - Firebase Project ID: `flutter-dev-395b5`
  - Firebase Android App ID: `1:514619263873:android:01168bcb630c86901bf680`
  - Firebase App Distribution Upload: Exit code `0` via `firebase appdistribution:distribute`.
  - Release ID: `4in8io63t25g8` (Version `1.0.0 (1)`).
  - Tester Invitation: Active invite issued to `myasnikov.iv@gmail.com`.
  - Download / Console Links: Verified active in `mobile/README.md`.
  - Quality gates: `dart format`, `flutter analyze`, and `flutter test` (81/81 tests passing) pass with 0 errors/warnings.
  - Secrets hygiene: 0 committed credentials or secrets.

---

## 10. Definition of Done (DoD) Sign-Off

- [x] 1. Acceptance Criteria: All 4 acceptance criteria satisfied (release APK compiled, Vercel backend integration configured, Firebase Project & App configured with release APK uploaded and tester invited, iOS IPA distribution documented).
- [x] 2. Quality Gates: All automated quality gates pass 100% across Mobile (`dart format`, `flutter analyze`, 81/81 tests) and Web (`npm run lint`, `npm run typecheck`, 215/215 tests, `npm run build`).
- [x] 3. Code Review: `APPROVED` with 0 blocker/major findings.
- [x] 4. Invariants: `INV-01`, `INV-02`, `INV-03`, `INV-05`, and `INV-06` verified and preserved.
- [x] 5. QA Verification: `VERIFIED` with reproducible build, upload, distribution evidence, and tester onboarding links.
- [x] 6. Documentation: `mobile/README.md` and `docs/07-ios-ipa-distribution.md` updated with full release instructions, links, and guides.
- [x] 7. Clean Git State: Atomically committed with conventional commit standards on ticket branch.
- [x] 8. Scope Discipline: Zero scope creep, zero hardcoded credentials, Loom recording deferred to T022.
