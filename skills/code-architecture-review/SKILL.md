---
name: code-architecture-review
description: Independent code quality, SOLID boundary audit, architecture invariant verification, and anti-pattern detection for Next.js, TypeScript, and Flutter codebases.
---

# Code & Architecture Review Skill

This skill defines the technical standards, architectural audit protocols, and review criteria for evaluating changes across the Web (`web/`) and Mobile (`mobile/`) codebases.

---

## 1. Review Philosophy & Boundaries

* **Structural & Architectural Focus**: The Reviewer evaluates *how* code is structured, whether it adheres to SOLID principles, and whether boundaries are preserved.
* **Non-Modifying Role**: The Reviewer **never** silently modifies code while acting in review mode. All feedback is delivered as structured findings to the implementing engineer.
* **Separation from QA**:
  * **Code & Architecture Reviewer**: *Is the code well-structured, maintainable, SOLID-compliant, and true to architectural design?*
  * **QA / Verification Engineer**: *Does the system function correctly, pass quality gates, and satisfy acceptance criteria via runtime execution?*

---

## 2. Review Checklist

For every review ticket or pull request, the Reviewer conducts an audit across five key dimensions:

### 2.1 Architecture Invariants Audit (`INV-01` to `INV-06`)
* [ ] **INV-01**: Are Betway endpoints called exclusively through backend gateways? (No direct Betway calls in UI or Route Handlers).
* [ ] **INV-02**: Are Betway raw DTOs completely encapsulated? (Only canonical `BetSlip` / `BetSelection` models exposed to clients).
* [ ] **INV-03**: Do Web and Flutter clients consume the identical `/api/v1/*` backend contracts?
* [ ] **INV-04**: Is the codebase completely free of unapproved databases or persistent storage layers?
* [ ] **INV-05**: Does the `Convert` flow cleanly compose `Resolve` and `Create` primitives without duplicating integration logic?
* [ ] **INV-06**: Is the external Betway integration isolated behind a replaceable interface (`IBetwayGateway` / `SlipGateway`)?

### 2.2 Web & TypeScript Architecture (`web/`)
* [ ] **Thin Route Handlers**: Do Route Handlers (`app/api/v1/*`) delegate domain logic to use cases, performing only input validation (Zod), status mapping, and CORS configuration?
* [ ] **Server vs. Client Boundaries**: Are layouts/pages Server Components by default? Is `'use client'` restricted to leaf interactive components?
* [ ] **Strict Typing**: Is `"strict": true` respected? Are `any`, `!`, and unsafe `as` casts absent?
* [ ] **State Minimalism**: Are React states local and derived without unnecessary global stores (Redux, Zustand)?

### 2.3 Flutter Architecture (`mobile/`)
* [ ] **Presentation Separation (SRP)**: Do widgets only render state and dispatch intents? (No HTTP calls or JSON parsing in UI).
* [ ] **State Management**: Is state managed via `SlipCubit` without complex event boilerplate?
* [ ] **Domain Abstraction (DIP)**: Does `SlipCubit` depend strictly on `SlipGateway` (not Dio/Retrofit)?
* [ ] **Infrastructure & DI**: Are Dio and Retrofit encapsulated in `infrastructure/` and wired via the composition root (`di/injection.dart`)?

### 2.4 Scope Discipline & YAGNI
* [ ] Is the code free of premature enterprise bloat (unneeded command buses, repository wrappers, generic utilities)?
* [ ] Does the change strictly satisfy the ticket scope without unapproved feature additions?

---

## 3. Finding Classifications

Every review comment must be categorized into one of four severity levels:

| Severity | Definition | Approval Impact |
| :--- | :--- | :--- |
| **`BLOCKER`** | Direct invariant breach (`INV-01`–`INV-06`), severe security flaw, broken boundary, or data corruption risk. | **Blocks Approval** (`CHANGES REQUIRED`) |
| **`MAJOR`** | Significant SOLID violation (e.g. DIP breach, fat controller/handler), leaky abstraction, or missing core unit test. | **Blocks Approval** (`CHANGES REQUIRED`) |
| **`MINOR`** | Suboptimal naming, minor code duplication, or non-critical readability improvements. | Allows `APPROVED WITH MINOR COMMENTS` |
| **`SUGGESTION`** | Optional enhancement, idiomatic alternative, or future consideration. | Informational only |

---

## 4. Review Verdicts & Output Format

The review must conclude with one of three official verdicts:
1. **`APPROVED`**: All invariants, SOLID boundaries, and quality standards are fully satisfied.
2. **`APPROVED WITH MINOR COMMENTS`**: Technically sound; minor non-blocking suggestions noted for future cleanup.
3. **`CHANGES REQUIRED`**: One or more `BLOCKER` or `MAJOR` issues must be addressed before proceeding.

### Standard Review Report Template
```markdown
# Code & Architecture Review Report

* **Reviewed Scope**: [web/ / mobile/ / core/]
* **Verdict**: [APPROVED | APPROVED WITH MINOR COMMENTS | CHANGES REQUIRED]

## Summary of Findings
* **Blockers**: [Count]
* **Major**: [Count]
* **Minor**: [Count]
* **Suggestions**: [Count]

---

## Detailed Findings

### [BLOCKER | MAJOR | MINOR | SUGGESTION] — [Issue Title]
* **Location**: `path/to/file.ts:L12-L25`
* **Violated Rule / Invariant**: [e.g. INV-01 / DIP / Thin Route Handler]
* **Description**: [Clear explanation of why this violates architecture]
* **Recommended Remediation**: [Concrete guidance on how to resolve]

---

## Invariant Compliance Checklist
- [x] INV-01: No direct Betway client calls
- [x] INV-02: No raw Betway DTO leakage
- [x] INV-03: Consistent backend API contract
- [x] INV-04: Stateless (no database)
- [x] INV-05: Convert composes Resolve + Create
- [x] INV-06: Isolated Betway gateway interface
```
