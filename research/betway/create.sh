#!/usr/bin/env bash
# Minimal reproducible create booking code request for Betway Nigeria
# Usage: ./create.sh

curl -s -X POST "https://www.betway.com.ng/appsynapse/bet-api-sr02/v1/Betting/BookABet" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -d '{
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
  }'
