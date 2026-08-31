import { calculateTotalOdds, createBetSlip, type BetSlip } from '../domain/BetSlip';
import { AppError } from '../errors/AppError';
import type { IBetwayGateway } from '../gateway/IBetwayGateway';
import { normalizeBetwayFindResponse } from '../gateway/normalization';

/**
 * Request payload for resolving a booking code.
 */
export interface ResolveBookingCodeRequest {
  bookingCode: string;
}

/**
 * Input type accepted by ResolveBookingCodeUseCase (either string code or request object).
 */
export type ResolveBookingCodeInput = ResolveBookingCodeRequest | string;

/**
 * Regular expression validating Betway Nigeria booking code syntax (4–15 alphanumeric characters).
 */
const BOOKING_CODE_REGEX = /^[A-Za-z0-9]{4,15}$/;

/**
 * Application Use Case: Ingests a Betway Nigeria booking code, resolves match events,
 * markets, selections, and odds via IBetwayGateway, and returns a canonical BetSlip.
 */
export class ResolveBookingCodeUseCase {
  constructor(private readonly gateway: IBetwayGateway) {}

  /**
   * Executes the resolve use case.
   *
   * @param input - Booking code string or request object containing bookingCode
   * @returns Canonical BetSlip domain object
   * @throws {AppError} 400 INVALID_INPUT if booking code syntax is invalid
   * @throws {AppError} 404 BOOKING_CODE_NOT_FOUND if booking code does not exist or has expired
   * @throws {AppError} 502 UPSTREAM_BETWAY_ERROR if upstream Betway communication fails
   */
  public async execute(input: ResolveBookingCodeInput): Promise<BetSlip> {
    const rawCode = typeof input === 'string' ? input : input?.bookingCode;

    if (!rawCode || typeof rawCode !== 'string' || rawCode.trim() === '') {
      throw AppError.invalidInput('Booking code is required.');
    }

    const trimmedCode = rawCode.trim();

    if (!BOOKING_CODE_REGEX.test(trimmedCode)) {
      throw AppError.invalidInput(
        'Booking code must be between 4 and 15 alphanumeric characters.'
      );
    }

    const rawResponse = await this.gateway.resolve(trimmedCode);
    const selections = normalizeBetwayFindResponse(rawResponse);
    const isSingleBet = rawResponse.isSingleBet ?? (selections.length === 1);
    const totalOdds = calculateTotalOdds(selections);

    return createBetSlip({
      bookingCode: trimmedCode,
      selections,
      totalOdds,
      isSingleBet,
    });
  }
}
