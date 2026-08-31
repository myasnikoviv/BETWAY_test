# Full-Stack TypeScript Engineering Skill Provenance & Research Log

This document records the external documentation, official skills, and industry guidelines researched during the bootstrapping of the project-local `full-stack-typescript-engineering` skill.

---

## 1. Researched Sources Summary

| Source / Repository | Type | Inspected Topics | Adoption Decision |
| :--- | :--- | :--- | :--- |
| **`nextjs.org/docs` & `vercel/next.js/skills`** ([github.com/vercel/next.js](https://github.com/vercel/next.js/tree/canary/skills)) | Official Next.js | App Router, Route Handlers, Server/Client boundaries, version-aligned skills | **Adopted core App Router & Route Handler patterns** |
| **`vercel-labs/agent-skills` (React Best Practices)** ([github.com/vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)) | First-Party Vercel | 70 React/Next.js performance rules, waterfalls, re-renders | **Selectively adopted boundary & waterfall rules; rejected micro-optimizations** |
| **`react.dev`** ([react.dev](https://react.dev/)) | Official React | Component composition, hooks, state minimization, accessibility | **Adopted component composition & local state rules** |
| **`typescriptlang.org/docs`** ([typescriptlang.org](https://www.typescriptlang.org/docs/)) | Official TypeScript | Strict mode, nullability, discriminated unions, narrowing | **Adopted strict typing baseline (`strict: true`, no `any`)** |
| **`vitest.dev`** ([vitest.dev](https://vitest.dev/)) | Official Vitest | Unit testing, mock boundaries, deterministic assertions | **Adopted for fast isolated unit & API integration testing** |

---

## 2. Detailed Research Analysis & Principle Adoption

### 2.1 Next.js App Router & Server/Client Boundaries
* **Research Insight**: Older `vercel-labs/next-skills` repositories have been deprecated; current Next.js skills are maintained directly within the `vercel/next.js` repository on the `canary` branch (`/skills`) to remain strictly version-matched with the framework.
* **Adopted Principles**:
  * Server Components by default for layouts and page shells (`layout.tsx`, `page.tsx`).
  * `'use client'` placed strictly at the leaf level for interactive elements (`BookingCodeInput`, `ConvertPanel`, `BetSlipCard`).
  * Thin Route Handlers (`app/api/v1/*`) dedicated purely to HTTP parsing, validation, and domain use case invocation.

### 2.2 Vercel React Best Practices (Selective Adoption)
* **Research Insight**: `vercel-labs/agent-skills/tree/main/skills/react-best-practices` contains ~70 performance rules across 8 categories.
* **Adopted Principles**:
  * Eliminating async waterfalls in use cases.
  * Keeping client bundle boundaries narrow.
  * Avoiding inline component definitions that cause unnecessary re-renders.
  * Storing minimal state and deriving values during rendering.
* **Deliberately Excluded**:
  * Advanced Cache Components (`use cache`), custom bundling configurations, and complex multi-tier Suspense waterfalls. For this 1–2 day assessment, clarity, correctness, and simplicity take precedence over speculative micro-benchmarking.

### 2.3 Strict TypeScript Baseline
* **Adopted Principles**:
  * `"strict": true` enforced across the entire `web/` codebase.
  * No `any` or blind type assertions (`as Type`) at untrusted boundaries; incoming requests and external JSON are typed as `unknown` and validated with Zod.
  * Discriminated unions for explicit state and domain results.

### 2.4 Vitest Testing & Boundary Mocking
* **Adopted Principles**:
  * Fast, native ESM test execution with Vitest.
  * Mocking at real architectural seams (`IBetwayGateway`), using sanitized static research fixtures (`research/betway/samples/resolve_response.json`).
  * Zero automated test dependency on live Betway network availability.

---

## 3. Deliberately Excluded Over-Engineering
* **Global State Management (Redux / Zustand)**: Rejected for a single-page flow with localized state.
* **Heavy DI Containers (Inversify / TypeDI)**: Rejected; TypeScript constructor/function parameter injection provides complete DIP and testability with zero runtime overhead.
* **Enterprise Clean Architecture Bloat**: Rejected redundant facades, command handlers, and mapper classes; simple use cases and gateway interfaces satisfy SOLID cleanly.
