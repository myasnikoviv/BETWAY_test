/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConvertBetSlip } from '@/hooks/useConvertBetSlip';
import { ApiClientError } from '@/lib/api-client';
import type { ConvertResult } from '@/core/domain/ConvertResult';

describe('useConvertBetSlip hook', () => {
  const mockConvertResult: ConvertResult = {
    sourceBookingCode: 'BW6D7ABCFB',
    newBookingCode: 'BW6D7AC4BA',
    convertedAt: '2026-08-31T15:40:05.000Z',
    slip: {
      bookingCode: 'BW6D7AC4BA',
      totalOdds: 21.57,
      isSingleBet: false,
      createdAt: '2026-08-31T15:40:05.000Z',
      selections: [
        {
          eventId: '72221212',
          eventName: 'Aston Villa vs. Arsenal FC',
          marketId: '72221212546',
          marketName: 'Double Chance & Both Teams To Score (GG/NG)',
          selectionId: '722212125461718',
          selectionName: 'Aston Villa/Draw & Yes',
          odds: 3.35,
          league: 'Premier League',
        },
      ],
    },
  };

  it('initializes with idle state, null convertResult, and null convertError', () => {
    const { result } = renderHook(() => useConvertBetSlip());

    expect(result.current.status).toBe('idle');
    expect(result.current.isConverting).toBe(false);
    expect(result.current.convertResult).toBeNull();
    expect(result.current.convertError).toBeNull();
  });

  it('handles successful booking code conversion', async () => {
    const mockConvert = vi.fn().mockResolvedValue(mockConvertResult);
    const { result } = renderHook(() =>
      useConvertBetSlip({ convertFn: mockConvert })
    );

    let promise: Promise<ConvertResult | null>;
    act(() => {
      promise = result.current.convert('bw6d7abcfb');
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.isConverting).toBe(true);
    expect(result.current.convertError).toBeNull();

    let converted: ConvertResult | null = null;
    await act(async () => {
      converted = await promise;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.isConverting).toBe(false);
    expect(result.current.convertResult).toEqual(mockConvertResult);
    expect(result.current.convertError).toBeNull();
    expect(converted).toEqual(mockConvertResult);
    expect(mockConvert).toHaveBeenCalledWith('BW6D7ABCFB');
  });

  it('validates empty booking code and sets error without calling convertFn', async () => {
    const mockConvert = vi.fn();
    const { result } = renderHook(() =>
      useConvertBetSlip({ convertFn: mockConvert })
    );

    let res: ConvertResult | null = null;
    await act(async () => {
      res = await result.current.convert('   ');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isConverting).toBe(false);
    expect(result.current.convertError).toBe('Please enter a Betway booking code.');
    expect(result.current.convertResult).toBeNull();
    expect(res).toBeNull();
    expect(mockConvert).not.toHaveBeenCalled();
  });

  it('validates invalid format booking code without calling convertFn', async () => {
    const mockConvert = vi.fn();
    const { result } = renderHook(() =>
      useConvertBetSlip({ convertFn: mockConvert })
    );

    await act(async () => {
      await result.current.convert('AB'); // too short (min 4)
    });

    expect(result.current.status).toBe('error');
    expect(result.current.convertError).toContain('between 4 and 15 alphanumeric characters');
    expect(mockConvert).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.convert('INVALID-CODE!');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.convertError).toContain('between 4 and 15 alphanumeric characters');
    expect(mockConvert).not.toHaveBeenCalled();
  });

  it('handles ApiClientError on conversion failure', async () => {
    const mockConvert = vi.fn().mockRejectedValue(
      new ApiClientError(
        'All selections in the booking code are concluded or inactive.',
        'STALE_SELECTIONS',
        422
      )
    );

    const { result } = renderHook(() =>
      useConvertBetSlip({ convertFn: mockConvert })
    );

    await act(async () => {
      await result.current.convert('BWSTALE123');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isConverting).toBe(false);
    expect(result.current.convertResult).toBeNull();
    expect(result.current.convertError).toBe(
      'All selections in the booking code are concluded or inactive.'
    );
  });

  it('handles generic Error on conversion failure', async () => {
    const mockConvert = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() =>
      useConvertBetSlip({ convertFn: mockConvert })
    );

    await act(async () => {
      await result.current.convert('BW6D7ABCFB');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.convertError).toBe('Network error');
    expect(result.current.convertResult).toBeNull();
  });

  it('handles unknown non-Error rejection on conversion failure', async () => {
    const mockConvert = vi.fn().mockRejectedValue('Unknown error');
    const { result } = renderHook(() =>
      useConvertBetSlip({ convertFn: mockConvert })
    );

    await act(async () => {
      await result.current.convert('BW6D7ABCFB');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.convertError).toBe('Failed to convert booking code. Please try again.');
    expect(result.current.convertResult).toBeNull();
  });

  it('discards stale response if a newer conversion request was dispatched', async () => {
    let resolveFirst!: (value: ConvertResult) => void;
    const firstPromise = new Promise<ConvertResult>((res) => {
      resolveFirst = res;
    });

    const secondConvertResult: ConvertResult = {
      ...mockConvertResult,
      sourceBookingCode: 'BWNEW12345',
      newBookingCode: 'BWNEWRESULT',
    };

    const mockConvert = vi.fn().mockImplementation((code: string) => {
      if (code === 'BWFIRST123') return firstPromise;
      return Promise.resolve(secondConvertResult);
    });

    const { result } = renderHook(() =>
      useConvertBetSlip({ convertFn: mockConvert })
    );

    // Dispatch first conversion
    act(() => {
      result.current.convert('BWFIRST123');
    });

    // Dispatch second conversion immediately
    await act(async () => {
      await result.current.convert('BWNEW12345');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.convertResult?.newBookingCode).toBe('BWNEWRESULT');

    // Now resolve first promise
    await act(async () => {
      resolveFirst(mockConvertResult);
    });

    // Result should still be the second one!
    expect(result.current.convertResult?.newBookingCode).toBe('BWNEWRESULT');
  });

  it('resets conversion state back to idle when reset is invoked', async () => {
    const mockConvert = vi.fn().mockResolvedValue(mockConvertResult);
    const { result } = renderHook(() =>
      useConvertBetSlip({ convertFn: mockConvert })
    );

    await act(async () => {
      await result.current.convert('BW6D7ABCFB');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.convertResult).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.isConverting).toBe(false);
    expect(result.current.convertResult).toBeNull();
    expect(result.current.convertError).toBeNull();
  });

  it('allows manual error clearing or setting via setConvertError', () => {
    const { result } = renderHook(() => useConvertBetSlip());

    act(() => {
      result.current.setConvertError('Custom error message');
    });

    expect(result.current.convertError).toBe('Custom error message');

    act(() => {
      result.current.setConvertError(null);
    });

    expect(result.current.convertError).toBeNull();
  });
});
