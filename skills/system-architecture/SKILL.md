---
name: system-architecture
description: >-
  System architecture analysis, system boundaries, trade-off evaluation,
  component decomposition, and architectural decision making for minimal full-stack systems.
---

# System Architecture Skill

This skill guides the System Architect in conducting rigorous, evidence-based architectural analysis, evaluating system topologies, defining clean component boundaries, and making justified, cost-conscious architectural decisions.

---

## 1. Decision Process Workflow

Every architectural recommendation must follow this sequence:

```text
Requirements & Brief (docs/00, docs/01)
        ↓
Confirmed Clarifications (docs/02)
        ↓
Technical Evidence & Spike Findings (docs/03, research/)
        ↓
Constraints & Boundaries (docs/04, docs/05)
        ↓
Viable Options Generation (≥ 2 alternatives)
        ↓
Trade-off Matrix Evaluation
        ↓
Architectural Recommendation / Decision (ADR)
```

**Rule**: Never begin from a preferred technology stack, framework, or cloud provider. Always derive options from verified facts and explicit constraints.

---

## 2. Epistemological Categories

Architects must strictly distinguish between the following categories without collapsing them:

1. **Explicit Requirement**: Directly requested in the brief (`docs/00`, `docs/01`).
2. **Verified Technical Fact**: Empirically proven via spike or forensic evidence (`docs/03`).
3. **Assumption**: Working hypothesis that must be validated or treated with caution.
4. **Inference**: Logical deduction derived from requirements or technical facts.
5. **Recommendation**: Proposed technical path supported by trade-off analysis.
6. **Approved Decision**: Formally accepted architecture decision record.

---

## 3. System Boundary & Decomposition Principles

When defining system topology, reason across these fundamental boundaries:

* **Client Boundaries**: Web UI vs Mobile (Flutter single-screen view). Clients must remain thin and communicate via stable contracts.
* **Backend Responsibilities**: Request validation, canonical model transformations, error normalization, and external service proxying.
* **External Integration Isolation**: The Betway Nigeria API is an undocumented external boundary. It must be encapsulated behind an adapter/gateway to prevent vendor leak into core domain models.
* **Domain & Data Ownership**: Define clear canonical models (e.g. `BetSlip`, `BetSelection`) independent of external response shapes.
* **Persistence Boundaries**: Stateless by default. Only introduce a database if persistent storage is required by an explicit, approved requirement.
* **Deployment Boundaries**: Each deployable unit must correspond to a distinct operational responsibility, not arbitrary architectural convention.

---

## 4. Minimality & YAGNI (Minimum Sufficient Architecture)

Architecture complexity must be justified by concrete constraints. Unjustified complexity introduces operational drag and delivery risk.

* **No Speculative Persistence**: Do not introduce relational or document databases without stateful persistence requirements.
* **No Premature Authentication**: Do not introduce auth systems or session stores when operations are anonymous.
* **No Unnecessary Messaging**: Do not introduce message queues or event streams without asynchronous workload requirements.
* **No Microservice Sprawl**: Prefer a cohesive, modular monolithic backend over distributed microservices for small assessment scopes.
* **No Speculative Scalability**: Design for correctness, testability, and clarity within the assessment horizon rather than hypothetical millions of users.

---

## 5. Structured Alternative Generation & Trade-off Evaluation

For every major architecture decision, formulate multiple viable options and evaluate them systematically:

### Evaluation Criteria Matrix
* **Requirement Compliance**: Fully meets functional requirements (`FR-01` to `FR-06`) and delivery goals (`NFR-01` to `NFR-08`).
* **Implementation Velocity**: Realistic completion within the 1–2 day assessment timeline.
* **Architectural Simplicity**: Minimal moving parts, minimal configuration overhead.
* **Deployment & Hosting Cost**: Zero-cost or near-zero-cost hosting tiers where practical.
* **Operational Burden**: Low maintenance, straightforward CI/CD, minimal external dependencies.
* **Testability & Inspectability**: Easy local execution, reproducible manual/automated verification.
* **External Boundary Isolation**: Clean encapsulation of undocumented Betway HTTP endpoints.
* **Flutter Client Compatibility**: Effortless API consumption from Flutter HTTP clients.
* **Clarity of Explanation**: Straightforward to explain in written architecture docs and Loom walkthroughs.

---

## 6. Cost & Deployment Constraints

* **Cost Profile**: Strive for **zero-cost or effectively zero-cost deployment** (e.g. generous free tiers on Netlify, Vercel, Render, Railway, Fly.io, Cloudflare, etc.).
* **Complexity Guardrail**: Free hosting must **not** be achieved at the expense of excessive implementation or operational complexity. Balance hosting cost with developer velocity.

---

## 7. Architecture vs. Implementation Boundary

The Architect is responsible for:
* Defining system boundaries, component responsibilities, and topologies.
* Designing API contracts and canonical domain models.
* Conducting trade-off evaluations and recommending technology selections.
* Authoring Architecture Decision Records (ADRs) and Mermaid diagrams.

The Architect **must not**:
* Write feature code or implementation logic during architecture-only tickets.
* Invent requirements or expand scope beyond documented agreements.
