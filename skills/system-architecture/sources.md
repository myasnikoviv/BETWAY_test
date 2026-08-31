# System Architecture Skill — Source Provenance & Research Log

This document records the external engineering resources, architecture frameworks, and industry practices evaluated during the synthesis of the `system-architecture` skill.

---

## 1. Primary Sources & Engineering Literature

### 1. Architecture Decision Records (ADRs)
* **Author / Reference**: Michael Nygard (*Documenting Architecture Decisions*), ThoughtWorks Technology Radar, Martin Fowler.
* **URL**: [https://martinfowler.com/articles/adr.html](https://martinfowler.com/articles/adr.html) / [https://github.com/joelparkerhenderson/architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record)
* **Adopted Concepts**:
  * Lightweight Markdown-based records stored in version control.
  * Structured format: Context → Decision → Consequences (Positive & Negative Trade-offs) → Alternatives.
  * Treating decisions as explicit and reviewable engineering artifacts.
* **Rejected / Modified**:
  * Heavyweight enterprise ADR templates with extensive compliance sign-offs. Replaced with concise, developer-focused decision records.

---

### 2. Building Evolutionary Architectures & YAGNI
* **Authors / Reference**: Neal Ford, Rebecca Parsons, Pramod Sadalage (*Building Evolutionary Architectures*), Kent Beck & Martin Fowler (*Extreme Programming / YAGNI*).
* **URLs**: [https://evolutionaryarchitecture.com](https://evolutionaryarchitecture.com), [https://martinfowler.com/bliki/Yagni.html](https://martinfowler.com/bliki/Yagni.html)
* **Adopted Concepts**:
  * "Last Responsible Moment" decision timing to avoid premature commitments before facts are known.
  * Strict YAGNI enforcement: complexity must be justified by an active, concrete requirement.
  * Keeping systems simple and malleable rather than constructing speculative abstractions.
* **Rejected / Modified**:
  * Complex automated architectural fitness function pipelines (e.g. ArchUnit suites), as they are excessive for a 1–2 day assessment.

---

### 3. C4 Model for Visualising Software Architecture
* **Author / Reference**: Simon Brown.
* **URL**: [https://c4model.com](https://c4model.com)
* **Adopted Concepts**:
  * Hierarchical abstraction levels: Context (System-level actors & integrations) and Container (Deployable applications & data stores).
  * Expressing system topologies clearly using Mermaid diagrams.
* **Rejected / Modified**:
  * Low-level Component and Code level diagrams, which add maintenance overhead without adding high-level architectural value.

---

### 4. Architecture Tradeoff Analysis Method (ATAM)
* **Author / Reference**: Software Engineering Institute (SEI) / Carnegie Mellon University (Rick Kazman, Mark Klein, Paul Clements).
* **URL**: [https://resources.sei.cmu.edu/library/asset-view.cfm?assetid=5177](https://resources.sei.cmu.edu/library/asset-view.cfm?assetid=5177)
* **Adopted Concepts**:
  * Systematic evaluation of candidate architectures against explicit criteria (Cost, Complexity, Delivery Time, Operational Burden).
  * Explicitly surfacing trade-offs (what is gained vs. what is sacrificed) rather than presenting solutions as cost-free.
* **Rejected / Modified**:
  * Formal multi-week workshop facilitation processes; streamlined into an agile, table-based trade-off matrix.

---

### 5. Twelve-Factor App & Stateless Backends
* **Author / Reference**: Adam Wiggins / Heroku.
* **URL**: [https://12factor.net](https://12factor.net)
* **Adopted Concepts**:
  * Stateless processes: execute the app as one or more stateless processes, storing state in backing services only if necessary.
  * Backing services as attached resources: treating external integration points (such as Betway) as isolated external services.
* **Rejected / Modified**:
  * Multi-environment parity rules requiring full local mock staging clusters; lightweight environment variable configuration is sufficient.

---

## 2. Synthesis Summary

The `system-architecture` skill consolidates these battle-tested principles into a single, high-leverage workflow designed specifically for rapid assessment execution:
1. **Fact-driven grounding** (ADR / ATAM)
2. **Minimalist scoping** (YAGNI / Evolutionary Architecture)
3. **Clean boundary isolation** (Twelve-Factor / C4)
4. **Pragmatic cost & delivery optimization**
