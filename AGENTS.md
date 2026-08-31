# Agent Instructions & Repository Guidelines

This repository follows a disciplined, ticket-driven engineering workflow. All agents collaborating on this project must adhere to the rules and structures documented below.

---

## 1. Ticket-Driven Multi-Agent Workflow

1. **Strict Scope Discipline**: Work is executed on a per-ticket basis. Agents must never exceed the scope defined in the current ticket prompt.
2. **Explicit Stop Conditions**: Every ticket defines a concrete `STOP CONDITION`. Agents must cease execution immediately once the stop condition is met.
3. **No Premature Implementation**: Do not begin downstream work before upstream tickets are completed and merged to `main`.
4. **Standard Execution Command**: Any ticket can be executed using the standardized prompt:
   ```text
   Execute <Ticket-ID> using the repository multi-agent delivery workflow.
   ```
5. **Multi-Agent Orchestration Protocol**:
   * **Parent Context = Orchestrator Only**: The parent agent **MUST NOT** implement application code, perform code reviews, or run QA verification in the parent context.
   * **Isolated Subagents**: Every workflow phase MUST execute in an independent subagent spawned via `invoke_subagent` with `Workspace: "inherit"`.
   * **Mandatory Role & Skill Loading**: Each subagent MUST explicitly load its role definition (`agents/<role>.md`) and skill (`skills/<skill>/SKILL.md`) before taking action.
   * **Sequential 5-Phase Pipeline**:
     1. **PM Kickoff** (`project_delivery_manager`): Verify prerequisites, switch/create `ticket/<ID>-<name>` branch, move ticket to `tickets/active/`, mark `IN_PROGRESS`, update `tickets/README.md`, commit kickoff.
     2. **Implementation** (`full_stack_typescript_engineer` or `flutter_engineer`): Implement scope, pass all local quality gates, commit changes on ticket branch, mark `IMPLEMENTED`.
     3. **Code & Architecture Review** (`code_architecture_reviewer`): Independent audit of diff, acceptance criteria, SOLID boundaries, and `INV-01`–`INV-06`. Emit verdict (`APPROVED`, `APPROVED WITH MINOR COMMENTS`, or `CHANGES REQUIRED`).
     4. **QA Verification** (`qa_verification_engineer`): Independent execution of automated quality gates and acceptance criteria with reproducible evidence. Emit verdict (`VERIFIED`, `CHANGES REQUIRED`, or `BLOCKED`).
     5. **PM Closeout & Integration** (`project_delivery_manager`): Verify Reviewer and QA sign-offs, conduct 8-point DoD audit, mark `DONE`, move ticket to `tickets/done/`, update `tickets/README.md`, commit closeout, merge ticket branch into `main`, verify `main`, emit closeout report.
   * **Rework Loops**:
     * Reviewer `CHANGES REQUIRED` → Fresh Implementation subagent → Fresh Reviewer subagent.
     * QA `CHANGES REQUIRED` → Fresh Implementation subagent → Fresh Reviewer subagent → Fresh QA subagent.
   * **Architectural Escalation**:
     * Structural/architectural blockers escalate to a separate `System Architect` subagent (`agents/system-architect.md`).
   * **Non-Progression Rule**: Stop immediately when the ticket reaches `DONE` or reports `BLOCKED`. Never automatically proceed to the next ticket.

---

## 2. Repository Layout & Sources of Truth

* **Project Context & Requirements**: Located in [`docs/`](docs/)
  * [`docs/00-assessment-brief.md`](docs/00-assessment-brief.md): Original brief.
  * [`docs/01-requirements.md`](docs/01-requirements.md): Inventory of `FR-*` and `NFR-*` requirements.
  * [`docs/02-clarifications.md`](docs/02-clarifications.md): Confirmed team decisions.
  * [`docs/03-betway-integration-findings.md`](docs/03-betway-integration-findings.md): Verified Betway endpoint contracts.
  * [`docs/04-scope-and-boundaries.md`](docs/04-scope-and-boundaries.md): In-scope vs. out-of-scope boundaries.
  * [`docs/05-open-questions-and-risks.md`](docs/05-open-questions-and-risks.md): Known risks and unverified behaviors.
  * [`docs/06-target-role-and-context.md`](docs/06-target-role-and-context.md): Target role & company context.
  * [`docs/process/development-workflow.md`](docs/process/development-workflow.md): Authoritative delivery lifecycle & orchestration rules.

* **Forensic Spike Artifacts**: Located in [`research/betway/`](research/betway/)
* **Agent Definitions**: Located in [`agents/`](agents/)
* **Local Skills**: Located in [`skills/`](skills/)
* **Ticket Registry**: Located in [`tickets/`](tickets/) (`backlog/`, `active/`, `done/`)

---

## 3. Active Agent Roles

The repository defines specialized agent roles for distinct development phases:

1. **System Architect** ([`agents/system-architect.md`](agents/system-architect.md)): Responsible for system analysis, boundary definition, option formulation, trade-off evaluation, architecture decision records (ADRs), application specifications, and blocker escalation. Uses [`skills/system-architecture/SKILL.md`](skills/system-architecture/SKILL.md).
2. **Project / Delivery Manager** ([`agents/project-delivery-manager.md`](agents/project-delivery-manager.md)): Responsible for ticket authoring, backlog sequencing, kickoff branch management, handoff orchestration, Definition of Done auditing, and merge closeout. Uses [`skills/project-delivery-management/SKILL.md`](skills/project-delivery-management/SKILL.md).
3. **Full-Stack TypeScript Engineer** ([`agents/full-stack-typescript-engineer.md`](agents/full-stack-typescript-engineer.md)): Responsible for implementing, testing, and verifying the complete Next.js Web application, API Route Handlers, core domain use cases, and Betway integration adapter (`web/`). Uses [`skills/full-stack-typescript-engineering/SKILL.md`](skills/full-stack-typescript-engineering/SKILL.md).
4. **Flutter Engineer** ([`agents/flutter-engineer.md`](agents/flutter-engineer.md)): Responsible for implementing, testing, and packaging the Flutter single-screen mobile client (`mobile/`) strictly adhering to the approved system architecture. Uses [`skills/flutter-engineering/SKILL.md`](skills/flutter-engineering/SKILL.md).
5. **Code & Architecture Reviewer** ([`agents/code-architecture-reviewer.md`](agents/code-architecture-reviewer.md)): Responsible for independent structural review, SOLID boundary enforcement, and architectural invariant compliance (`INV-01`–`INV-06`) across all code changes. Uses [`skills/code-architecture-review/SKILL.md`](skills/code-architecture-review/SKILL.md).
6. **QA / Verification Engineer** ([`agents/qa-verification-engineer.md`](agents/qa-verification-engineer.md)): Responsible for independent verification of deliverables against acceptance criteria, quality gates, and runtime behavior with executable evidence. Uses [`skills/qa-verification/SKILL.md`](skills/qa-verification/SKILL.md).

---

## 4. Fundamental Operating Rules

1. **Read Context First**: Before performing any task, read the relevant documents in `docs/` and `research/`.
2. **Evidence-Based Reasoning**: Differentiate strictly between verified facts, requirements, assumptions, and inferences.
3. **Minimality & YAGNI**: Favor the simplest solution that completely satisfies all requirements. Avoid speculative complexity or premature infrastructure.
4. **Clean Commits**: Commit changes atomically with clear, conventional commit messages.
