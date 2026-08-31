# Scope and Boundaries

This document defines the strict functional and architectural boundaries of the project to ensure focused execution and prevent scope creep.

---

## 1. Explicitly In Scope

* **Betway Resolve**: Decoding any valid Betway Nigeria booking code into a canonical bet slip.
* **Betway Create**: Generating a valid Betway Nigeria booking code from structured selection inputs.
* **Betway Convert**: Ingesting a code/slip and producing a new valid Betway booking code for the identical bet.
* **Minimal Web UI**: Clean, functional web interface to test Resolve, Create, and Convert operations.
* **Backend Service**: Lightweight API service orchestrating Betway HTTP communication and model transformations.
* **Manual Betway Verification**: Live demonstration during the Loom walkthrough showing generated codes loading on Betway Nigeria.
* **Flutter Single-Screen View**: Minimal mobile UI rendering the resolved slip.
* **Firebase APK Distribution**: Automated or scripted distribution of the Android APK via Firebase App Distribution.
* **iOS Distribution Note**: Clear documentation describing the iOS IPA distribution pathway.
* **Architecture Documentation & Diagrams**: Mermaid sequence/component diagrams and written rationale.
* **Loom Walkthrough**: 5-minute video presentation demonstrating all deliverables.
* **Public Web Deployment**: Hosted, accessible web application.

---

## 2. Out of Scope (Not Required)

To avoid over-engineering, the following items are explicitly **excluded**:

* **User Authentication & Accounts**: No user registration, login, or JWT session management.
* **Saved Slips & Betting History**: No persistence of past user bets unless a concrete technical requirement emerges.
* **Full Sportsbook / Event Browser**: No league browsing, live score ticker, or navigation catalogues.
* **Relational Database**: No SQL/NoSQL database unless necessary for state that cannot be handled statelessly.
* **Automated Headless Browser Verification**: No Playwright / Puppeteer automation suites against Betway's UI.
* **Full Flutter Mobile App**: No multi-screen mobile navigation, stateful betting flows, or native push notifications.
* **Admin Dashboard & Analytics**: No tracking dashboards, metrics aggregators, or telemetry platforms.
* **Complex Design System**: Standard, functional UI components without bespoke theme engines.
* **Microservices Architecture**: Monolithic or modular single-service architecture preferred over distributed microservices.
* **Production Observability Infrastructure**: No distributed tracing, Prometheus/Grafana clusters, or Datadog integrations.

---

## 3. Scope Rule

> **Golden Rule**: New functionality must not be introduced unless it is required by the original assessment, an explicit clarification, or a concrete technical dependency discovered during implementation.
