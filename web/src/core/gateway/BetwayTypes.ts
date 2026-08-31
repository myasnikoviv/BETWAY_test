/**
 * Internal private Betway DTO types for raw HTTP communication with Betway Nigeria endpoints.
 * These types must NOT be leaked outside the gateway module to domain consumers (INV-02).
 */

/**
 * Outcome payload item submitted to Betway BookABet endpoint.
 */
export interface BetwayOutcomePayload {
  /** Outcome identifier (e.g. "722212125461718") */
  outcomeId: string;
  /** Sport event identifier (e.g. 72221212) */
  eventId: number | string;
  /** Market identifier (e.g. "72221212546") */
  marketId: string;
  /** Selected flag (always true for active legs) */
  selected: boolean;
}

/**
 * Request payload sent to Betway BookABet (POST /v1/Betting/BookABet).
 */
export interface BetwayBookABetRequest {
  cultureCode?: string;
  countryCode?: string;
  isSingleBet?: boolean;
  outcomes: BetwayOutcomePayload[];
}

/**
 * Request payload sent to Betway FindBookABet (POST /v2/Betting/FindBookABet).
 */
export interface BetwayFindBookABetRequest {
  countryCode?: string;
  bookingCode: string;
  cultureCode?: string;
}

/**
 * Nested price information from raw Betway response.
 */
export interface BetwayRawPrice {
  outcomeId?: string;
  numerator?: number;
  denominator?: number;
  priceDecimal?: number;
  version?: number;
  emopSource?: unknown;
}

/**
 * Nested outcome information from raw Betway response.
 */
export interface BetwayRawOutcome {
  outcomeId?: string;
  shouldDisplay?: boolean;
  isTradingActive?: boolean;
  marketId?: string;
  eventId?: number | string;
  name?: string;
  displayName?: string;
  sbv?: string;
  index?: number;
  handicap?: number;
  homeScore?: unknown;
  awayScore?: unknown;
  nonRunner?: unknown;
  isBoosted?: boolean;
  version?: number;
  isCashOutAllowed?: boolean;
  [key: string]: unknown;
}

/**
 * Nested market information from raw Betway response.
 */
export interface BetwayRawMarket {
  marketId?: string;
  isActive?: boolean;
  shouldDisplay?: boolean;
  isSuspended?: boolean;
  eventId?: number | string;
  name?: string;
  displayName?: string;
  index?: number;
  handicap?: number;
  isCashOutAllowed?: boolean;
  isBoosted?: boolean;
  version?: number;
  isSportBonusAllowed?: boolean;
  [key: string]: unknown;
}

/**
 * Nested sport event information from raw Betway response.
 */
export interface BetwayRawSportEvent {
  eventId?: number | string;
  isActive?: boolean;
  isFinished?: boolean;
  isLive?: boolean;
  shouldDisplay?: boolean;
  name?: string;
  displayName?: string;
  signalRGroupId?: string;
  expectedStartEpoch?: number;
  expectedEndEpoch?: number | null;
  venueEpoch?: number | null;
  sportId?: string;
  regionId?: string;
  region?: string;
  leagueId?: string;
  league?: string;
  joinedLeagueId?: string;
  homeTeam?: string;
  awayTeam?: string;
  isBoosted?: boolean;
  isBookedForLive?: boolean;
  isOutright?: boolean;
  version?: number;
  [key: string]: unknown;
}

/**
 * Single selection item inside raw Betway FindBookABet response.
 */
export interface BetwayRawSelection {
  isEachWayActive?: boolean | null;
  isStartingPrice?: boolean;
  isNested?: boolean | null;
  specialBetType?: string | null;
  multiplier?: number | null;
  outcomeId?: string;
  marketName?: string;
  marketId?: string;
  marketGroupName?: string | null;
  marketIsSportBonusAllowed?: boolean;
  price?: BetwayRawPrice;
  outcome?: BetwayRawOutcome;
  market?: BetwayRawMarket;
  originalMarket?: unknown;
  sportEvent?: BetwayRawSportEvent;
  isCashOutAllowed?: boolean;
  eventId?: number | string;
  eventName?: string;
  eventEpoch?: number;
  eventExpectedEndEpoch?: number | null;
  eventIsSportBonusAllowed?: boolean;
  venueEpoch?: number | null;
  outcomeName?: string;
  priceDenominator?: number;
  priceNumerator?: number;
  priceDecimal?: number;
  isMarketActive?: boolean;
  isEventActive?: boolean;
  isOutcomeActive?: boolean;
  sportId?: string;
  league?: string;
  region?: string;
  [key: string]: unknown;
}

/**
 * Raw response returned by Betway FindBookABet endpoint.
 */
export interface BetwayRawFindResponse {
  selections?: BetwayRawSelection[];
  isBuildABet?: boolean;
  isSingleBet?: boolean;
  accountId?: string;
  errorCode?: number;
  message?: string;
  status?: number | string;
  [key: string]: unknown;
}

/**
 * Raw response returned by Betway BookABet endpoint.
 */
export interface BetwayRawBookResponse {
  bookingCode: string;
  errorCode?: number;
  message?: string;
  status?: number | string;
  [key: string]: unknown;
}
