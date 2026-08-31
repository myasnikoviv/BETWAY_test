import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from '@/core/errors/AppError';
import {
  apiErrorResponse,
  apiSuccessResponse,
  CORS_HEADERS,
  handleOptions,
} from '@/lib/api-response';

describe('API Response Helpers', () => {
  describe('CORS_HEADERS', () => {
    it('contains standard permissive CORS headers for mobile and cross-origin access', () => {
      expect(CORS_HEADERS['Access-Control-Allow-Origin']).toBe('*');
      expect(CORS_HEADERS['Access-Control-Allow-Methods']).toContain('GET');
      expect(CORS_HEADERS['Access-Control-Allow-Methods']).toContain('POST');
      expect(CORS_HEADERS['Access-Control-Allow-Methods']).toContain('OPTIONS');
      expect(CORS_HEADERS['Access-Control-Allow-Headers']).toContain('Content-Type');
    });
  });

  describe('apiSuccessResponse', () => {
    it('creates a standard success JSON response with 200 status and CORS headers', async () => {
      const data = { message: 'hello world', count: 42 };
      const response = apiSuccessResponse(data);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

      const json = await response.json();
      expect(json).toEqual({
        success: true,
        data: { message: 'hello world', count: 42 },
      });
    });

    it('allows custom status code and custom headers', async () => {
      const response = apiSuccessResponse(
        { created: true },
        201,
        { 'X-Custom-Header': 'custom-val' }
      );

      expect(response.status).toBe(201);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('X-Custom-Header')).toBe('custom-val');

      const json = await response.json();
      expect(json).toEqual({
        success: true,
        data: { created: true },
      });
    });
  });

  describe('apiErrorResponse', () => {
    it('formats AppError correctly with its status code and code taxonomy', async () => {
      const error = AppError.notFound('Booking code not found', { bookingCode: 'XYZ' });
      const response = apiErrorResponse(error);

      expect(response.status).toBe(404);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: {
          code: 'BOOKING_CODE_NOT_FOUND',
          message: 'Booking code not found',
          details: { bookingCode: 'XYZ' },
        },
      });
    });

    it('formats ZodError as 400 INVALID_INPUT with validation details', async () => {
      const schema = z.object({ code: z.string().min(4, 'Code too short') });
      const parseResult = schema.safeParse({ code: 'abc' });

      expect(parseResult.success).toBe(false);
      if (!parseResult.success) {
        const response = apiErrorResponse(parseResult.error);

        expect(response.status).toBe(400);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

        const json = await response.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('INVALID_INPUT');
        expect(json.error.message).toContain('Code too short');
        expect(Array.isArray(json.error.details)).toBe(true);
      }
    });

    it('formats JSON SyntaxError as 400 INVALID_INPUT', async () => {
      const error = new SyntaxError('Unexpected token in JSON at position 0');
      const response = apiErrorResponse(error);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INVALID_INPUT');
      expect(json.error.message).toBe('Malformed JSON in request body.');
    });

    it('formats generic Error as 500 INTERNAL_SERVER_ERROR', async () => {
      const error = new Error('Database connection failed');
      const response = apiErrorResponse(error);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(json.error.message).toBe('Database connection failed');
    });

    it('formats unknown non-Error values as 500 INTERNAL_SERVER_ERROR', async () => {
      const response = apiErrorResponse('unhandled string exception');

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('respects statusOverride when provided', async () => {
      const error = new Error('Unauthorized access');
      const response = apiErrorResponse(error, 401);

      expect(response.status).toBe(401);
    });
  });

  describe('handleOptions', () => {
    it('returns 204 No Content with CORS headers for preflight requests', () => {
      const response = handleOptions();

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });
  });
});
