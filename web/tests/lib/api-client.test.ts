import { describe, it, expect, vi } from 'vitest';
import {
  resolveBookingCode,
  convertBookingCode,
  ApiClientError,
  apiClient,
} from '@/lib/api-client';
import type { BetSlip } from '@/core/domain/BetSlip';
import type { ConvertResult } from '@/core/domain/ConvertResult';

describe('api-client', () => {
  const sampleSlip: BetSlip = {
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
        region: 'England',
      },
    ],
  };

  const sampleConvertResult: ConvertResult = {
    sourceBookingCode: 'BW6D7ABCFB',
    newBookingCode: 'BW6D7AC4BA',
    convertedAt: '2026-08-31T15:40:05.000Z',
    slip: {
      ...sampleSlip,
      bookingCode: 'BW6D7AC4BA',
    },
  };

  describe('resolveBookingCode', () => {
    it('resolves a valid booking code successfully via POST /api/v1/resolve', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: sampleSlip,
        }),
      });

      const result = await resolveBookingCode('bw6d7abcfb', {
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(result).toEqual(sampleSlip);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/resolve',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ bookingCode: 'BW6D7ABCFB' }),
        })
      );
    });

    it('uses custom baseUrl when provided', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: sampleSlip,
        }),
      });

      await resolveBookingCode('BW6D7ABCFB', {
        baseUrl: 'http://localhost:3000',
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/resolve',
        expect.anything()
      );
    });

    it('throws ApiClientError with INVALID_INPUT if booking code is empty or whitespace', async () => {
      const mockFetch = vi.fn();

      await expect(
        resolveBookingCode('   ', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toThrowError(ApiClientError);

      await expect(
        resolveBookingCode('', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'INVALID_INPUT',
        statusCode: 400,
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles 404 BOOKING_CODE_NOT_FOUND error from API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: {
            code: 'BOOKING_CODE_NOT_FOUND',
            message: 'The provided Betway booking code could not be found or has expired.',
            details: null,
          },
        }),
      });

      await expect(
        resolveBookingCode('BW00000000', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'BOOKING_CODE_NOT_FOUND',
        statusCode: 404,
        message: 'The provided Betway booking code could not be found or has expired.',
      });
    });

    it('handles 502 UPSTREAM_BETWAY_ERROR from API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({
          success: false,
          error: {
            code: 'UPSTREAM_BETWAY_ERROR',
            message: 'Betway service is currently unreachable.',
            details: null,
          },
        }),
      });

      await expect(
        resolveBookingCode('BW6D7ABCFB', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'UPSTREAM_BETWAY_ERROR',
        statusCode: 502,
        message: 'Betway service is currently unreachable.',
      });
    });

    it('handles non-JSON error response from server', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Unexpected token < in JSON at position 0');
        },
      });

      await expect(
        resolveBookingCode('BW6D7ABCFB', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
        statusCode: 500,
      });
    });

    it('handles network failure', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

      await expect(
        resolveBookingCode('BW6D7ABCFB', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        statusCode: 0,
        message: 'Failed to communicate with server: Failed to fetch',
      });
    });

    it('exposes apiClient.resolve helper object', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: sampleSlip,
        }),
      });

      const result = await apiClient.resolve('BW6D7ABCFB', {
        fetchFn: mockFetch as unknown as typeof fetch,
      });
      expect(result).toEqual(sampleSlip);
    });
  });

  describe('convertBookingCode', () => {
    it('converts a booking code successfully via POST /api/v1/convert', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: sampleConvertResult,
        }),
      });

      const result = await convertBookingCode('bw6d7abcfb', {
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(result).toEqual(sampleConvertResult);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/convert',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ bookingCode: 'BW6D7ABCFB' }),
        })
      );
    });

    it('uses custom baseUrl for convert when provided', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: sampleConvertResult,
        }),
      });

      await convertBookingCode('BW6D7ABCFB', {
        baseUrl: 'http://localhost:3000',
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/convert',
        expect.anything()
      );
    });

    it('throws ApiClientError with INVALID_INPUT if booking code is empty or whitespace', async () => {
      const mockFetch = vi.fn();

      await expect(
        convertBookingCode('   ', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toThrowError(ApiClientError);

      await expect(
        convertBookingCode('', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'INVALID_INPUT',
        statusCode: 400,
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles 404 BOOKING_CODE_NOT_FOUND error from convert API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: {
            code: 'BOOKING_CODE_NOT_FOUND',
            message: 'Source booking code not found.',
            details: null,
          },
        }),
      });

      await expect(
        convertBookingCode('BW00000000', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'BOOKING_CODE_NOT_FOUND',
        statusCode: 404,
        message: 'Source booking code not found.',
      });
    });

    it('handles 422 STALE_SELECTIONS error from convert API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          success: false,
          error: {
            code: 'STALE_SELECTIONS',
            message: 'All selections in the booking code are concluded or inactive.',
            details: null,
          },
        }),
      });

      await expect(
        convertBookingCode('BWSTALE123', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'STALE_SELECTIONS',
        statusCode: 422,
        message: 'All selections in the booking code are concluded or inactive.',
      });
    });

    it('handles 502 UPSTREAM_BETWAY_ERROR from convert API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({
          success: false,
          error: {
            code: 'UPSTREAM_BETWAY_ERROR',
            message: 'Betway upstream server error during booking.',
            details: null,
          },
        }),
      });

      await expect(
        convertBookingCode('BW6D7ABCFB', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'UPSTREAM_BETWAY_ERROR',
        statusCode: 502,
        message: 'Betway upstream server error during booking.',
      });
    });

    it('handles non-JSON error response from convert API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Non-JSON HTML output');
        },
      });

      await expect(
        convertBookingCode('BW6D7ABCFB', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
        statusCode: 500,
      });
    });

    it('handles network failure during convert', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Connection reset'));

      await expect(
        convertBookingCode('BW6D7ABCFB', { fetchFn: mockFetch as unknown as typeof fetch })
      ).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        statusCode: 0,
        message: 'Failed to communicate with server: Connection reset',
      });
    });

    it('exposes apiClient.convert helper object', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: sampleConvertResult,
        }),
      });

      const result = await apiClient.convert('BW6D7ABCFB', {
        fetchFn: mockFetch as unknown as typeof fetch,
      });
      expect(result).toEqual(sampleConvertResult);
    });
  });
});

