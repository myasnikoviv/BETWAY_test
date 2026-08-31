import { createBetSlip } from '../domain/BetSlip';
import { createConvertResult, type ConvertResult } from '../domain/ConvertResult';
import { AppError } from '../errors/AppError';
import type { IBetwayGateway } from '../gateway/IBetwayGateway';
import { CreateBookingCodeUseCase } from './CreateBookingCodeUseCase';
import { ResolveBookingCodeUseCase } from './ResolveBookingCodeUseCase';

/**
 * Request payload for converting an existing booking code into a new booking code.
 */
export interface ConvertBookingCodeRequest {
  bookingCode?: string;
  sourceBookingCode?: string;
}

/**
 * Input type accepted by ConvertBookingCodeUseCase (either string code or request object).
 */
export type ConvertBookingCodeInput = ConvertBookingCodeRequest | string;

/**
 * Application Use Case: Stateless composition orchestrating Resolve -> Selection Validation -> Create (INV-05).
 * Ingests an existing booking code, resolves and validates its active legs, creates a new booking code,
 * and returns a canonical ConvertResult.
 */
export class ConvertBookingCodeUseCase {
  private readonly resolveUseCase: ResolveBookingCodeUseCase;
  private readonly createUseCase: CreateBookingCodeUseCase;

  constructor(gateway: IBetwayGateway);
  constructor(resolveUseCase: ResolveBookingCodeUseCase, createUseCase: CreateBookingCodeUseCase);
  constructor(
    gatewayOrResolve: IBetwayGateway | ResolveBookingCodeUseCase,
    createUseCase?: CreateBookingCodeUseCase
  ) {
    if (createUseCase && gatewayOrResolve instanceof ResolveBookingCodeUseCase) {
      this.resolveUseCase = gatewayOrResolve;
      this.createUseCase = createUseCase;
    } else {
      const gateway = gatewayOrResolve as IBetwayGateway;
      this.resolveUseCase = new ResolveBookingCodeUseCase(gateway);
      this.createUseCase = new CreateBookingCodeUseCase(gateway);
    }
  }

  /**
   * Executes the stateless conversion workflow.
   *
   * @param input - Source booking code string or request object
   * @returns Canonical ConvertResult containing original code, new code, and slip details
   * @throws {AppError} 400 INVALID_INPUT if source code is empty or malformed
   * @throws {AppError} 404 BOOKING_CODE_NOT_FOUND if source code does not exist on Betway
   * @throws {AppError} 422 STALE_SELECTIONS if any leg in the source slip is no longer active
   * @throws {AppError} 502 UPSTREAM_BETWAY_ERROR if Betway communication fails
   */
  public async execute(input: ConvertBookingCodeInput): Promise<ConvertResult> {
    const rawCode =
      typeof input === 'string'
        ? input
        : input?.sourceBookingCode || input?.bookingCode;

    if (!rawCode || typeof rawCode !== 'string' || rawCode.trim() === '') {
      throw AppError.invalidInput('A valid source booking code is required for conversion.');
    }

    const trimmedSourceCode = rawCode.trim();

    // Step 1: Resolve source slip (validates code syntax & fetches from gateway)
    const resolvedSlip = await this.resolveUseCase.execute(trimmedSourceCode);

    // Step 2: Validate that selections are present and active
    if (!resolvedSlip.selections || resolvedSlip.selections.length === 0) {
      throw AppError.staleSelections('Bet slip contains no selections.');
    }

    const hasInactiveLeg = resolvedSlip.selections.some((sel) => sel.isMarketActive === false);
    if (hasInactiveLeg) {
      throw AppError.staleSelections(
        'One or more selections in the booking code are no longer active or available.'
      );
    }

    // Step 3: Create new booking code from resolved selections
    const newBookingCode = await this.createUseCase.execute({
      selections: resolvedSlip.selections,
      isSingleBet: resolvedSlip.isSingleBet,
    });

    // Step 4: Construct and return canonical ConvertResult
    const convertedAt = new Date().toISOString();
    const newSlip = createBetSlip({
      bookingCode: newBookingCode,
      selections: resolvedSlip.selections,
      totalOdds: resolvedSlip.totalOdds,
      isSingleBet: resolvedSlip.isSingleBet,
      createdAt: convertedAt,
    });

    return createConvertResult({
      sourceBookingCode: trimmedSourceCode,
      newBookingCode,
      slip: newSlip,
      convertedAt,
    });
  }
}
