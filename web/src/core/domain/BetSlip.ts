import type { BetSelection } from './BetSelection';

/**
 * Canonical domain model representing a structured betting slip.
 * Decoupled from bookmaker-specific DTO payloads.
 */
export interface BetSlip {
  /** Optional booking code identifying the slip on Betway (e.g. "BW6D7ABCFB") */
  bookingCode?: string;
  /** Array of individual betting legs / selections */
  selections: BetSelection[];
  /** Cumulative product of all selection odds, rounded to 2 decimal places */
  totalOdds: number;
  /** Single (1 selection) vs. Multi bet classification */
  isSingleBet: boolean;
  /** ISO timestamp when the slip was created / resolved */
  createdAt: string;
}

/**
 * Computes the cumulative total odds from an array of bet selections.
 * Multiplies all leg odds and rounds the result to 2 decimal places.
 * Returns 0 if selections array is empty.
 *
 * @param selections - Array of canonical BetSelection items
 * @returns Cumulative decimal odds rounded to 2 decimal places
 */
export function calculateTotalOdds(selections: readonly BetSelection[]): number {
  if (selections.length === 0) {
    return 0;
  }

  const rawProduct = selections.reduce((acc, sel) => {
    const odds = typeof sel.odds === 'number' && Number.isFinite(sel.odds) ? sel.odds : 1;
    return acc * odds;
  }, 1);

  return Math.round((rawProduct + Number.EPSILON) * 100) / 100;
}

/**
 * Parameters for creating a canonical BetSlip instance.
 */
export interface CreateBetSlipParams {
  bookingCode?: string;
  selections: BetSelection[];
  totalOdds?: number;
  isSingleBet?: boolean;
  createdAt?: string;
}

/**
 * Factory function to create a canonical BetSlip with calculated defaults.
 *
 * @param params - Configuration parameters
 * @returns Canonical BetSlip object
 */
export function createBetSlip(params: CreateBetSlipParams): BetSlip {
  const selections = [...params.selections];
  const isSingleBet = params.isSingleBet ?? (selections.length === 1);
  const totalOdds = params.totalOdds ?? calculateTotalOdds(selections);
  const createdAt = params.createdAt ?? new Date().toISOString();

  return {
    bookingCode: params.bookingCode,
    selections,
    totalOdds,
    isSingleBet,
    createdAt,
  };
}
