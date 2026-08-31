import { describe, expect, it } from 'vitest';
import {
  betSelectionInputSchema,
  BOOKING_CODE_REGEX,
  convertBookingCodeSchema,
  createBookingCodeSchema,
  resolveBookingCodeSchema,
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('BOOKING_CODE_REGEX', () => {
    it('matches valid 4-15 alphanumeric codes', () => {
      expect(BOOKING_CODE_REGEX.test('BW12')).toBe(true);
      expect(BOOKING_CODE_REGEX.test('BW6D7ABCFB')).toBe(true);
      expect(BOOKING_CODE_REGEX.test('123456789012345')).toBe(true);
    });

    it('rejects codes shorter than 4 characters', () => {
      expect(BOOKING_CODE_REGEX.test('')).toBe(false);
      expect(BOOKING_CODE_REGEX.test('ABC')).toBe(false);
    });

    it('rejects codes longer than 15 characters', () => {
      expect(BOOKING_CODE_REGEX.test('1234567890123456')).toBe(false);
    });

    it('rejects codes with special characters or spaces', () => {
      expect(BOOKING_CODE_REGEX.test('BW-1234')).toBe(false);
      expect(BOOKING_CODE_REGEX.test('BW 1234')).toBe(false);
      expect(BOOKING_CODE_REGEX.test('BW_1234')).toBe(false);
    });
  });

  describe('resolveBookingCodeSchema', () => {
    it('validates a valid booking code', () => {
      const result = resolveBookingCodeSchema.safeParse({
        bookingCode: 'BW6D7ABCFB',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bookingCode).toBe('BW6D7ABCFB');
      }
    });

    it('trims whitespace around booking code', () => {
      const result = resolveBookingCodeSchema.safeParse({
        bookingCode: '  BW6D7ABCFB  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bookingCode).toBe('BW6D7ABCFB');
      }
    });

    it('rejects missing or empty booking code', () => {
      const result1 = resolveBookingCodeSchema.safeParse({});
      expect(result1.success).toBe(false);

      const result2 = resolveBookingCodeSchema.safeParse({ bookingCode: '' });
      expect(result2.success).toBe(false);
    });

    it('rejects malformed booking codes', () => {
      const result = resolveBookingCodeSchema.safeParse({
        bookingCode: 'invalid!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('betSelectionInputSchema', () => {
    it('validates a minimal valid selection', () => {
      const valid = {
        eventId: '72221212',
        marketId: '72221212546',
        selectionId: '722212125461718',
      };
      const result = betSelectionInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('validates a full selection with all optional fields', () => {
      const full = {
        eventId: '72221212',
        eventName: 'Aston Villa vs Arsenal',
        marketId: '72221212546',
        marketName: 'Double Chance',
        selectionId: '722212125461718',
        selectionName: 'Aston Villa/Draw',
        odds: 1.85,
        sportId: 'soccer',
        league: 'Premier League',
        region: 'England',
        eventStartTime: 1725120000,
        isMarketActive: true,
      };
      const result = betSelectionInputSchema.safeParse(full);
      expect(result.success).toBe(true);
    });

    it('rejects selection missing required fields', () => {
      expect(betSelectionInputSchema.safeParse({ marketId: '1', selectionId: '2' }).success).toBe(false);
      expect(betSelectionInputSchema.safeParse({ eventId: '1', selectionId: '2' }).success).toBe(false);
      expect(betSelectionInputSchema.safeParse({ eventId: '1', marketId: '2' }).success).toBe(false);
    });
  });

  describe('createBookingCodeSchema', () => {
    it('validates a valid create request with single selection', () => {
      const result = createBookingCodeSchema.safeParse({
        selections: [
          {
            eventId: '72221212',
            marketId: '72221212546',
            selectionId: '722212125461718',
          },
        ],
        isSingleBet: true,
      });
      expect(result.success).toBe(true);
    });

    it('validates multiple selections', () => {
      const result = createBookingCodeSchema.safeParse({
        selections: [
          { eventId: '1', marketId: '2', selectionId: '3' },
          { eventId: '4', marketId: '5', selectionId: '6' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty selections array', () => {
      const result = createBookingCodeSchema.safeParse({
        selections: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing selections', () => {
      const result = createBookingCodeSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('convertBookingCodeSchema', () => {
    it('validates when bookingCode is provided', () => {
      const result = convertBookingCodeSchema.safeParse({
        bookingCode: 'BW6D7ABCFB',
      });
      expect(result.success).toBe(true);
    });

    it('validates when sourceBookingCode is provided', () => {
      const result = convertBookingCodeSchema.safeParse({
        sourceBookingCode: 'BW6D7ABCFB',
      });
      expect(result.success).toBe(true);
    });

    it('validates when both bookingCode and sourceBookingCode are provided', () => {
      const result = convertBookingCodeSchema.safeParse({
        bookingCode: 'BW6D7ABCFB',
        sourceBookingCode: 'BW6D7ABCFB',
      });
      expect(result.success).toBe(true);
    });

    it('rejects when neither code is provided', () => {
      const result = convertBookingCodeSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects malformed booking codes', () => {
      const result = convertBookingCodeSchema.safeParse({
        bookingCode: 'bad!',
      });
      expect(result.success).toBe(false);
    });
  });
});
