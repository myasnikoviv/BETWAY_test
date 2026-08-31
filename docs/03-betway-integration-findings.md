# Betway Nigeria Integration Findings

This document summarizes the verified findings from the reverse-engineering spike conducted on the public Betway Nigeria platform (`betway.com.ng`).

---

## 1. Executive Status

```text
RESOLVE: WORKING
CREATE: WORKING
ROUND TRIP: WORKING
```

Both primitive operations execute over direct HTTP REST endpoints without authentication, sessions, or browser automation.

---

## 2. Resolve Contract (`bookingCode -> BetSlip`)

Decodes an existing booking code into full match fixture information, markets, selections, and current odds.

* **Endpoint**: `POST https://www.betway.com.ng/appsynapse/bet-api-sr02/v2/Betting/FindBookABet`
* **Fallback Endpoint**: `POST https://www.betway.com.ng/appsynapse/bet-api-sr/v2/Betting/FindBookABet`
* **Authentication**: None (anonymous)
* **Session / Cookies**: None required
* **Headers**: `Content-Type: application/json`

### Request Payload

```json
{
  "countryCode": "NG",
  "bookingCode": "<BOOKING_CODE>",
  "cultureCode": "en-US"
}
```

### Response Mapping to Canonical Model

| Canonical Field | Betway Response Source Field | Type | Verified Example |
| :--- | :--- | :--- | :--- |
| `eventId` | `selection.eventId` | `string` / `number` | `72221212` |
| `eventName` | `selection.eventName` | `string` | `"Aston Villa vs. Arsenal FC"` |
| `marketId` | `selection.marketId` | `string` | `"72221212546"` |
| `marketName` | `selection.marketName` | `string` | `"Double Chance & Both Teams To Score (GG/NG)"` |
| `selectionId` | `selection.outcomeId` | `string` | `"722212125461718"` |
| `selectionName` | `selection.outcomeName` | `string` | `"Aston Villa/Draw & Yes"` |
| `odds` | `selection.priceDecimal` | `number` | `3.35` |

---

## 3. Create Contract (`selections -> bookingCode`)

Generates a new valid Betway booking code from a set of structured selection identifiers.

* **Endpoint**: `POST https://www.betway.com.ng/appsynapse/bet-api-sr02/v1/Betting/BookABet`
* **Fallback Endpoint**: `POST https://www.betway.com.ng/appsynapse/bet-api-sr/v1/Betting/BookABet`
* **Authentication**: None (anonymous)
* **Session / Cookies**: None required
* **Headers**: `Content-Type: application/json`

### Request Payload Shape

```json
{
  "cultureCode": "en-US",
  "countryCode": "NG",
  "isSingleBet": false,
  "outcomes": [
    {
      "outcomeId": "722212125461718",
      "eventId": 72221212,
      "marketId": "72221212546",
      "selected": true
    },
    {
      "outcomeId": "7222124412776",
      "eventId": 72221244,
      "marketId": "7222124412",
      "selected": true
    }
  ]
}
```

### Confirmed Behavior
* **Required IDs**: `outcomeId`, `eventId`, `marketId`, and `selected: true` are required for each item in `outcomes`.
* **Odds Omission**: Current odds are **not required** in the request payload; Betway calculates and validates odds server-side.
* **Response Payload**: Returns a JSON object with the generated code:
  ```json
  {
    "bookingCode": "BW6D7AC4BA"
  }
  ```

---

## 4. Round-Trip Verification

The complete lifecycle was verified programmatically outside the browser:

```text
Existing Booking Code
        ↓
Resolve (POST /Betting/FindBookABet)
        ↓
Extract Selection Identifiers (eventId, marketId, outcomeId)
        ↓
Create (POST /Betting/BookABet)
        ↓
Receive New Booking Code
        ↓
Resolve New Booking Code (POST /Betting/FindBookABet)
        ↓
Semantic Comparison (Events, Markets, Selections, Odds)
```

**Result**: 100% semantic equivalence was verified across all legs.

---

## 5. Important Evidence Boundaries

1. **Deterministic Code Generation**: **UNVERIFIED**. During forensic testing, different requests produced distinct booking code values (e.g. `BW6D7AB843`, `BW6D7ABCFB`, `BW6D7AC4BA`). It should not be assumed that the booking code generator is purely a deterministic hash of selections.
2. **Undocumented Public Endpoints**: These endpoints are part of Betway Africa's public web architecture (`appsynapse`) and are subject to change without notice.
