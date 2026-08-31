#!/usr/bin/env bash
# Minimal reproducible resolve request for Betway Nigeria
# Usage: ./resolve.sh <BOOKING_CODE>
# Example: ./resolve.sh BW6D7ABCFB

BOOKING_CODE="${1:-BW6D7ABCFB}"

curl -s -X POST "https://www.betway.com.ng/appsynapse/bet-api-sr02/v2/Betting/FindBookABet" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -d "{
    \"countryCode\": \"NG\",
    \"bookingCode\": \"${BOOKING_CODE}\",
    \"cultureCode\": \"en-US\"
  }"
