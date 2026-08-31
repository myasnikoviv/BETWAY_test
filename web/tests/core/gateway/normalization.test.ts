import { describe, expect, it } from 'vitest';
import type { BetSelection } from '@/core/domain/BetSelection';
import { AppError } from '@/core/errors/AppError';
import {
  mapSelectionsToBetwayOutcomes,
  normalizeBetwayFindResponse,
  normalizeBetwaySelection,
} from '@/core/gateway/normalization';
import type { BetwayRawFindResponse, BetwayRawSelection } from '@/core/gateway/BetwayTypes';
import resolveFixture from '../../fixtures/resolve_response.json';

describe('Gateway Normalization', () => {
  describe('normalizeBetwayFindResponse', () => {
    it('normalizes the static resolve fixture into canonical BetSelection array', () => {
      const selections = normalizeBetwayFindResponse(resolveFixture as BetwayRawFindResponse);

      expect(selections).toHaveLength(2);

      const [leg1, leg2] = selections;

      expect(leg1).toEqual({
        eventId: '72221212',
        eventName: 'Aston Villa vs. Arsenal FC',
        marketId: '72221212546',
        marketName: 'Double Chance & Both Teams To Score (GG/NG)',
        selectionId: '722212125461718',
        selectionName: 'Aston Villa/Draw & Yes',
        odds: 3.35,
        sportId: 'soccer',
        league: 'Premier League',
        region: 'England',
        eventStartTime: 1788202800,
        isMarketActive: true,
      });

      expect(leg2).toEqual({
        eventId: '72221244',
        eventName: 'Ipswich Town vs. Liverpool FC',
        marketId: '7222124412',
        marketName: 'Ipswich Town No Bet',
        selectionId: '7222124412776',
        selectionName: 'Draw',
        odds: 3.25,
        sportId: 'soccer',
        league: 'Premier League',
        region: 'England',
        eventStartTime: 1788548400,
        isMarketActive: true,
      });
    });

    it('throws AppError 404 BOOKING_CODE_NOT_FOUND when selections array is empty', () => {
      const emptyPayload: BetwayRawFindResponse = {
        selections: [],
        isBuildABet: false,
        isSingleBet: false,
      };

      expect(() => normalizeBetwayFindResponse(emptyPayload)).toThrowError(AppError);

      try {
        normalizeBetwayFindResponse(emptyPayload);
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.code).toBe('BOOKING_CODE_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });

    it('throws AppError 404 when response is missing selections property', () => {
      const invalidPayload = {} as BetwayRawFindResponse;
      expect(() => normalizeBetwayFindResponse(invalidPayload)).toThrowError(AppError);
    });
  });

  describe('normalizeBetwaySelection', () => {
    it('extracts nested fields when top-level fields are absent', () => {
      const rawNested: BetwayRawSelection = {
        sportEvent: {
          eventId: 98765432,
          displayName: 'Chelsea vs. Arsenal',
          sportId: 'soccer',
          league: 'FA Cup',
          region: 'England',
          expectedStartEpoch: 1789000000,
        },
        market: {
          marketId: '9876543201',
          displayName: 'Over/Under 2.5 Goals',
          isActive: true,
        },
        outcome: {
          outcomeId: '987654320101',
          displayName: 'Over 2.5',
        },
        price: {
          priceDecimal: 1.85,
        },
      };

      const result = normalizeBetwaySelection(rawNested);

      expect(result).toEqual({
        eventId: '98765432',
        eventName: 'Chelsea vs. Arsenal',
        marketId: '9876543201',
        marketName: 'Over/Under 2.5 Goals',
        selectionId: '987654320101',
        selectionName: 'Over 2.5',
        odds: 1.85,
        sportId: 'soccer',
        league: 'FA Cup',
        region: 'England',
        eventStartTime: 1789000000,
        isMarketActive: true,
      });
    });

    it('calculates decimal odds from fractional numerator and denominator when priceDecimal is omitted', () => {
      const rawFractional: BetwayRawSelection = {
        eventId: 1234,
        eventName: 'Team A vs Team B',
        marketId: 'm1',
        marketName: 'Match Winner',
        outcomeId: 'o1',
        outcomeName: 'Home',
        priceNumerator: 5,
        priceDenominator: 2, // 5/2 + 1 = 3.5
      };

      const result = normalizeBetwaySelection(rawFractional);
      expect(result.odds).toBe(3.5);
    });

    it('handles missing optional fields cleanly', () => {
      const minimal: BetwayRawSelection = {
        eventId: 100,
        eventName: 'Minimal Event',
        marketId: 'm100',
        marketName: 'Market 100',
        outcomeId: 'out100',
        outcomeName: 'Out 100',
        priceDecimal: 2.0,
      };

      const result = normalizeBetwaySelection(minimal);

      expect(result.eventId).toBe('100');
      expect(result.eventName).toBe('Minimal Event');
      expect(result.odds).toBe(2.0);
      expect(result.sportId).toBeUndefined();
      expect(result.league).toBeUndefined();
      expect(result.region).toBeUndefined();
      expect(result.eventStartTime).toBeUndefined();
      expect(result.isMarketActive).toBeUndefined();
    });
  });

  describe('mapSelectionsToBetwayOutcomes', () => {
    it('maps canonical BetSelection items to BetwayOutcomePayload format', () => {
      const canonicalSelections: BetSelection[] = [
        {
          eventId: '72221212',
          eventName: 'Aston Villa vs. Arsenal FC',
          marketId: '72221212546',
          marketName: 'Double Chance & Both Teams To Score (GG/NG)',
          selectionId: '722212125461718',
          selectionName: 'Aston Villa/Draw & Yes',
          odds: 3.35,
        },
        {
          eventId: '72221244',
          eventName: 'Ipswich Town vs. Liverpool FC',
          marketId: '7222124412',
          marketName: 'Ipswich Town No Bet',
          selectionId: '7222124412776',
          selectionName: 'Draw',
          odds: 3.25,
        },
      ];

      const outcomes = mapSelectionsToBetwayOutcomes(canonicalSelections);

      expect(outcomes).toEqual([
        {
          outcomeId: '722212125461718',
          eventId: 72221212,
          marketId: '72221212546',
          selected: true,
        },
        {
          outcomeId: '7222124412776',
          eventId: 72221244,
          marketId: '7222124412',
          selected: true,
        },
      ]);
    });

    it('preserves string eventId if eventId is non-numeric', () => {
      const selection: BetSelection = {
        eventId: 'event-custom-id',
        eventName: 'Custom Match',
        marketId: 'market-1',
        marketName: 'Winner',
        selectionId: 'sel-1',
        selectionName: 'Team 1',
        odds: 1.5,
      };

      const outcomes = mapSelectionsToBetwayOutcomes([selection]);
      expect(outcomes[0].eventId).toBe('event-custom-id');
    });

    it('throws AppError 400 INVALID_INPUT when selections array is empty', () => {
      expect(() => mapSelectionsToBetwayOutcomes([])).toThrowError(AppError);

      try {
        mapSelectionsToBetwayOutcomes([]);
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_INPUT');
        expect(appErr.statusCode).toBe(400);
      }
    });

    it('throws AppError 400 INVALID_INPUT when selection is missing selectionId', () => {
      const invalidSel = {
        eventId: '123',
        eventName: 'Test',
        marketId: 'm1',
        marketName: 'Market',
        selectionId: '',
        selectionName: 'Sel',
        odds: 2.0,
      };

      expect(() => mapSelectionsToBetwayOutcomes([invalidSel])).toThrowError(AppError);
    });
  });
});
