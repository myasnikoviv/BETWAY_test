# T020 — Configure Vercel Public Web Deployment

* **Owner**: Full-Stack TypeScript Engineer
* **Status**: READY
* **Branch**: `ticket/T020-configure-vercel-deployment`
* **Depends on**: T016

---

## 1. Objective

Deploy the Next.js full-stack application (`web/`) to Vercel (Hobby Tier), verify public HTTPS availability, confirm operational Route Handlers, and record the live URL in repository documentation.

---

## 2. Context & References

* Architectural Specification: [`docs/architecture/02-application-architecture.md`](../../docs/architecture/02-application-architecture.md) (Section 3)
* Approved Stack: [`docs/architecture/ADR-0001-stack-selection.md`](../../docs/architecture/ADR-0001-stack-selection.md)
* Requirements: `NFR-01` (Public Web Deployment)

---

## 3. Scope & Deliverables

* Create Vercel project configuration (`vercel.json` if needed).
* Configure root directory (`web`) and environment variables on Vercel.
* Deploy to Vercel and obtain public production URL (e.g. `https://betway-assessment.vercel.app`).
* Perform live verification against public URL:
  * Health check: `GET /api/v1/health`
  * Resolve: `POST /api/v1/resolve`
  * Web UI interactive loading in browser.
* Update `README.md` with the live production URL.

---

## 4. Non-Goals

* Do not build mobile APK in this ticket (handled in T021).
* Do not attach database or paid addons.

---

## 5. Acceptance Criteria

1. Web application is live and publicly accessible over HTTPS.
2. Next.js Route Handlers (`/api/v1/*`) respond with < 500ms latency without cold start sleep.
3. Web UI is fully functional on the public URL for Decode, Create, and Convert flows.
4. Public live URL is documented in `README.md`.

---

## 6. Verification Plan

* `curl -s https://<deployed-url>/api/v1/health`
* Live browser test of Decode and Convert on the public URL.

---

## 7. STOP CONDITION

Stop immediately once public deployment is verified, documented in `README.md`, and changes are committed. Do not start T021.
