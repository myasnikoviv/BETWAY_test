# Agent Instructions & Repository Guidelines

This repository follows a disciplined, ticket-driven engineering workflow. All agents collaborating on this project must adhere to the rules and structures documented below.

---

## 1. Ticket-Driven Workflow

1. **Strict Scope Discipline**: Work is executed on a per-ticket basis. Agents must never exceed the scope defined in the current ticket prompt.
2. **Explicit Stop Conditions**: Every ticket defines a concrete `STOP CONDITION`. Agents must cease execution immediately once the stop condition is met.
3. **No Premature Implementation**: Do not begin downstream work (such as framework setup, coding, or testing) before upstream tickets (such as architecture analysis and review) are completed.

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

* **Forensic Spike Artifacts**: Located in [`research/betway/`](research/betway/)
* **Agent Definitions**: Located in [`agents/`](agents/)
* **Local Skills**: Located in [`skills/`](skills/)

---

## 3. Active Agent Roles

The repository defines specialized agent roles for distinct development phases:

1. **System Architect** ([`agents/system-architect.md`](agents/system-architect.md)): Responsible for system analysis, boundary definition, option formulation, trade-off evaluation, architecture decision records (ADRs), and application specifications. Uses [`skills/system-architecture/SKILL.md`](skills/system-architecture/SKILL.md).
2. **Flutter Engineer** ([`agents/flutter-engineer.md`](agents/flutter-engineer.md)): Responsible for implementing, testing, and packaging the Flutter single-screen mobile client (`mobile/`) strictly adhering to the approved system architecture. Uses [`skills/flutter-engineering/SKILL.md`](skills/flutter-engineering/SKILL.md).

*Note: Additional implementation and reviewer roles will be introduced as implementation tickets proceed.*


---

## 4. Fundamental Operating Rules

1. **Read Context First**: Before performing any task, read the relevant documents in `docs/` and `research/`.
2. **Evidence-Based Reasoning**: Differentiate strictly between verified facts, requirements, assumptions, and inferences.
3. **Minimality & YAGNI**: Favor the simplest solution that completely satisfies all requirements. Avoid speculative complexity or premature infrastructure.
4. **Clean Commits**: Commit changes atomically with clear, conventional commit messages.
