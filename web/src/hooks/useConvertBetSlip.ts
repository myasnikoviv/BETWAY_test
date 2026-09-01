import { useState, useCallback, useRef } from 'react';
import type { ConvertResult } from '../core/domain/ConvertResult';
import { convertBookingCode, ApiClientError } from '../lib/api-client';
import { BOOKING_CODE_REGEX } from '../lib/validation/schemas';

export type ConvertStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseConvertBetSlipOptions {
  /** Optional custom convert function (useful for mocking/testing) */
  convertFn?: (code: string) => Promise<ConvertResult>;
}

export interface UseConvertBetSlipReturn {
  /** Current conversion lifecycle status */
  status: ConvertStatus;
  /** Resulting ConvertResult domain model or null */
  convertResult: ConvertResult | null;
  /** Conversion error message or null */
  convertError: string | null;
  /** Trigger conversion for a booking code */
  convert: (code: string) => Promise<ConvertResult | null>;
  /** Reset conversion state back to idle */
  reset: () => void;
  /** Set or clear conversion error */
  setConvertError: (error: string | null) => void;
  /** Convenience flag: status === 'loading' */
  isConverting: boolean;
}

/**
 * Custom React hook for managing Betway booking code conversion state and request lifecycle.
 * Logically isolated from resolution state so conversion failures never mutate or clear the source slip.
 */
export function useConvertBetSlip(
  options: UseConvertBetSlipOptions = {}
): UseConvertBetSlipReturn {
  const { convertFn = convertBookingCode } = options;

  const [status, setStatus] = useState<ConvertStatus>('idle');
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  const activeRequestRef = useRef<number>(0);

  const convert = useCallback(
    async (rawCode: string): Promise<ConvertResult | null> => {
      const cleanCode = rawCode.trim().toUpperCase();

      if (!cleanCode) {
        setStatus('error');
        setConvertResult(null);
        setConvertError('Please enter a Betway booking code.');
        return null;
      }

      if (!BOOKING_CODE_REGEX.test(cleanCode)) {
        setStatus('error');
        setConvertResult(null);
        setConvertError(
          'Booking code must be between 4 and 15 alphanumeric characters (e.g. BW6D7ABCFB).'
        );
        return null;
      }

      const requestId = ++activeRequestRef.current;
      setStatus('loading');
      setConvertError(null);

      try {
        const result = await convertFn(cleanCode);

        // Discard stale responses if a newer request was dispatched
        if (requestId === activeRequestRef.current) {
          setConvertResult(result);
          setStatus('success');
          setConvertError(null);
          return result;
        }
        return null;
      } catch (err: unknown) {
        if (requestId === activeRequestRef.current) {
          setConvertResult(null);
          setStatus('error');
          if (err instanceof ApiClientError) {
            setConvertError(err.message);
          } else if (err instanceof Error) {
            setConvertError(err.message);
          } else {
            setConvertError('Failed to convert booking code. Please try again.');
          }
        }
        return null;
      }
    },
    [convertFn]
  );

  const reset = useCallback(() => {
    activeRequestRef.current++;
    setStatus('idle');
    setConvertResult(null);
    setConvertError(null);
  }, []);

  return {
    status,
    convertResult,
    convertError,
    convert,
    reset,
    setConvertError,
    isConverting: status === 'loading',
  };
}
