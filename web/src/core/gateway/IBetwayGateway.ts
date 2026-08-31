import type {
  BetwayOutcomePayload,
  BetwayRawBookResponse,
  BetwayRawFindResponse,
} from './BetwayTypes';

/**
 * Abstraction interface for communicating with external Betway Nigeria services.
 * Mediates all outbound calls to satisfy INV-01, INV-02, and INV-06.
 */
export interface IBetwayGateway {
  /**
   * Resolves an existing Betway booking code into raw Betway FindBookABet response data.
   *
   * @param bookingCode - Betway alphanumeric booking code (e.g. "BW6D7ABCFB")
   * @returns Raw Betway FindBookABet response payload
   * @throws {AppError} If code is invalid, not found, or upstream communication fails
   */
  resolve(bookingCode: string): Promise<BetwayRawFindResponse>;

  /**
   * Creates a new booking code on Betway from an array of outcome selections.
   *
   * @param outcomes - Structured Betway outcome selections
   * @param isSingleBet - Optional single bet flag (default: false)
   * @returns Raw Betway BookABet response containing the generated booking code
   * @throws {AppError} If creation fails or upstream is unreachable
   */
  create(outcomes: BetwayOutcomePayload[], isSingleBet?: boolean): Promise<BetwayRawBookResponse>;
}
