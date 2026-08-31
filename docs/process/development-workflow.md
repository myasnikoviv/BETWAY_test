# Repository Development & Delivery Workflow

This document defines the disciplined, ticket-driven development workflow, ticket lifecycle, agent handoff pipeline, Git branching strategy, and Definition of Done for this repository.

---

## 1. Ticket Lifecycle

Every implementation task moves through a formal, structured lifecycle:

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> READY: Spec & Acceptance Defined
    READY --> IN_PROGRESS: Implementation Assigned
    IN_PROGRESS --> IMPLEMENTED: Quality Gates Pass
    IN_PROGRESS --> BLOCKED: Architecture / External Blocker
    BLOCKED --> IN_PROGRESS: Blocker Resolved
    IMPLEMENTED --> REVIEW: Handed to Reviewer
    REVIEW --> CHANGES_REQUIRED: Blocker / Major Finding
    CHANGES_REQUIRED --> IN_PROGRESS: Rework by Engineer
    REVIEW --> QA: Review Approved
    QA --> CHANGES_REQUIRED: QA Verification Failed
    QA --> DONE: Verified & DoD Met
    DONE --> [*]
```

### State Definitions

| State | Responsible Agent | Definition & Exit Criteria |
| :--- | :--- | :--- |
| **`DRAFT`** | Project Manager / Architect | Ticket objectives, context, scope, and non-goals are being drafted. |
| **`READY`** | Project Manager | Ticket is fully specified with clear acceptance criteria, references, and a strict `STOP CONDITION`. Ready for assignment. |
| **`IN_PROGRESS`** | Implementation Engineer | Actively being developed by Full-Stack TypeScript Engineer or Flutter Engineer. |
| **`BLOCKED`** | Project Manager / Architect | Work halted due to an unaddressed architectural question or external dependency. |
| **`IMPLEMENTED`** | Implementation Engineer | Code changes complete, local quality gates pass (`lint`, `typecheck`, `test`, `build`), and changes committed to ticket branch. |
| **`REVIEW`** | Code & Architecture Reviewer | Independent structural, SOLID, invariant, and scope audit. |
| **`CHANGES_REQUIRED`** | Implementation Engineer | Rework requested due to `BLOCKER` or `MAJOR` review findings or failed QA. |
| **`QA`** | QA / Verification Engineer | Independent runtime verification against acceptance criteria and quality gates. |
| **`DONE`** | Project Manager | All criteria satisfied, review and QA approved, merged to `main`, and ticket archived. |

---

## 2. Agent Handoff Pipeline

Implementation progresses sequentially through specialized agent boundaries:

```mermaid
graph LR
    PM["1. Project Manager<br/>(Triages & Assigns Ticket)"] 
    --> Eng["2. Implementation Engineer<br/>(Full-Stack or Flutter)"]
    --> Rev["3. Code Reviewer<br/>(SOLID & Invariant Audit)"]
    --> QA["4. QA Engineer<br/>(Acceptance & Test Verification)"]
    --> Done["5. Project Manager<br/>(Validates DoD & Marks DONE)"]

    Rev -.->|CHANGES_REQUIRED| Eng
    QA -.->|CHANGES_REQUIRED| Eng
    Eng -.->|Architecture Question| Arch["System Architect<br/>(ADR / Spec Update)"]
    Arch -.-> Eng
```

### Handoff Rules:
1. **No Silent Handoffs**: Each agent delivers a structured completion report before handing off to the next stage.
2. **Review Before QA**: QA verification begins **only after** the Code Reviewer has issued `APPROVED` or `APPROVED WITH MINOR COMMENTS`.
3. **No Automatic Progression**: Agents **must not** automatically start the next ticket upon completing their current assignment; work is gated by explicit project manager triage.

---

## 3. Standard Ticket Format

All tickets in `tickets/` follow a uniform, concise structure:

```markdown
# [Ticket ID] — [Ticket Title]

* **Owner**: [Full-Stack TypeScript Engineer | Flutter Engineer | System Architect | QA]
* **Status**: [DRAFT | READY | IN_PROGRESS | IMPLEMENTED | REVIEW | QA | DONE]
* **Branch**: `ticket/[Ticket-ID]-[short-name]`

## 1. Objective
[1-2 sentences explaining what this ticket achieves]

## 2. Context & References
* Architectural Spec: `docs/architecture/02-application-architecture.md`
* Relevant Invariants: `INV-01`, `INV-02`, etc.
* Upstream ADRs: `docs/architecture/ADR-0001-stack-selection.md`

## 3. Scope & Deliverables
* [Explicit file or component to create/modify]
* [Concrete deliverable]

## 4. Non-Goals
* [Explicitly excluded scope to prevent creep]

## 5. Acceptance Criteria
1. [Criterion 1]
2. [Criterion 2]

## 6. Verification Plan
* Command checks: `npm run test`, `npm run lint`, etc.
* Manual verification steps if applicable.

## 7. STOP CONDITION
Stop immediately when [exact condition met]. Do not [downstream actions].
```

---

## 4. Git & Branching Workflow

A lightweight, reviewable branching strategy designed for atomic assessment tracking:

```text
main  ───────────────────────────────────────────●───────●─────────►
        \                                       /       /
         \── ticket/T010-core-domain ──────────/       /
          \                                           /
           \── ticket/T011-web-ui ───────────────────/
```

### 4.1 Branching Rules
* **`main` Branch**: Remains clean, stable, and always in a passing state.
* **Feature / Ticket Branches**: Named `ticket/<ticket-id>-<short-name>` (e.g. `ticket/T010-core-domain`, `ticket/T011-flutter-slip-screen`).
* **Short-Lived**: One ticket maps to one short-lived branch.
* **No GitFlow Bloat**: No permanent `develop` branch or complex release branches.

### 4.2 Commit Standards & History
* Commit incrementally while working; Git history is an explicit assessment deliverable (`NFR-05`).
* Use concise conventional commit prefixes:
  * `feat:` for new features or capabilities.
  * `fix:` for bug fixes.
  * `test:` for test suites and fixtures.
  * `docs:` for documentation, ADRs, and specs.
  * `refactor:` for code restructuring without behavioral changes.
  * `chore:` for repository setup, agent definitions, and maintenance.
* **Never Squash Meaningful History**: Maintain a clear chronological record of engineering milestones.

---

## 5. Definition of Done (DoD)

An implementation ticket is considered **`DONE`** only when all of the following conditions are met:

1. **Acceptance Criteria**: All functional and non-functional acceptance criteria defined in the ticket are 100% satisfied.
2. **Quality Gates Passed**:
   * For Web: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass with zero errors/warnings.
   * For Mobile: `flutter analyze`, `dart format`, and `flutter test` pass with zero errors/warnings.
3. **Code Review Approval**: The Code & Architecture Reviewer has issued `APPROVED` or `APPROVED WITH MINOR COMMENTS` (zero unresolved `BLOCKER` or `MAJOR` findings).
4. **Architectural Invariants**: Audited and confirmed compliance with `INV-01` through `INV-06`.
5. **QA Verification**: The QA / Verification Engineer has executed the verification plan and confirmed expected runtime behavior with evidence.
6. **Documentation Updated**: Relevant repository docs or diagrams reflect any changes.
7. **Clean Git State**: Changes are cleanly committed to Git without extraneous untracked files or leftover debug logs.
8. **No Scope Creep**: No unapproved packages, database entities, or out-of-scope features have been introduced.

---

## 6. Ticket Storage Layout

Tickets are tracked directly in the repository under `tickets/`:

```text
tickets/
├── README.md           # Backlog summary and current sprint status
├── backlog/            # Ready or Draft tickets waiting for pickup
├── active/             # Tickets currently IN_PROGRESS, REVIEW, or QA
└── done/               # Completed tickets moved here upon reaching DONE
```
