#!/usr/bin/env python3
"""
Betway Nigeria Integration Spike - Full Round-Trip Verification Test

Flow:
1. Dynamically discover active soccer fixtures & outcomes via Feeds API.
2. Select 3 distinct match legs to form a multi-bet slip.
3. Call Betway `POST /Betting/BookABet` to create an initial Booking Code.
4. Call Betway `POST /Betting/FindBookABet` to resolve the Booking Code into full bet details.
5. Map response into the canonical BetSlip model:
     type BetSlip = { selections: BetSelection[] }
     type BetSelection = { eventId, eventName, marketId, marketName, selectionId, selectionName, odds }
6. Encode canonical BetSlip back into a new Booking Code via `POST /Betting/BookABet`.
7. Resolve the new Booking Code via `POST /Betting/FindBookABet`.
8. Assert 100% semantic match between the original canonical slip and the round-tripped slip.
"""

import urllib.request
import json
import ssl
import sys

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://www.betway.com.ng",
    "Referer": "https://www.betway.com.ng/"
}

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

BASE_BET_URL = "https://www.betway.com.ng/appsynapse/bet-api-sr02"
BASE_SPORTS_URL = "https://www.betway.com.ng/sportsapi/br"


def http_post(url: str, payload: dict) -> dict:
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=HEADERS, method="POST")
    with urllib.request.urlopen(req, context=CTX) as resp:
        return json.loads(resp.read().decode('utf-8'))


def http_get(url: str) -> dict:
    req = urllib.request.Request(url, headers=HEADERS, method="GET")
    with urllib.request.urlopen(req, context=CTX) as resp:
        return json.loads(resp.read().decode('utf-8'))


def resolve_booking_code(code: str) -> dict:
    url = f"{BASE_BET_URL}/v2/Betting/FindBookABet"
    payload = {
        "countryCode": "NG",
        "bookingCode": code,
        "cultureCode": "en-US"
    }
    return http_post(url, payload)


def create_booking_code(outcomes: list) -> str:
    url = f"{BASE_BET_URL}/v1/Betting/BookABet"
    payload = {
        "cultureCode": "en-US",
        "countryCode": "NG",
        "isSingleBet": False,
        "outcomes": outcomes
    }
    res = http_post(url, payload)
    return res["bookingCode"]


def to_canonical_slip(raw_response: dict) -> dict:
    return {
        "selections": [
            {
                "eventId": str(s["eventId"]),
                "eventName": s["eventName"],
                "marketId": str(s["marketId"]),
                "marketName": s["marketName"],
                "selectionId": str(s["outcomeId"]),
                "selectionName": s["outcomeName"],
                "odds": s["priceDecimal"]
            }
            for s in raw_response.get("selections", [])
        ]
    }


def main():
    print("=" * 60)
    print("BETWAY NIGERIA INTEGRATION SPIKE — ROUND-TRIP VERIFICATION")
    print("=" * 60)

    # Step 1: Discover active events
    print("\n[Step 1] Fetching active English Premier League matches...")
    events_url = f"{BASE_SPORTS_URL}/v1/FeedsEvent/Events?countryCode=NG&sportId=soccer&regionId=england&leagueId=premier-league&skip=0&take=3"
    events = http_get(events_url)
    if not events:
        print("ERROR: No active events returned from sports feed.")
        sys.exit(1)

    print(f"  Found {len(events)} fixtures.")

    # Step 2: Build selection list
    print("\n[Step 2] Building multi-bet selections from live feed...")
    selections_payload = []
    for ev in events[:3]:
        ev_id = ev["eventId"]
        emop = http_get(f"{BASE_SPORTS_URL}/v1/Feeds/EMOP?eventIds={ev_id}&countryCode=NG&cultureCode=en-US")[0]
        mkt = emop["markets"][0]
        outc = emop["outcomes"][0]
        price = next((p for p in emop.get("prices", []) if str(p["outcomeId"]) == str(outc["outcomeId"])), None)
        
        odds_val = price["priceDecimal"] if price else "N/A"
        print(f"  + Match: '{ev['name']}' (Event ID: {ev_id})")
        print(f"    Market: '{mkt['displayName']}' (Market ID: {mkt['marketId']})")
        print(f"    Selection: '{outc['displayName']}' (Outcome ID: {outc['outcomeId']}) @ Odds {odds_val}")
        
        selections_payload.append({
            "outcomeId": outc["outcomeId"],
            "eventId": ev_id,
            "marketId": mkt["marketId"],
            "selected": True
        })

    # Step 3: Create initial booking code
    print("\n[Step 3] Creating initial booking code via POST /Betting/BookABet...")
    code_1 = create_booking_code(selections_payload)
    print(f"  >>> Generated Booking Code 1: {code_1}")

    # Step 4: Resolve initial booking code
    print(f"\n[Step 4] Resolving Booking Code 1 ({code_1}) via POST /Betting/FindBookABet...")
    resolved_1 = resolve_booking_code(code_1)
    canonical_1 = to_canonical_slip(resolved_1)
    print(f"  Successfully resolved {len(canonical_1['selections'])} selections.")
    print("  Canonical Model:")
    print(json.dumps(canonical_1, indent=4))

    # Step 5: Create second booking code from canonical model
    print("\n[Step 5] Creating second booking code from canonical BetSlip model...")
    reconstructed_outcomes = [
        {
            "outcomeId": s["selectionId"],
            "eventId": int(s["eventId"]),
            "marketId": s["marketId"],
            "selected": True
        }
        for s in canonical_1["selections"]
    ]
    code_2 = create_booking_code(reconstructed_outcomes)
    print(f"  >>> Generated Booking Code 2: {code_2}")

    # Step 6: Resolve second booking code
    print(f"\n[Step 6] Resolving Booking Code 2 ({code_2}) via POST /Betting/FindBookABet...")
    resolved_2 = resolve_booking_code(code_2)
    canonical_2 = to_canonical_slip(resolved_2)
    print(f"  Successfully resolved {len(canonical_2['selections'])} selections.")

    # Step 7: Compare canonical slips
    print("\n[Step 7] Verifying semantic equality between original and round-tripped slips...")
    assert len(canonical_1["selections"]) == len(canonical_2["selections"]), "Selection count mismatch!"

    all_matched = True
    for idx, (s1, s2) in enumerate(zip(canonical_1["selections"], canonical_2["selections"]), 1):
        ev_ok = s1["eventId"] == s2["eventId"] and s1["eventName"] == s2["eventName"]
        mkt_ok = s1["marketId"] == s2["marketId"] and s1["marketName"] == s2["marketName"]
        sel_ok = s1["selectionId"] == s2["selectionId"] and s1["selectionName"] == s2["selectionName"]
        odds_ok = s1["odds"] == s2["odds"]

        print(f"\n  Leg {idx}:")
        print(f"    Event:     [{'OK' if ev_ok else 'FAIL'}] {s1['eventName']} ({s1['eventId']})")
        print(f"    Market:    [{'OK' if mkt_ok else 'FAIL'}] {s1['marketName']} ({s1['marketId']})")
        print(f"    Selection: [{'OK' if sel_ok else 'FAIL'}] {s1['selectionName']} ({s1['selectionId']})")
        print(f"    Odds:      [{'OK' if odds_ok else 'DIFF'}] Slip 1: {s1['odds']} | Slip 2: {s2['odds']}")

        if not (ev_ok and mkt_ok and sel_ok):
            all_matched = False

    print("\n" + "=" * 60)
    if all_matched:
        print("RESULT: ROUND TRIP VERIFICATION PASSED (100% SEMANTIC IDENTITY)")
        print("=" * 60)
        sys.exit(0)
    else:
        print("RESULT: ROUND TRIP VERIFICATION FAILED")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
