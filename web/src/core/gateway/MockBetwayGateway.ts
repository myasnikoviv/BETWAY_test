import { AppError } from '../errors/AppError';
import type {
  BetwayOutcomePayload,
  BetwayRawBookResponse,
  BetwayRawFindResponse,
} from './BetwayTypes';
import type { IBetwayGateway } from './IBetwayGateway';

export interface MockBetwayGatewayOptions {
  /** Fixture to return from resolve() */
  resolveFixture?: BetwayRawFindResponse;
  /** Fixture to return from create() */
  createFixture?: BetwayRawBookResponse;
  /** If true, resolve() will throw an upstream AppError */
  shouldFailResolve?: boolean;
  /** If true, create() will throw an upstream AppError */
  shouldFailCreate?: boolean;
  /** Custom error to throw on resolve() */
  resolveError?: Error;
  /** Custom error to throw on create() */
  createError?: Error;
}

/**
 * Mock implementation of IBetwayGateway for deterministic offline testing.
 * Provides fixture replay, call tracking, and simulated failure modes (INV-06).
 */
export class MockBetwayGateway implements IBetwayGateway {
  private resolveFixture?: BetwayRawFindResponse;
  private createFixture?: BetwayRawBookResponse;
  private shouldFailResolve: boolean;
  private shouldFailCreate: boolean;
  private resolveError?: Error;
  private createError?: Error;

  private resolvedCodes: string[] = [];
  private createdOutcomesList: BetwayOutcomePayload[][] = [];
  private lastIsSingleBet?: boolean;

  constructor(options: MockBetwayGatewayOptions = {}) {
    this.resolveFixture = options.resolveFixture;
    this.createFixture = options.createFixture;
    this.shouldFailResolve = options.shouldFailResolve ?? false;
    this.shouldFailCreate = options.shouldFailCreate ?? false;
    this.resolveError = options.resolveError;
    this.createError = options.createError;
  }

  /**
   * Resolves a booking code against static fixtures or throws configured errors.
   */
  public async resolve(bookingCode: string): Promise<BetwayRawFindResponse> {
    if (!bookingCode || typeof bookingCode !== 'string' || bookingCode.trim() === '') {
      throw AppError.invalidInput('Booking code is required.');
    }

    const trimmed = bookingCode.trim();
    this.resolvedCodes.push(trimmed);

    if (this.shouldFailResolve) {
      throw this.resolveError ?? AppError.upstreamError('Mock upstream Betway error on resolve.');
    }

    if (trimmed === 'NOT_FOUND' || trimmed === 'INVALID404' || trimmed === 'EXPIRED') {
      throw AppError.notFound(`Booking code "${trimmed}" could not be found.`);
    }

    if (this.resolveFixture) {
      // Return structured clone to prevent accidental fixture mutation
      return structuredClone(this.resolveFixture);
    }

    // Default synthetic fixture if none was provided
    return {
      selections: [
        {
          eventId: 72221212,
          eventName: 'Mock Team A vs. Mock Team B',
          marketId: '72221212546',
          marketName: 'Match Result 1X2',
          outcomeId: '722212125461718',
          outcomeName: 'Home Win',
          priceDecimal: 2.15,
          sportId: 'soccer',
          league: 'Premier League',
          region: 'England',
          isMarketActive: true,
          isEventActive: true,
          isOutcomeActive: true,
        },
      ],
      isSingleBet: true,
      isBuildABet: false,
    };
  }

  /**
   * Creates a booking code against static fixtures or synthetic code generator.
   */
  public async create(
    outcomes: BetwayOutcomePayload[],
    isSingleBet = false
  ): Promise<BetwayRawBookResponse> {
    if (!outcomes || !Array.isArray(outcomes) || outcomes.length === 0) {
      throw AppError.invalidInput('At least one outcome selection is required.');
    }

    this.createdOutcomesList.push(structuredClone(outcomes));
    this.lastIsSingleBet = isSingleBet;

    if (this.shouldFailCreate) {
      throw this.createError ?? AppError.upstreamError('Mock upstream Betway error on create.');
    }

    if (this.createFixture) {
      return structuredClone(this.createFixture);
    }

    // Generate deterministic or synthetic booking code
    const syntheticCode = `BW${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return {
      bookingCode: syntheticCode,
    };
  }

  // --- Test Inspection & Control Helpers ---

  public setResolveFixture(fixture: BetwayRawFindResponse | undefined): void {
    this.resolveFixture = fixture;
  }

  public setCreateFixture(fixture: BetwayRawBookResponse | undefined): void {
    this.createFixture = fixture;
  }

  public setFailResolve(shouldFail: boolean, error?: Error): void {
    this.shouldFailResolve = shouldFail;
    this.resolveError = error;
  }

  public setFailCreate(shouldFail: boolean, error?: Error): void {
    this.shouldFailCreate = shouldFail;
    this.createError = error;
  }

  public getLastResolvedCode(): string | undefined {
    return this.resolvedCodes[this.resolvedCodes.length - 1];
  }

  public getResolvedCodes(): readonly string[] {
    return [...this.resolvedCodes];
  }

  public getLastCreatedOutcomes(): BetwayOutcomePayload[] | undefined {
    return this.createdOutcomesList[this.createdOutcomesList.length - 1];
  }

  public getCreatedOutcomesHistory(): readonly BetwayOutcomePayload[][] {
    return [...this.createdOutcomesList];
  }

  public getResolveCallCount(): number {
    return this.resolvedCodes.length;
  }

  public getCreateCallCount(): number {
    return this.createdOutcomesList.length;
  }

  public getLastIsSingleBet(): boolean | undefined {
    return this.lastIsSingleBet;
  }

  public reset(): void {
    this.resolvedCodes = [];
    this.createdOutcomesList = [];
    this.lastIsSingleBet = undefined;
    this.shouldFailResolve = false;
    this.shouldFailCreate = false;
    this.resolveError = undefined;
    this.createError = undefined;
  }
}
