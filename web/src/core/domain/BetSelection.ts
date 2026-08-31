/**
 * Canonical domain model representing an individual betting selection (leg).
 * Decoupled from external bookmaker (Betway) payload schemas.
 */
export interface BetSelection {
  /** External event identifier (e.g. "72221212") */
  eventId: string;
  /** Human-readable event description (e.g. "Aston Villa vs. Arsenal FC") */
  eventName: string;
  /** External market identifier (e.g. "72221212546") */
  marketId: string;
  /** Human-readable market description (e.g. "Double Chance & Both Teams To Score (GG/NG)") */
  marketName: string;
  /** External outcome/selection identifier (e.g. "722212125461718") */
  selectionId: string;
  /** Human-readable outcome name (e.g. "Aston Villa/Draw & Yes") */
  selectionName: string;
  /** Decimal odds value (e.g. 3.35) */
  odds: number;
  /** Sport category identifier (e.g. "soccer") */
  sportId?: string;
  /** Competition / League name (e.g. "Premier League") */
  league?: string;
  /** Geographic region (e.g. "England") */
  region?: string;
  /** Event start timestamp in epoch seconds */
  eventStartTime?: number;
  /** Flag indicating if the market is currently active/open */
  isMarketActive?: boolean;
}
