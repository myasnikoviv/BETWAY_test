import { AppError } from '../errors/AppError';
import type {
  BetwayBookABetRequest,
  BetwayFindBookABetRequest,
  BetwayOutcomePayload,
  BetwayRawBookResponse,
  BetwayRawFindResponse,
} from './BetwayTypes';
import type { IBetwayGateway } from './IBetwayGateway';

export const DEFAULT_PRIMARY_BASE_URL =
  (typeof process !== 'undefined' && process.env?.BETWAY_BASE_URL) ||
  'https://www.betway.com.ng/appsynapse/bet-api-sr02';
export const DEFAULT_FALLBACK_BASE_URL =
  (typeof process !== 'undefined' && process.env?.BETWAY_FALLBACK_BASE_URL) ||
  'https://www.betway.com.ng/appsynapse/bet-api-sr';
export const DEFAULT_TIMEOUT_MS =
  typeof process !== 'undefined' && process.env?.BETWAY_TIMEOUT_MS
    ? parseInt(process.env.BETWAY_TIMEOUT_MS, 10)
    : 8000;

export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
};

export interface BetwayHttpGatewayOptions {
  primaryBaseUrl?: string;
  fallbackBaseUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

/**
 * Production implementation of IBetwayGateway communicating with Betway Nigeria public HTTP endpoints.
 * Centralizes endpoint URLs, fallback retry routing, timeouts, and error mapping (INV-01, INV-06).
 */
export class BetwayHttpGateway implements IBetwayGateway {
  private readonly primaryBaseUrl: string;
  private readonly fallbackBaseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: BetwayHttpGatewayOptions = {}) {
    this.primaryBaseUrl = (options.primaryBaseUrl ?? DEFAULT_PRIMARY_BASE_URL).replace(/\/+$/, '');
    this.fallbackBaseUrl = (options.fallbackBaseUrl ?? DEFAULT_FALLBACK_BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
  }

  /**
   * Resolves a Betway booking code into raw Betway FindBookABet response data.
   *
   * @param bookingCode - Alphanumeric booking code
   * @returns Raw Betway FindBookABet response payload
   */
  public async resolve(bookingCode: string): Promise<BetwayRawFindResponse> {
    if (!bookingCode || typeof bookingCode !== 'string' || bookingCode.trim() === '') {
      throw AppError.invalidInput('Booking code is required.');
    }

    const payload: BetwayFindBookABetRequest = {
      countryCode: 'NG',
      bookingCode: bookingCode.trim(),
      cultureCode: 'en-US',
    };

    const response = await this.postWithFailover<BetwayRawFindResponse>(
      '/v2/Betting/FindBookABet',
      payload
    );

    if (response && response.errorCode === 13) {
      throw AppError.notFound('The provided Betway booking code could not be found or has expired.', {
        errorCode: 13,
      });
    }

    return response;
  }

  /**
   * Creates a new booking code on Betway from an array of outcome selections.
   *
   * @param outcomes - Array of outcome selection payloads
   * @param isSingleBet - Whether the bet is a single or accumulator
   * @returns Raw Betway BookABet response containing the generated booking code
   */
  public async create(
    outcomes: BetwayOutcomePayload[],
    isSingleBet = false
  ): Promise<BetwayRawBookResponse> {
    if (!outcomes || !Array.isArray(outcomes) || outcomes.length === 0) {
      throw AppError.invalidInput('At least one outcome selection is required.');
    }

    const payload: BetwayBookABetRequest = {
      cultureCode: 'en-US',
      countryCode: 'NG',
      isSingleBet,
      outcomes,
    };

    const response = await this.postWithFailover<BetwayRawBookResponse>(
      '/v1/Betting/BookABet',
      payload
    );

    if (!response || !response.bookingCode) {
      throw AppError.upstreamError(
        'Betway returned an invalid response without a booking code.',
        response
      );
    }

    return response;
  }

  /**
   * Performs an HTTP POST request against the primary Betway base URL,
   * automatically retrying once against the fallback URL on network failure or 5xx server errors.
   */
  private async postWithFailover<T>(path: string, payload: unknown): Promise<T> {
    const primaryUrl = `${this.primaryBaseUrl}${path}`;
    const fallbackUrl = `${this.fallbackBaseUrl}${path}`;

    try {
      return await this.executePost<T>(primaryUrl, payload);
    } catch (primaryError) {
      // If error is a client error (e.g. 400 or 404), do not retry on fallback as it will produce identical client error
      if (primaryError instanceof AppError && (primaryError.statusCode === 400 || primaryError.statusCode === 404)) {
        throw primaryError;
      }

      // Retry on fallback endpoint
      try {
        return await this.executePost<T>(fallbackUrl, payload);
      } catch (fallbackError) {
        if (fallbackError instanceof AppError) {
          throw fallbackError;
        }

        throw this.translateError(fallbackError);
      }
    }
  }

  /**
   * Executes a single POST request with timeout and status code translation.
   */
  private async executePost<T>(url: string, payload: unknown): Promise<T> {
    let response: Response;

    try {
      const signal = AbortSignal.timeout(this.timeoutMs);
      response = await this.fetchFn(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload),
        signal,
      });
    } catch (fetchError: unknown) {
      throw this.translateError(fetchError);
    }

    if (response.status === 404) {
      throw AppError.notFound('The provided Betway booking code could not be found or has expired.');
    }

    if (response.status === 400) {
      throw AppError.invalidInput('Betway rejected the request payload as invalid.');
    }

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text().catch(() => null);
      }

      throw AppError.upstreamError(
        `Betway upstream server returned HTTP status ${response.status}.`,
        { status: response.status, body: errorBody }
      );
    }

    try {
      return (await response.json()) as T;
    } catch (parseError) {
      throw AppError.upstreamError('Failed to parse JSON response from Betway.', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
    }
  }

  /**
   * Translates unknown fetch and network exceptions into structured AppErrors.
   */
  private translateError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      const isTimeout =
        error.name === 'TimeoutError' ||
        error.name === 'AbortError' ||
        error.message.toLowerCase().includes('timeout') ||
        error.message.toLowerCase().includes('aborted');

      if (isTimeout) {
        return AppError.upstreamError(`Betway request timed out after ${this.timeoutMs}ms.`, {
          timeoutMs: this.timeoutMs,
          originalError: error.message,
        });
      }

      return AppError.upstreamError(`Failed to communicate with Betway: ${error.message}`, {
        originalError: error.message,
      });
    }

    return AppError.upstreamError('Unknown error communicating with Betway upstream service.', {
      error: String(error),
    });
  }
}
