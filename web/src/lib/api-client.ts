import type { BetSlip } from '../core/domain/BetSlip';
import type { ApiResponseEnvelope } from './api-response';

/**
 * Custom error class representing errors returned by the backend API or HTTP transport failures.
 */
export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Options for configuring the API client requests.
 */
export interface ResolveOptions {
  /** Base URL for API calls (defaults to relative root '') */
  baseUrl?: string;
  /** Optional AbortSignal to cancel pending requests */
  signal?: AbortSignal;
  /** Optional custom fetch implementation (useful for tests) */
  fetchFn?: typeof fetch;
}

/**
 * Resolves a Betway booking code into a canonical BetSlip model via POST /api/v1/resolve.
 *
 * @param bookingCode - Betway booking code string (e.g. "BW6D7ABCFB")
 * @param options - Optional request parameters (baseUrl, signal, fetchFn)
 * @returns Promise resolving to canonical BetSlip domain model
 * @throws ApiClientError if the API returns an error or if network/parsing fails
 */
export async function resolveBookingCode(
  bookingCode: string,
  options: ResolveOptions = {}
): Promise<BetSlip> {
  const { baseUrl = '', signal, fetchFn = fetch } = options;
  const cleanCode = bookingCode.trim().toUpperCase();

  if (!cleanCode) {
    throw new ApiClientError(
      'Booking code cannot be empty.',
      'INVALID_INPUT',
      400
    );
  }

  const endpoint = `${baseUrl}/api/v1/resolve`;

  let response: Response;
  try {
    response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ bookingCode: cleanCode }),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    const message =
      err instanceof Error ? err.message : 'Network request failed';
    throw new ApiClientError(
      `Failed to communicate with server: ${message}`,
      'NETWORK_ERROR',
      0
    );
  }

  let payload: ApiResponseEnvelope<BetSlip> | unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiClientError(
      `Invalid JSON response from server (HTTP ${response.status})`,
      'INVALID_RESPONSE',
      response.status
    );
  }

  if (
    response.ok &&
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as ApiResponseEnvelope<BetSlip>).success === true
  ) {
    return (payload as { success: true; data: BetSlip }).data;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as ApiResponseEnvelope<BetSlip>).success === false
  ) {
    const errorPayload = payload as {
      success: false;
      error: { code: string; message: string; details?: unknown };
    };
    throw new ApiClientError(
      errorPayload.error?.message || 'Server returned an error',
      errorPayload.error?.code || 'SERVER_ERROR',
      response.status,
      errorPayload.error?.details
    );
  }

  throw new ApiClientError(
    `Unexpected server response (HTTP ${response.status})`,
    'UNEXPECTED_ERROR',
    response.status
  );
}

/**
 * Standard API client helper object.
 */
export const apiClient = {
  resolve: resolveBookingCode,
};
