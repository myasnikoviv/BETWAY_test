/**
 * Standardized application error codes across the domain and API boundary.
 */
export type AppErrorCode =
  | 'INVALID_INPUT'
  | 'BOOKING_CODE_NOT_FOUND'
  | 'STALE_SELECTIONS'
  | 'UPSTREAM_BETWAY_ERROR'
  | 'INTERNAL_SERVER_ERROR';

/**
 * Standard error response envelope payload.
 */
export interface AppErrorPayload {
  code: AppErrorCode;
  message: string;
  details: unknown | null;
}

/**
 * Standard error response envelope.
 */
export interface AppErrorResponse {
  success: false;
  error: AppErrorPayload;
}

const DEFAULT_STATUS_CODES: Record<AppErrorCode, number> = {
  INVALID_INPUT: 400,
  BOOKING_CODE_NOT_FOUND: 404,
  STALE_SELECTIONS: 422,
  UPSTREAM_BETWAY_ERROR: 502,
  INTERNAL_SERVER_ERROR: 500,
};

const DEFAULT_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_INPUT: 'Invalid input provided.',
  BOOKING_CODE_NOT_FOUND: 'The provided Betway booking code could not be found or has expired.',
  STALE_SELECTIONS: 'One or more selections are no longer active or available.',
  UPSTREAM_BETWAY_ERROR: 'Failed to communicate with Betway upstream service.',
  INTERNAL_SERVER_ERROR: 'An unexpected internal server error occurred.',
};

/**
 * Canonical Application Error class for domain, gateway, and route handler exceptions.
 */
export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;
  public readonly details: unknown | null;

  constructor(
    code: AppErrorCode,
    message?: string,
    details?: unknown,
    statusCode?: number
  ) {
    const finalMessage = message ?? DEFAULT_MESSAGES[code] ?? 'Application error';
    super(finalMessage);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode ?? DEFAULT_STATUS_CODES[code] ?? 500;
    this.details = details !== undefined ? details : null;

    // Maintain prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Converts the error instance into a JSON serializable error payload.
   */
  public toPayload(): AppErrorPayload {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }

  /**
   * Converts the error instance into the standardized API error response envelope.
   */
  public toResponse(): AppErrorResponse {
    return {
      success: false,
      error: this.toPayload(),
    };
  }

  // --- Static Factory Helpers ---

  public static invalidInput(message?: string, details?: unknown): AppError {
    return new AppError('INVALID_INPUT', message, details);
  }

  public static notFound(message?: string, details?: unknown): AppError {
    return new AppError('BOOKING_CODE_NOT_FOUND', message, details);
  }

  public static staleSelections(message?: string, details?: unknown): AppError {
    return new AppError('STALE_SELECTIONS', message, details);
  }

  public static upstreamError(message?: string, details?: unknown): AppError {
    return new AppError('UPSTREAM_BETWAY_ERROR', message, details);
  }

  public static internal(message?: string, details?: unknown): AppError {
    return new AppError('INTERNAL_SERVER_ERROR', message, details);
  }

  /**
   * Translates any caught error into a canonical AppError.
   */
  public static from(err: unknown): AppError {
    if (err instanceof AppError) {
      return err;
    }

    if (err instanceof Error) {
      return new AppError('INTERNAL_SERVER_ERROR', err.message, { stack: err.stack });
    }

    return new AppError('INTERNAL_SERVER_ERROR', String(err));
  }
}
