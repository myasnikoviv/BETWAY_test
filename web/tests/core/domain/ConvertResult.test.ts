import { describe, it, expect } from 'vitest';
import { createBetSlip, createConvertResult, type BetSelection } from '@/core/domain';

describe('ConvertResult Domain Model', () => {
  const sampleSelection: BetSelection = {
    eventId: '101',
    eventName: 'Arsenal vs. Man City',
    marketId: 'm1',
    marketName: 'Match Winner',
    selectionId: 's1',
    selectionName: 'Arsenal',
    odds: 2.1,
  };

  it('should instantiate a complete ConvertResult with defaults', () => {
    const slip = createBetSlip({
      bookingCode: 'BW_NEW_678',
      selections: [sampleSelection],
    });

    const result = createConvertResult({
      sourceBookingCode: 'BW_ORIG_123',
      newBookingCode: 'BW_NEW_678',
      slip,
    });

    expect(result.sourceBookingCode).toBe('BW_ORIG_123');
    expect(result.newBookingCode).toBe('BW_NEW_678');
    expect(result.slip).toBe(slip);
    expect(typeof result.convertedAt).toBe('string');
    expect(new Date(result.convertedAt).getTime()).not.toBeNaN();
  });

  it('should preserve explicit convertedAt timestamp', () => {
    const slip = createBetSlip({
      bookingCode: 'BW_NEW_678',
      selections: [sampleSelection],
    });
    const customTime = '2026-08-31T15:30:00.000Z';

    const result = createConvertResult({
      sourceBookingCode: 'BW_ORIG_123',
      newBookingCode: 'BW_NEW_678',
      slip,
      convertedAt: customTime,
    });

    expect(result.convertedAt).toBe(customTime);
  });
});
