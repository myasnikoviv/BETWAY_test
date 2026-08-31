# Betway Nigeria Booking Code Assessment

## Status
Documentation / bootstrap phase.

## Objective
A lightweight product integration with Betway Nigeria (`betway.com.ng`) supporting three primary operations:
1. **Resolve / Decode**: Convert a Betway Nigeria booking code into a structured bet slip (matches, markets, selections, and odds).
2. **Create / Encode**: Generate a valid Betway Nigeria booking code from structured selections.
3. **Convert**: Ingest an existing booking code/slip and emit a new Betway booking code representing the same bet.

The solution includes a web interface, backend service, and a single-screen Flutter mobile view.

## Verified So Far
An integration spike has reverse-engineered and verified the public Betway Nigeria HTTP endpoints:
* **Resolve (`POST /Betting/FindBookABet`)**: Working anonymously without authentication or session cookies.
* **Create (`POST /Betting/BookABet`)**: Working anonymously without authentication or pre-computed odds.
* **Round Trip**: Verified end-to-end with 100% semantic identity across match events, markets, selections, and odds.

## Repository Documentation
All verified context, requirements, and constraints are recorded under [`docs/`](docs/):
* [`docs/00-assessment-brief.md`](docs/00-assessment-brief.md): Original assessment brief and delivery requirements.
* [`docs/01-requirements.md`](docs/01-requirements.md): Categorized functional and non-functional requirements inventory.
* [`docs/02-clarifications.md`](docs/02-clarifications.md): Confirmed decisions and scope clarifications.
* [`docs/03-betway-integration-findings.md`](docs/03-betway-integration-findings.md): Verified endpoint contracts and payload specifications.
* [`docs/04-scope-and-boundaries.md`](docs/04-scope-and-boundaries.md): Explicit in-scope and out-of-scope boundaries.
* [`docs/05-open-questions-and-risks.md`](docs/05-open-questions-and-risks.md): Known integration risks and unverified edge cases.
* [`docs/06-target-role-and-context.md`](docs/06-target-role-and-context.md): Target role & company context (Stellar Logic).


Forensic research artifacts are preserved under [`research/betway/`](research/betway/).

## Agent Infrastructure
* [`AGENTS.md`](AGENTS.md): Repository-level agent entry point and guidelines.
* [`agents/system-architect.md`](agents/system-architect.md): System Architect agent definition.
* [`skills/system-architecture/SKILL.md`](skills/system-architecture/SKILL.md): System Architecture analysis skill.

## Implementation Status
Not started.

