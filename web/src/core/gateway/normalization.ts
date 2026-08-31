import type { BetSelection } from '../domain/BetSelection';
import { AppError } from '../errors/AppError';
import type {
  BetwayOutcomePayload,
  BetwayRawFindResponse,
  BetwayRawSelection,
} from './BetwayTypes';

/**
 * Normalizes a single raw Betway selection DTO into a canonical BetSelection domain model.
 * Gracefully resolves fields from either the root selection object or nested sub-objects.
 *
 * @param raw - Raw selection object from Betway FindBookABet response
 * @returns Canonical BetSelection object
 */
export function normalizeBetwaySelection(raw: BetwayRawSelection): BetSelection {
  const eventId =
    raw.eventId !== undefined && raw.eventId !== null
      ? String(raw.eventId)
      : raw.sportEvent?.eventId !== undefined && raw.sportEvent?.eventId !== null
      ? String(raw.sportEvent.eventId)
      : '';

  const eventName =
    raw.eventName?.trim() ||
    raw.sportEvent?.displayName?.trim() ||
    raw.sportEvent?.name?.trim() ||
    '';

  const marketId =
    raw.marketId !== undefined && raw.marketId !== null
      ? String(raw.marketId)
      : raw.market?.marketId !== undefined && raw.market?.marketId !== null
      ? String(raw.market.marketId)
      : '';

  const marketName =
    raw.marketName?.trim() ||
    raw.market?.displayName?.trim() ||
    raw.market?.name?.trim() ||
    '';

  const selectionId =
    raw.outcomeId !== undefined && raw.outcomeId !== null
      ? String(raw.outcomeId)
      : raw.outcome?.outcomeId !== undefined && raw.outcome?.outcomeId !== null
      ? String(raw.outcome.outcomeId)
      : raw.price?.outcomeId !== undefined && raw.price?.outcomeId !== null
      ? String(raw.price.outcomeId)
      : '';

  const selectionName =
    raw.outcomeName?.trim() ||
    raw.outcome?.displayName?.trim() ||
    raw.outcome?.name?.trim() ||
    '';

  let odds = 0;
  if (typeof raw.priceDecimal === 'number' && Number.isFinite(raw.priceDecimal)) {
    odds = raw.priceDecimal;
  } else if (typeof raw.price?.priceDecimal === 'number' && Number.isFinite(raw.price.priceDecimal)) {
    odds = raw.price.priceDecimal;
  } else if (
    typeof raw.priceNumerator === 'number' &&
    typeof raw.priceDenominator === 'number' &&
    raw.priceDenominator > 0
  ) {
    odds = Math.round((raw.priceNumerator / raw.priceDenominator + 1) * 100) / 100;
  } else if (
    typeof raw.price?.numerator === 'number' &&
    typeof raw.price?.denominator === 'number' &&
    raw.price.denominator > 0
  ) {
    odds = Math.round((raw.price.numerator / raw.price.denominator + 1) * 100) / 100;
  }

  const sportId = raw.sportId || raw.sportEvent?.sportId || undefined;
  const league = raw.league || raw.sportEvent?.league || undefined;
  const region = raw.region || raw.sportEvent?.region || undefined;
  const eventStartTime = raw.eventEpoch ?? raw.sportEvent?.expectedStartEpoch ?? undefined;

  let isMarketActive: boolean | undefined = undefined;
  if (typeof raw.isMarketActive === 'boolean') {
    isMarketActive = raw.isMarketActive;
  } else if (typeof raw.market?.isActive === 'boolean') {
    isMarketActive = raw.market.isActive;
  } else if (typeof raw.isOutcomeActive === 'boolean' && typeof raw.isEventActive === 'boolean') {
    isMarketActive = raw.isOutcomeActive && raw.isEventActive;
  }

  return {
    eventId,
    eventName,
    marketId,
    marketName,
    selectionId,
    selectionName,
    odds,
    ...(sportId ? { sportId } : {}),
    ...(league ? { league } : {}),
    ...(region ? { region } : {}),
    ...(eventStartTime !== undefined ? { eventStartTime } : {}),
    ...(isMarketActive !== undefined ? { isMarketActive } : {}),
  };
}

/**
 * Maps a full raw Betway FindBookABet response into an array of canonical BetSelection domain items.
 * Throws AppError('BOOKING_CODE_NOT_FOUND', 404) if response has no selections or is empty.
 *
 * @param raw - Raw FindBookABet response from Betway
 * @returns Array of canonical BetSelection items
 */
export function normalizeBetwayFindResponse(raw: BetwayRawFindResponse): BetSelection[] {
  if (!raw || !Array.isArray(raw.selections) || raw.selections.length === 0) {
    throw AppError.notFound('The provided Betway booking code could not be found or has expired.');
  }

  return raw.selections.map(normalizeBetwaySelection);
}

/**
 * Maps canonical BetSelection domain items into Betway outcomes payload for BookABet creation.
 * Converts numeric event IDs to number format expected by Betway Nigeria.
 *
 * @param selections - Canonical BetSelection array
 * @returns Array of Betway outcome payload items
 */
export function mapSelectionsToBetwayOutcomes(
  selections: readonly BetSelection[]
): BetwayOutcomePayload[] {
  if (!selections || !Array.isArray(selections) || selections.length === 0) {
    throw AppError.invalidInput('At least one selection is required to create a booking code.');
  }

  return selections.map((sel) => {
    if (!sel.selectionId || typeof sel.selectionId !== 'string' || sel.selectionId.trim() === '') {
      throw AppError.invalidInput('Selection is missing a valid selectionId (outcomeId).');
    }

    const trimmedEventId = (sel.eventId ?? '').toString().trim();
    const parsedNum = Number(trimmedEventId);
    const eventId = Number.isFinite(parsedNum) && trimmedEventId !== '' ? parsedNum : trimmedEventId;

    return {
      outcomeId: sel.selectionId.trim(),
      eventId,
      marketId: (sel.marketId ?? '').toString().trim(),
      selected: true,
    };
  });
}
