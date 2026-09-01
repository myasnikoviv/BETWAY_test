/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBetSlip } from '@/hooks/useBetSlip';
import { ApiClientError } from '@/lib/api-client';
import type { BetSlip } from '@/core/domain/BetSlip';

describe('useBetSlip hook', () => {
  const mockSlip: BetSlip = {
    bookingCode: 'BW6D7ABCFB',
    totalOdds: 21.57,
    isSingleBet: false,
    createdAt: '2026-08-31T15:40:00.000Z',
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
  };

  it('initializes with idle state, null slip, and null error', () => {
    const { result } = renderHook(() => useBetSlip());

    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.slip).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.bookingCode).toBe('');
  });

  it('handles successful booking code resolution', async () => {
    const mockResolve = vi.fn().mockResolvedValue(mockSlip);
    const { result } = renderHook(() => useBetSlip({ resolveFn: mockResolve }));

    let promise: Promise<void>;
    act(() => {
      promise = result.current.resolveCode('bw6d7abcfb');
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.bookingCode).toBe('BW6D7ABCFB');

    await act(async () => {
      await promise;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.slip).toEqual(mockSlip);
    expect(result.current.error).toBeNull();
    expect(mockResolve).toHaveBeenCalledWith('BW6D7ABCFB');
  });

  it('validates empty booking code and sets error without calling resolveFn', async () => {
    const mockResolve = vi.fn();
    const { result } = renderHook(() => useBetSlip({ resolveFn: mockResolve }));

    await act(async () => {
      await result.current.resolveCode('   ');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Please enter a Betway booking code.');
    expect(result.current.slip).toBeNull();
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('validates invalid format booking code (e.g. too short or symbols) without calling resolveFn', async () => {
    const mockResolve = vi.fn();
    const { result } = renderHook(() => useBetSlip({ resolveFn: mockResolve }));

    await act(async () => {
      await result.current.resolveCode('ABC'); // only 3 chars (min is 4)
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('between 4 and 15 alphanumeric characters');
    expect(mockResolve).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.resolveCode('INVALID-CODE!');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('between 4 and 15 alphanumeric characters');
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('handles ApiClientError on resolution failure', async () => {
    const mockResolve = vi.fn().mockRejectedValue(
      new ApiClientError(
        'The provided Betway booking code could not be found or has expired.',
        'BOOKING_CODE_NOT_FOUND',
        404
      )
    );

    const { result } = renderHook(() => useBetSlip({ resolveFn: mockResolve }));

    await act(async () => {
      await result.current.resolveCode('BW00000000');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.slip).toBeNull();
    expect(result.current.error).toBe(
      'The provided Betway booking code could not be found or has expired.'
    );
  });

  it('handles generic Error on resolution failure', async () => {
    const mockResolve = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useBetSlip({ resolveFn: mockResolve }));

    await act(async () => {
      await result.current.resolveCode('BW6D7ABCFB');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Network error');
    expect(result.current.slip).toBeNull();
  });

  it('discards stale response if a newer request was dispatched', async () => {
    let resolveFirst!: (value: BetSlip) => void;
    const firstPromise = new Promise<BetSlip>((res) => {
      resolveFirst = res;
    });

    const secondSlip: BetSlip = {
      ...mockSlip,
      bookingCode: 'BWNEW12345',
    };

    const mockResolve = vi.fn().mockImplementation((code: string) => {
      if (code === 'BWFIRST123') return firstPromise;
      return Promise.resolve(secondSlip);
    });

    const { result } = renderHook(() => useBetSlip({ resolveFn: mockResolve }));

    // Dispatch first request
    act(() => {
      result.current.resolveCode('BWFIRST123');
    });

    // Dispatch second request immediately
    await act(async () => {
      await result.current.resolveCode('BWNEW12345');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.slip?.bookingCode).toBe('BWNEW12345');

    // Now resolve first promise
    await act(async () => {
      resolveFirst(mockSlip);
    });

    // Slip should still be the second one!
    expect(result.current.slip?.bookingCode).toBe('BWNEW12345');
  });

  it('resets state back to idle when reset is invoked', async () => {
    const mockResolve = vi.fn().mockResolvedValue(mockSlip);
    const { result } = renderHook(() => useBetSlip({ resolveFn: mockResolve }));

    await act(async () => {
      await result.current.resolveCode('BW6D7ABCFB');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.slip).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.slip).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.bookingCode).toBe('');
  });
});
