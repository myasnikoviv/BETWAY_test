# Ticket Backlog & Work Tracking

This directory contains the repository-native ticket registry for the Betway Nigeria Booking Code project.

---

## Directory Structure

* **`backlog/`**: Tickets in `DRAFT` or `READY` state awaiting kickoff.
* **`active/`**: Tickets currently in `IN_PROGRESS`, `IMPLEMENTED`, `REVIEW`, `QA`, or `CHANGES_REQUIRED`.
* **`done/`**: Completed tickets that have satisfied all criteria in the [Definition of Done](../docs/process/development-workflow.md#5-definition-of-done-dod).

---

## Ticket Workflow & Lifecycle

```text
DRAFT ──► READY ──► IN_PROGRESS ──► IMPLEMENTED ──► REVIEW ──► QA ──► DONE
                         ▲                                │     │
                         │                                │     │
                         └── CHANGES_REQUIRED ◄───────────┴─────┘
```

For complete workflow rules, handoffs, and branch conventions, consult [`docs/process/development-workflow.md`](../docs/process/development-workflow.md).
