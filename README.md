# Betway Nigeria Booking Code Assessment Platform

A production-grade, full-stack product integrating with Betway Nigeria (`betway.com.ng`) to decode, generate, and convert sports betting booking codes statelessly across Web and Flutter Mobile clients.

---

## 1. Deployment Topology & Live Endpoints

* **Public Web Deployment**: [https://betway-nigeria-booking-code.vercel.app](https://betway-nigeria-booking-code.vercel.app)
* **Backend API Base URL**: `https://betway-nigeria-booking-code.vercel.app/api/v1`
* **Mobile APK Target**: Distributed via Firebase App Distribution (see `mobile/README.md`)

### Deployed API Endpoints

| Method | Route | Description | Example Request |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service uptime and health monitoring | `curl -s https://betway-nigeria-booking-code.vercel.app/api/v1/health` |
| `POST` | `/api/v1/resolve` | Decode booking code into canonical BetSlip | `curl -X POST https://betway-nigeria-booking-code.vercel.app/api/v1/resolve -H "Content-Type: application/json" -d '{"bookingCode":"BW6D7ABCFB"}'` |
| `POST` | `/api/v1/create` | Generate Betway booking code from selections | `curl -X POST https://betway-nigeria-booking-code.vercel.app/api/v1/create -H "Content-Type: application/json" -d '{"selections":[...]}' ` |
| `POST` | `/api/v1/convert` | Ingest booking code and emit identical new code | `curl -X POST https://betway-nigeria-booking-code.vercel.app/api/v1/convert -H "Content-Type: application/json" -d '{"bookingCode":"BW6D7ABCFB"}'` |
| `OPTIONS` | `/api/v1/*` | CORS preflight handler for cross-origin clients | `curl -i -X OPTIONS https://betway-nigeria-booking-code.vercel.app/api/v1/resolve` |

---

## 2. Core Capabilities

1. **Resolve / Decode (`FR-01`)**: Converts any active Betway Nigeria booking code into a canonical bet slip with event names, markets, selections, individual odds, and cumulative odds.
2. **Interactive Display (`FR-02`)**: Renders structured slips with market tags, status feedback, and quick sample codes in both Web UI (`web/`) and Flutter Mobile View (`mobile/`).
3. **Create / Encode (`FR-03`)**: Encodes structured leg selections into a brand-new valid Betway Nigeria booking code.
4. **Convert (`FR-04`)**: Statistically composes Resolve and Create to ingest an existing code and emit a fresh booking code representing the identical bet (`INV-05`).
5. **Live Verification Guide (`FR-05`)**: Embedded modal and UI guidance providing 1-click clipboard copy and direct links to `betway.com.ng` for evaluation and Loom walkthroughs.
6. **Flutter Mobile View (`FR-06`)**: Single-screen Flutter mobile application consuming the same backend API contract (`INV-03`).

---

## 3. Architecture & Invariants

```mermaid
graph TD
    subgraph "Clients Layer"
        WebUI["Web Client (Next.js / React 19 / Tailwind CSS)"]
        FlutterUI["Mobile Client (Flutter Single-Screen View)"]
    end

    subgraph "Application Backend Layer (Vercel Serverless / Node.js Runtime)"
        APIGateway["Backend Route Handlers (/api/v1/*)"]
        DomainCore["Core Domain & Use Cases (Resolve, Create, Convert)"]
        BetwayAdapter["Betway Integration Gateway (BetwayHttpGateway)"]
        
        APIGateway --> DomainCore
        DomainCore --> BetwayAdapter
    end

    subgraph "External Third-Party Infrastructure"
        BetwayPublicAPI["Betway Nigeria Public API (appsynapse/bet-api-sr02)"]
    end

    WebUI -->|Internal Fetch (Same-Origin)| APIGateway
    FlutterUI -->|HTTPS REST JSON / CORS| APIGateway
    BetwayAdapter -->|Anonymous Outbound HTTPS POST| BetwayPublicAPI
```

### Invariant Checklist
* **INV-01**: External Betway endpoints are never called directly by browser or mobile clients; all calls are mediated by `IBetwayGateway` server-side.
* **INV-02**: Raw Betway DTOs are sanitized and normalized into canonical domain models (`BetSlip`, `BetSelection`).
* **INV-03**: Web UI and Flutter Mobile view consume identical `/api/v1/*` contracts.
* **INV-04**: 100% stateless execution with zero database dependencies.
* **INV-05**: Convert operation composes Resolve and Create primitives rather than duplicating Betway integration logic.
* **INV-06**: `IBetwayGateway` abstraction enables deterministic offline fixture testing.

---

## 4. Repository Structure

```text
/
├── README.md                           # Project overview, status, deployment links
├── AGENTS.md                           # Multi-agent delivery workflow & guidelines
├── vercel.json                         # Vercel deployment orchestration
├── docs/                               # Source-of-truth documentation
│   ├── 00-assessment-brief.md          # Original assessment brief
│   ├── 01-requirements.md              # Requirements inventory (FR & NFR)
│   ├── 02-clarifications.md            # Confirmed architectural decisions
│   ├── 03-betway-integration-findings.md # Forensic Betway endpoint findings
│   ├── 04-scope-and-boundaries.md      # Scope boundaries
│   ├── 05-open-questions-and-risks.md  # Risk register
│   ├── 06-target-role-and-context.md   # Role & Stellar Logic context
│   └── architecture/
│       ├── 01-stack-options.md         # Technology study
│       ├── ADR-0001-stack-selection.md # Accepted stack decision
│       └── 02-application-architecture.md # Primary architecture specification
├── research/
│   └── betway/                         # Forensic spike scripts & samples
├── web/                                # Full-Stack Next.js 15 Web Application & Backend API
│   ├── src/
│   │   ├── app/api/v1/                 # Backend Route Handlers (resolve, create, convert, health)
│   │   ├── components/                 # React 19 UI components
│   │   ├── core/                       # Framework-agnostic Domain, Use Cases, Gateway
│   │   └── hooks/                      # React state hooks
│   ├── tests/                          # Vitest unit & integration test suites
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
└── mobile/                             # Flutter Single-Screen Application
    ├── lib/                            # Presentation, Domain, and Infrastructure layers (SOLID/Clean)
    ├── test/                           # Unit, Cubit, and Widget test suites
    ├── pubspec.yaml
    └── README.md                       # Mobile APK & Firebase distribution guide
```

---

## 5. Local Quality Gates & Verification

To run automated quality gates across all workspaces:

```bash
# Web Quality Gates
cd web
npm run lint         # ESLint (0 errors, 0 warnings)
npm run typecheck    # TypeScript compiler check
npm run test         # Vitest unit, integration, and UI tests
npm run build        # Next.js optimized production build

# Mobile Quality Gates
cd ../mobile
flutter test         # Unit, Cubit, and Widget test suites
```

---

## 6. Vercel Deployment Guide

To deploy the full-stack web application and API to Vercel:

1. Import this repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `web` (or rely on root `vercel.json`).
3. Set **Framework Preset** to Next.js.
4. Click **Deploy**.
5. Once deployed, verify `https://<your-project>.vercel.app/api/v1/health`.
