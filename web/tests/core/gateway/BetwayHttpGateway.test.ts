import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@/core/errors/AppError';
import {
  BetwayHttpGateway,
  DEFAULT_FALLBACK_BASE_URL,
  DEFAULT_PRIMARY_BASE_URL,
} from '@/core/gateway/BetwayHttpGateway';
import type { BetwayOutcomePayload } from '@/core/gateway/BetwayTypes';
import createFixture from '../../fixtures/create_response.json';
import resolveFixture from '../../fixtures/resolve_response.json';

describe('BetwayHttpGateway', () => {
  const sampleOutcomes: BetwayOutcomePayload[] = [
    {
      outcomeId: '722212125461718',
      eventId: 72221212,
      marketId: '72221212546',
      selected: true,
    },
  ];

  describe('resolve', () => {
    it('sends correct POST request to primary endpoint and returns raw payload', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => resolveFixture,
      } as Response);

      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });
      const result = await gateway.resolve('BW6D7ABCFB');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${DEFAULT_PRIMARY_BASE_URL}/v2/Betting/FindBookABet`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            countryCode: 'NG',
            bookingCode: 'BW6D7ABCFB',
            cultureCode: 'en-US',
          }),
        })
      );

      expect(result).toEqual(resolveFixture);
    });

    it('validates booking code and throws AppError 400 before making network call', async () => {
      const mockFetch = vi.fn();
      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });

      await expect(gateway.resolve('')).rejects.toThrowError(AppError);
      await expect(gateway.resolve('   ')).rejects.toThrowError(AppError);
      expect(mockFetch).not.toHaveBeenCalled();

      try {
        await gateway.resolve('');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('INVALID_INPUT');
        expect((err as AppError).statusCode).toBe(400);
      }
    });

    it('maps HTTP 404 response to AppError 404 BOOKING_CODE_NOT_FOUND', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
      } as Response);

      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });

      await expect(gateway.resolve('NON_EXISTENT')).rejects.toThrowError(AppError);

      try {
        await gateway.resolve('NON_EXISTENT');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('BOOKING_CODE_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });

    it('maps Betway errorCode 13 response to AppError 404 BOOKING_CODE_NOT_FOUND', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ errorCode: 13, message: 'NotFound' }),
      } as Response);

      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });

      await expect(gateway.resolve('EXPIRED_CODE')).rejects.toThrowError(AppError);

      try {
        await gateway.resolve('EXPIRED_CODE');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('BOOKING_CODE_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });

    it('automatically fails over to fallback URL when primary URL fails with 503', async () => {
      const mockFetch = vi
        .fn()
        // First call to primary endpoint fails with 503
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ error: 'Service Unavailable' }),
        } as Response)
        // Second call to fallback endpoint succeeds with 200
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => resolveFixture,
        } as Response);

      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });
      const result = await gateway.resolve('BW6D7ABCFB');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `${DEFAULT_PRIMARY_BASE_URL}/v2/Betting/FindBookABet`,
        expect.anything()
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `${DEFAULT_FALLBACK_BASE_URL}/v2/Betting/FindBookABet`,
        expect.anything()
      );
      expect(result).toEqual(resolveFixture);
    });

    it('throws AppError 502 UPSTREAM_BETWAY_ERROR when both primary and fallback fail', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      } as Response);

      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });

      try {
        await gateway.resolve('BW6D7ABCFB');
        expect.unreachable('Should have thrown AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('UPSTREAM_BETWAY_ERROR');
        expect((err as AppError).statusCode).toBe(502);
      }

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('handles network timeout and maps to AppError 502 UPSTREAM_BETWAY_ERROR', async () => {
      const timeoutError = new Error('The operation was aborted due to timeout');
      timeoutError.name = 'TimeoutError';

      const mockFetch = vi.fn().mockRejectedValue(timeoutError);
      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch, timeoutMs: 5000 });

      try {
        await gateway.resolve('BW6D7ABCFB');
        expect.unreachable('Should have thrown AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('UPSTREAM_BETWAY_ERROR');
        expect((err as AppError).statusCode).toBe(502);
        expect((err as AppError).message).toContain('timed out');
      }
    });
  });

  describe('create', () => {
    it('sends correct POST request to primary endpoint and returns booking code', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createFixture,
      } as Response);

      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });
      const result = await gateway.create(sampleOutcomes);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${DEFAULT_PRIMARY_BASE_URL}/v1/Betting/BookABet`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            cultureCode: 'en-US',
            countryCode: 'NG',
            isSingleBet: false,
            outcomes: sampleOutcomes,
          }),
        })
      );

      expect(result).toEqual({ bookingCode: 'BW6D7AC4BA' });
    });

    it('validates outcomes array and throws AppError 400 before network request', async () => {
      const mockFetch = vi.fn();
      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });

      await expect(gateway.create([])).rejects.toThrowError(AppError);
      expect(mockFetch).not.toHaveBeenCalled();

      try {
        await gateway.create([]);
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('INVALID_INPUT');
        expect((err as AppError).statusCode).toBe(400);
      }
    });

    it('throws AppError 502 if response body lacks bookingCode', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ invalidField: 123 }),
      } as Response);

      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });

      await expect(gateway.create(sampleOutcomes)).rejects.toThrowError(AppError);
    });

    it('retries on fallback endpoint when primary create call throws network error', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network connection failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => createFixture,
        } as Response);

      const gateway = new BetwayHttpGateway({ fetchFn: mockFetch });
      const result = await gateway.create(sampleOutcomes);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.bookingCode).toBe('BW6D7AC4BA');
    });
  });
});
