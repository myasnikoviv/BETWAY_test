import type { BetSlip } from './BetSlip';

/**
 * Canonical domain model representing the result of a booking code conversion.
 */
export interface ConvertResult {
  /** Original booking code ingested */
  sourceBookingCode: string;
  /** Newly generated booking code */
  newBookingCode: string;
  /** Canonical bet slip details for the converted bet */
  slip: BetSlip;
  /** ISO timestamp when conversion was completed */
  convertedAt: string;
}

/**
 * Parameters for creating a ConvertResult instance.
 */
export interface CreateConvertResultParams {
  sourceBookingCode: string;
  newBookingCode: string;
  slip: BetSlip;
  convertedAt?: string;
}

/**
 * Factory function to construct a ConvertResult object.
 *
 * @param params - Conversion result parameters
 * @returns Canonical ConvertResult object
 */
export function createConvertResult(params: CreateConvertResultParams): ConvertResult {
  return {
    sourceBookingCode: params.sourceBookingCode,
    newBookingCode: params.newBookingCode,
    slip: params.slip,
    convertedAt: params.convertedAt ?? new Date().toISOString(),
  };
}
