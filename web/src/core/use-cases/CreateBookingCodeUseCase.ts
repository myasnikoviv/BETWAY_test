import type { BetSelection } from '../domain/BetSelection';
import { AppError } from '../errors/AppError';
import type { IBetwayGateway } from '../gateway/IBetwayGateway';
import { mapSelectionsToBetwayOutcomes } from '../gateway/normalization';

/**
 * Request payload for creating a booking code from canonical selections.
 */
export interface CreateBookingCodeRequest {
  selections: BetSelection[];
  isSingleBet?: boolean;
}

/**
 * Input type accepted by CreateBookingCodeUseCase (either request object or array of BetSelection).
 */
export type CreateBookingCodeInput = CreateBookingCodeRequest | BetSelection[];

/**
 * Application Use Case: Ingests canonical bet selections, maps them to Betway outcomes,
 * calls IBetwayGateway.create(), and returns the generated Betway booking code.
 */
export class CreateBookingCodeUseCase {
  constructor(private readonly gateway: IBetwayGateway) {}

  /**
   * Executes the create booking code use case.
   *
   * @param input - Array of canonical BetSelection items or request object containing selections
   * @returns Generated booking code string (e.g. "BW6D7AC4BA")
   * @throws {AppError} 400 INVALID_INPUT if selections array is empty or selectionId is missing
   * @throws {AppError} 502 UPSTREAM_BETWAY_ERROR if Betway creation fails or returns an invalid code
   */
  public async execute(input: CreateBookingCodeInput): Promise<string> {
    let selections: BetSelection[];
    let isSingleBet: boolean | undefined;

    if (Array.isArray(input)) {
      selections = input;
      isSingleBet = selections.length === 1;
    } else if (input && typeof input === 'object' && Array.isArray(input.selections)) {
      selections = input.selections;
      isSingleBet = input.isSingleBet ?? (selections.length === 1);
    } else {
      throw AppError.invalidInput('Selections must be a non-empty array of bet selections.');
    }

    if (selections.length === 0) {
      throw AppError.invalidInput('At least one selection is required to create a booking code.');
    }

    for (const sel of selections) {
      if (!sel || !sel.selectionId || typeof sel.selectionId !== 'string' || sel.selectionId.trim() === '') {
        throw AppError.invalidInput('Each selection must contain a valid selectionId (outcomeId).');
      }
    }

    const outcomes = mapSelectionsToBetwayOutcomes(selections);
    const result = await this.gateway.create(outcomes, isSingleBet);

    if (
      !result ||
      !result.bookingCode ||
      typeof result.bookingCode !== 'string' ||
      result.bookingCode.trim() === ''
    ) {
      throw AppError.upstreamError('Betway did not return a valid booking code.');
    }

    return result.bookingCode.trim();
  }
}
