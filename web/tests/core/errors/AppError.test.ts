import { describe, it, expect } from 'vitest';
import { AppError } from '@/core/errors';

describe('AppError Taxonomy', () => {
  it('should create INVALID_INPUT error with 400 status', () => {
    const error = AppError.invalidInput('Booking code format is invalid', { code: '123' });
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Booking code format is invalid');
    expect(error.details).toEqual({ code: '123' });
  });

  it('should create BOOKING_CODE_NOT_FOUND error with 404 status', () => {
    const error = AppError.notFound();
    expect(error.code).toBe('BOOKING_CODE_NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('The provided Betway booking code could not be found or has expired.');
    expect(error.details).toBeNull();
  });

  it('should create STALE_SELECTIONS error with 422 status', () => {
    const error = AppError.staleSelections('Match already started');
    expect(error.code).toBe('STALE_SELECTIONS');
    expect(error.statusCode).toBe(422);
    expect(error.message).toBe('Match already started');
  });

  it('should create UPSTREAM_BETWAY_ERROR error with 502 status', () => {
    const error = AppError.upstreamError('Betway gateway timed out');
    expect(error.code).toBe('UPSTREAM_BETWAY_ERROR');
    expect(error.statusCode).toBe(502);
    expect(error.message).toBe('Betway gateway timed out');
  });

  it('should create INTERNAL_SERVER_ERROR error with 500 status', () => {
    const error = AppError.internal();
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('An unexpected internal server error occurred.');
  });

  it('should serialize correctly to response envelope via toResponse()', () => {
    const error = AppError.notFound('Code not found', { bookingCode: 'INVALID' });
    const response = error.toResponse();

    expect(response).toEqual({
      success: false,
      error: {
        code: 'BOOKING_CODE_NOT_FOUND',
        message: 'Code not found',
        details: { bookingCode: 'INVALID' },
      },
    });
  });

  it('should wrap native errors using AppError.from()', () => {
    const nativeErr = new Error('Unexpected database failure');
    const wrapped = AppError.from(nativeErr);

    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.code).toBe('INTERNAL_SERVER_ERROR');
    expect(wrapped.statusCode).toBe(500);
    expect(wrapped.message).toBe('Unexpected database failure');
  });

  it('should return existing AppError instance untouched when passed to AppError.from()', () => {
    const existing = AppError.invalidInput('Bad format');
    const result = AppError.from(existing);

    expect(result).toBe(existing);
  });
});
