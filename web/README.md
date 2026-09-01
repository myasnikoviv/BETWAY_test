# Betway Nigeria Booking Code Platform — Web Application & Backend API

Full-Stack Next.js application (App Router, React 19, TypeScript, Tailwind CSS) providing an interactive Web UI and unified REST API (`/api/v1/*`) for decoding, generating, and converting Betway Nigeria booking codes.

---

## 1. Public Deployment Topology (Vercel)

* **Deployment Target**: Vercel (Hobby Tier / Edge CDN + Node.js 20+ Serverless Compute)
* **Framework**: Next.js 15 (App Router)
* **Root Directory**: `web` (or root with `vercel.json` orchestration)
* **Production Base URL**: `https://betway-nigeria-booking-code.vercel.app`
* **API Gateway Base**: `https://betway-nigeria-booking-code.vercel.app/api/v1`

---

## 2. API Endpoints Contract (`/api/v1/*`)

All API endpoints enforce standardized JSON response envelopes and include permissive CORS headers (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, OPTIONS`) for web and Flutter mobile client consumption (`INV-03`).

| Method | Endpoint | Description | Request Body | Success Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service uptime and health check | N/A | `{"success": true, "data": {"status": "healthy", ...}}` |
| `POST` | `/api/v1/resolve` | Decode booking code into canonical `BetSlip` | `{"bookingCode": "BW6D7ABCFB"}` | `{"success": true, "data": { "bookingCode", "selections", "totalOdds", ... }}` |
| `POST` | `/api/v1/create` | Generate Betway booking code from structured selections | `{"selections": [...], "isSingleBet": false}` | `{"success": true, "data": { "bookingCode": "..." }}` |
| `POST` | `/api/v1/convert` | Ingest code, decode slip, and generate identical new booking code | `{"bookingCode": "BW6D7ABCFB"}` | `{"success": true, "data": { "sourceBookingCode", "newBookingCode", "slip" }}` |
| `OPTIONS` | `/api/v1/*` | CORS preflight handler | N/A | `204 No Content` |

---

## 3. Environment Configuration

Configuration defaults are managed in `src/core/gateway/BetwayHttpGateway.ts` with optional overrides via environment variables (documented in `.env.example`):

```bash
# Primary Betway Nigeria Gateway Endpoint (Default)
BETWAY_BASE_URL=https://www.betway.com.ng/appsynapse/bet-api-sr02

# Fallback Betway Gateway Endpoint (Failover Retry)
BETWAY_FALLBACK_BASE_URL=https://www.betway.com.ng/appsynapse/bet-api-sr

# Gateway Outbound HTTP Timeout in Milliseconds (Default: 8000)
BETWAY_TIMEOUT_MS=8000

# Node Environment
NODE_ENV=production
```

---

## 4. Vercel Deployment Instructions

### Method A: Git Continuous Deployment (Recommended)
1. Import this repository into Vercel Dashboard.
2. Set **Root Directory** to `web` (or leave default if using root `vercel.json`).
3. Select **Framework Preset**: Next.js.
4. (Optional) Configure environment variables from `.env.example` in Project Settings.
5. Click **Deploy**. Vercel automatically runs `npm run build` and provisions serverless functions for all `/api/v1/*` route handlers.

### Method B: Vercel CLI Deployment
```bash
cd web
npx vercel login
npx vercel deploy --prod --yes
```

---

## 5. Local Development & Quality Gates

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run ESLint check
npm run lint

# Run TypeScript typecheck
npm run typecheck

# Run Vitest test suite (unit, integration, UI tests)
npm run test

# Build production Next.js bundle
npm run build

# Run production server locally
npm run start
```

---

## 6. Architectural Boundary Enforcement

* **INV-01**: External Betway endpoints are never called client-side in browser JS. All calls originate in server-side Route Handlers via `BetwayHttpGateway`.
* **INV-02**: Raw Betway DTOs are sanitized and normalized into canonical domain models (`BetSlip`, `BetSelection`).
* **INV-03**: Web and Flutter clients consume identical `/api/v1/*` REST contracts.
* **INV-04**: 100% stateless execution with zero database dependencies.
* **INV-05**: Convert operation composes `ResolveBookingCodeUseCase` and `CreateBookingCodeUseCase`.
* **INV-06**: `IBetwayGateway` interface enables deterministic fixture-based testing.
