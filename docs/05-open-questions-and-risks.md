# Open Questions and Known Risks

This document tracks identified technical risks and currently unverified behaviors for reference during future implementation phases.

---

## 1. Known Risks

* **Undocumented Public Endpoints**: The integration relies on Betway Africa's public frontend endpoints (`/appsynapse/bet-api-sr02/`), which have no formal SLA and may change without notice.
* **Contract Volatility**: Request or response field names could change if Betway deploys frontend updates.
* **Live Odds Fluctuation**: Odds for sports fixtures change continuously; minor discrepancies between resolve and recreate timestamps reflect standard market movement.
* **Event Expiration & Market Suspension**: Fixtures that start or finish during testing will have their markets closed by Betway, invalidating associated outcome IDs.
* **Booking Code TTL**: Betway may expire generated booking codes after a specific time-to-live (TTL) window.

---

## 2. Currently Unverified Behaviors

* **Deterministic Generation**: Whether Betway's backend code generator uses a deterministic hash or an incrementing/random token generation algorithm remains unverified.
* **Expired Event Error Contracts**: The exact error JSON payload returned when resolving a code containing expired or suspended markets.
* **Error Code Enumeration**: Complete mapping of Betway backend error codes (e.g. `errorCode: 13` for `NotFound`).
* **Single vs. Multi Bet Flag (`isSingleBet`)**: Whether setting `isSingleBet: true` impacts code resolution or betting behavior in specific edge-case market combinations.
