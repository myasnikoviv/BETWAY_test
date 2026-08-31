# ADR-0001: Technology Stack and Deployment Topology Selection

* **Status**: Accepted  
* **Date**: 2026-08-31  
* **Authors**: System Architect, Candidate / Project Owner  
* **Deciders**: Project Owner / Engineering Lead  
* **Context Documents**: [`docs/00-assessment-brief.md`](../00-assessment-brief.md), [`docs/01-requirements.md`](../01-requirements.md), [`docs/02-clarifications.md`](../02-clarifications.md), [`docs/03-betway-integration-findings.md`](../03-betway-integration-findings.md), [`docs/04-scope-and-boundaries.md`](../04-scope-and-boundaries.md), [`docs/06-target-role-and-context.md`](../06-target-role-and-context.md), [`docs/architecture/01-stack-options.md`](01-stack-options.md).

---

## 1. Context and Problem Statement

The technical assessment requires building and deploying a complete product that integrates with Betway Nigeria (`betway.com.ng`) to support:
1. **Resolve / Decode**: Booking code → canonical bet slip.
2. **Create / Encode**: Structured selections → valid Betway booking code.
3. **Convert**: Existing booking code/slip → new Betway booking code for the identical bet.
4. **Verification**: Loading codes in the official Betway Nigeria UI.
5. **Clients**: Web product + rough single-screen Flutter mobile view (Android APK via Firebase App Distribution + iOS IPA note).
6. **Timeline**: 1–2 days delivery with a public live URL, clean Git history, architecture diagrams, and a 5-minute Loom walkthrough.

We must select an architecture and technology stack that is **minimal, reliable, fast to implement, zero-cost to host, and professionally defensible**.

---

## 2. Decision

We formally select **Option 1: Unified Full-Stack Next.js (App Router / TypeScript) + Flutter on Vercel** with the following concrete specifications:

```mermaid
graph TD
    subgraph "Clients Layer"
        WebUI["Web Client (Next.js / React 19 / Tailwind CSS)"]
        FlutterUI["Mobile Client (Flutter Single-Screen View)"]
    end

    subgraph "Backend API Gateway (Vercel Serverless / Node.js Runtime)"
        Router["Next.js Route Handlers (/api/v1/*)"]
        Validator["Request Validation & DTO Mapping"]
        CanonicalModel["Canonical Domain Layer (BetSlip, BetSelection)"]
        Adapter["Betway Integration Gateway (HTTP REST Adapter)"]
        
        Router --> Validator
        Validator --> CanonicalModel
        CanonicalModel --> Adapter
    end

    subgraph "External Third-Party Infrastructure"
        BetwayPublicAPI["Betway Nigeria Public API (appsynapse/bet-api-sr02)"]
    end

    WebUI -->|Internal Fetch (Same-Origin)| Router
    FlutterUI -->|HTTPS REST JSON| Router
    Adapter -->|Anonymous HTTPS POST| BetwayPublicAPI
```

### Component Breakdown
1. **Web Frontend**: **Next.js (React 19, TypeScript, Tailwind CSS)**
   * Provides a clean, responsive web interface for decoding codes, inspecting slips, and performing one-click conversions.
2. **Backend API**: **Node.js Server-Side Route Handlers (`app/api/v1/*`)**
   * Implements dedicated endpoints: `POST /api/v1/resolve`, `POST /api/v1/create`, `POST /api/v1/convert`.
   * Serves as our private API gateway, keeping all undocumented Betway endpoints, custom headers, and network quirks strictly server-side.
3. **Mobile Client**: **Flutter**
   * Single-screen mobile viewer querying the backend API over standard HTTPS/JSON.
   * Distributed as an Android APK via Firebase App Distribution, accompanied by iOS IPA documentation.
4. **Database**: **None (Stateless)**
   * No application-owned database is introduced. All operations are executed statelessly against Betway's live infrastructure.
5. **Deployment Target**: **Vercel (Hobby Tier)**
   * Single repository, automatic Git-push continuous deployment, global CDN, and zero cold-start delay via Fluid compute.

---

## 3. Rationale

### 3.1 Technical Rationale (Primary Justification)

1. **Minimality & Velocity (1–2 Day Fit)**:
   * A unified TypeScript repository eliminates multi-repo orchestration, dual build pipelines, and cross-origin CORS configuration between the Web UI and Backend.
   * Canonical domain types (`BetSlip`, `BetSelection`, `ConvertRequest`, `ConvertResponse`) are defined once and shared across client UI components and server-side API handlers without code generation overhead.
2. **Backend Boundary Integrity (`NFR-02`)**:
   * Next.js Route Handlers execute exclusively on the server (Node.js runtime). Undocumented Betway endpoints (`/appsynapse/bet-api-sr02/v2/Betting/FindBookABet` and `/appsynapse/bet-api-sr02/v1/Betting/BookABet`) are completely encapsulated behind our backend adapter. Neither Web nor Flutter clients have direct exposure to Betway internals.
3. **Zero-Database YAGNI Compliance (`NFR-03`)**:
   * Because Betway booking codes carry server-side state on Betway's infrastructure, all core requirements (`FR-01` to `FR-06`) can be executed statelessly. Avoiding a database removes schema migrations, connection pooling, and external database hosting failure modes.
4. **Reliable Zero-Cost Hosting**:
   * Vercel's Hobby tier provides instant serverless executions with near-zero cold-start latency (~100–200ms), avoiding the 50-second sleep cycles characteristic of free-tier standalone compute providers (e.g. Render).

### 3.2 Target Role & Context Alignment (Secondary Justification)

* **Company**: Stellar Logic ([`docs/06-target-role-and-context.md`](../06-target-role-and-context.md)).
* **Position**: Product-Minded Full-Stack Engineer (Node.js / React / Flutter).
* **Alignment**:
  * Directly exercises the core technology triad of the target role: **Node.js, React / Next.js, and Flutter**.
  * Demonstrates end-to-end product ownership, clean architectural boundaries, and disciplined engineering practices.
* *Note*: Role alignment is a secondary confirmation; the decision is fundamentally driven by architectural simplicity, technical suitability, and delivery feasibility.

---

## 4. Consequences and Accepted Trade-offs

### Positive Consequences
* **Single Deployment URL**: Web UI and Backend API reside on the same public domain, eliminating CORS preflight overhead for web users.
* **Instant Flutter API Consumption**: Flutter interacts with a clean, stable REST API returning normalized DTOs.
* **Smooth Loom Walkthrough**: No risk of server sleep or spin-down delays during the 5-minute evaluation video.
* **Maintainability & Portability**: Server-side route handlers use standard Web API request/response objects, making the business logic easily extractable to a standalone Fastify/Express container if future requirements ever mandate decoupling.

### Negative Consequences & Mitigations
* **Framework Coupling**: The web and backend layers are structured around Next.js conventions.
  * *Mitigation*: Core Betway integration and canonical transformation logic will be isolated in pure TypeScript modules (`src/core/` or `lib/betway/`) completely decoupled from Next.js framework imports.

---

## 5. Auditable Hosting & Free-Tier Reference Log

The following limits were verified during the architecture study (August 2026) to ensure viability:

| Provider | Plan / Tier | Verified Limits | Source Reference |
| :--- | :--- | :--- | :--- |
| **Vercel** | Hobby (Free) | 1,000,000 function invocations/mo, 4 CPU-hours/mo, 300s max duration, 100 deploys/day, non-commercial use permitted. | [Vercel Limits Documentation](https://vercel.com/docs/limits/plans#hobby-plan) |
| **Render** | Free Compute | 750 free instance hours/mo; spins down after 15 minutes of inactivity; ~50s cold start. | [Render Free Plans Documentation](https://render.com/docs/free) |
| **Cloudflare** | Free Workers | 100,000 requests/day, 10ms CPU time/invocation, 0ms cold starts (V8 isolates). | [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) |

---

## 6. Implementation Readiness

With this decision formally accepted, subsequent implementation tickets will proceed with:
1. Setting up the Next.js (TypeScript, React, Tailwind) project structure with isolated API routing.
2. Implementing the core Betway integration adapter and canonical transformation layer.
3. Building the web UI for Resolve, Create, and Convert flows.
4. Setting up the Flutter single-screen slip view.
5. Deploying to Vercel and configuring Firebase App Distribution for the Android APK.
