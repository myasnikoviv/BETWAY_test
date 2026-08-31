import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, type AppErrorCode } from '../core/errors/AppError';

/**
 * Standard CORS headers configured for cross-origin client support (e.g. Flutter mobile app).
 */
export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Standard API success response envelope.
 */
export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

/**
 * Standard API error response envelope.
 */
export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: AppErrorCode;
    message: string;
    details: unknown | null;
  };
}

/**
 * Union type for all API responses.
 */
export type ApiResponseEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

/**
 * Creates a standardized JSON success response with appropriate status code and CORS headers.
 *
 * @param data - The payload to return in the data envelope
 * @param status - HTTP status code (defaults to 200)
 * @param customHeaders - Optional additional response headers
 */
export function apiSuccessResponse<T>(
  data: T,
  status = 200,
  customHeaders?: HeadersInit
): NextResponse<ApiSuccessEnvelope<T>> {
  const headers = new Headers(CORS_HEADERS);
  if (customHeaders) {
    new Headers(customHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return NextResponse.json<ApiSuccessEnvelope<T>>(
    {
      success: true,
      data,
    },
    {
      status,
      headers,
    }
  );
}

/**
 * Creates a standardized JSON error response from an AppError, ZodError, standard Error, or unknown error.
 *
 * @param error - The error to format and map
 * @param statusOverride - Optional status code to override default mapping
 * @param customHeaders - Optional additional response headers
 */
export function apiErrorResponse(
  error: unknown,
  statusOverride?: number,
  customHeaders?: HeadersInit
): NextResponse<ApiErrorEnvelope> {
  let code: AppErrorCode = 'INTERNAL_SERVER_ERROR';
  let statusCode = statusOverride ?? 500;
  let message = 'An unexpected internal server error occurred.';
  let details: unknown | null = null;

  if (error instanceof AppError) {
    code = error.code;
    statusCode = statusOverride ?? error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    code = 'INVALID_INPUT';
    statusCode = statusOverride ?? 400;
    const issueMessages = error.issues.map((i) => i.message).filter(Boolean);
    message =
      issueMessages.length > 0
        ? issueMessages.join('; ')
        : 'Request validation failed.';
    details = error.issues;
  } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
    code = 'INVALID_INPUT';
    statusCode = statusOverride ?? 400;
    message = 'Malformed JSON in request body.';
    details = null;
  } else if (error instanceof Error) {
    code = 'INTERNAL_SERVER_ERROR';
    statusCode = statusOverride ?? 500;
    message = error.message || 'An unexpected internal server error occurred.';
    details = null;
  }

  const headers = new Headers(CORS_HEADERS);
  if (customHeaders) {
    new Headers(customHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return NextResponse.json<ApiErrorEnvelope>(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    {
      status: statusCode,
      headers,
    }
  );
}

/**
 * Preflight CORS handler for OPTIONS requests.
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
