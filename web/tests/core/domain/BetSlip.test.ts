import { describe, it, expect } from 'vitest';
import { calculateTotalOdds, createBetSlip, type BetSelection } from '@/core/domain';

describe('BetSlip Domain Model & Odds Calculation', () => {
  const sampleSelection1: BetSelection = {
    eventId: '101',
    eventName: 'Chelsea vs. Liverpool',
    marketId: 'm1',
    marketName: 'Match Winner 1X2',
    selectionId: 's1',
    selectionName: 'Chelsea',
    odds: 2.5,
  };

  const sampleSelection2: BetSelection = {
    eventId: '102',
    eventName: 'Real Madrid vs. Barcelona',
    marketId: 'm2',
    marketName: 'Both Teams To Score',
    selectionId: 's2',
    selectionName: 'Yes',
    odds: 1.8,
  };

  const sampleSelection3: BetSelection = {
    eventId: '103',
    eventName: 'Bayern Munich vs. Dortmund',
    marketId: 'm3',
    marketName: 'Over/Under 2.5',
    selectionId: 's3',
    selectionName: 'Over 2.5',
    odds: 1.55,
  };

  describe('calculateTotalOdds', () => {
    it('should return 0 when selections array is empty', () => {
      expect(calculateTotalOdds([])).toBe(0);
    });

    it('should return the single leg odds for 1 selection', () => {
      expect(calculateTotalOdds([sampleSelection1])).toBe(2.5);
    });

    it('should calculate cumulative product of multiple selections', () => {
      // 2.5 * 1.8 = 4.5
      expect(calculateTotalOdds([sampleSelection1, sampleSelection2])).toBe(4.5);
    });

    it('should round total odds to 2 decimal places properly', () => {
      // 2.5 * 1.8 * 1.55 = 6.975 -> rounded to 6.98
      expect(calculateTotalOdds([sampleSelection1, sampleSelection2, sampleSelection3])).toBe(6.98);
    });
  });

  describe('createBetSlip', () => {
    it('should create a single bet slip with automatic odds calculation and isSingleBet=true', () => {
      const slip = createBetSlip({
        bookingCode: 'BW12345',
        selections: [sampleSelection1],
      });

      expect(slip.bookingCode).toBe('BW12345');
      expect(slip.selections).toHaveLength(1);
      expect(slip.totalOdds).toBe(2.5);
      expect(slip.isSingleBet).toBe(true);
      expect(typeof slip.createdAt).toBe('string');
      expect(new Date(slip.createdAt).getTime()).not.toBeNaN();
    });

    it('should create a multi bet slip with isSingleBet=false', () => {
      const slip = createBetSlip({
        bookingCode: 'BW99999',
        selections: [sampleSelection1, sampleSelection2],
      });

      expect(slip.bookingCode).toBe('BW99999');
      expect(slip.selections).toHaveLength(2);
      expect(slip.totalOdds).toBe(4.5);
      expect(slip.isSingleBet).toBe(false);
    });

    it('should allow explicit overrides for isSingleBet, totalOdds, and createdAt', () => {
      const customDate = '2026-08-31T12:00:00.000Z';
      const slip = createBetSlip({
        bookingCode: 'BW_CUSTOM',
        selections: [sampleSelection1],
        totalOdds: 10.0,
        isSingleBet: false,
        createdAt: customDate,
      });

      expect(slip.bookingCode).toBe('BW_CUSTOM');
      expect(slip.totalOdds).toBe(10.0);
      expect(slip.isSingleBet).toBe(false);
      expect(slip.createdAt).toBe(customDate);
    });
  });
});
