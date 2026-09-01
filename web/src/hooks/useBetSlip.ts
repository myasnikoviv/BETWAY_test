import { useState, useCallback, useRef } from 'react';
import type { BetSlip } from '../core/domain/BetSlip';
import { resolveBookingCode, ApiClientError } from '../lib/api-client';
import { BOOKING_CODE_REGEX } from '../lib/validation/schemas';

export type BetSlipStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseBetSlipOptions {
  /** Optional custom resolve function (useful for mocking/testing) */
  resolveFn?: (code: string) => Promise<BetSlip>;
  /** Optional initial booking code */
  initialCode?: string;
}

export interface UseBetSlipReturn {
  /** Current lifecycle status */
  status: BetSlipStatus;
  /** Resolved canonical BetSlip domain model or null */
  slip: BetSlip | null;
  /** Error message or null */
  error: string | null;
  /** Currently active booking code */
  bookingCode: string;
  /** Trigger resolution for a booking code */
  resolveCode: (code: string) => Promise<void>;
  /** Update the booking code string */
  setBookingCode: (code: string) => void;
  /** Reset state back to idle */
  reset: () => void;
  /** Convenience flag: status === 'loading' */
  isLoading: boolean;
}

/**
 * Custom React hook for managing Betway booking code resolution and UI lifecycle states.
 */
export function useBetSlip(options: UseBetSlipOptions = {}): UseBetSlipReturn {
  const { resolveFn = resolveBookingCode, initialCode = '' } = options;

  const [status, setStatus] = useState<BetSlipStatus>('idle');
  const [slip, setSlip] = useState<BetSlip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState<string>(initialCode);

  const activeRequestRef = useRef<number>(0);

  const resolveCode = useCallback(
    async (rawCode: string): Promise<void> => {
      const cleanCode = rawCode.trim().toUpperCase();
      setBookingCode(cleanCode);

      if (!cleanCode) {
        setStatus('error');
        setSlip(null);
        setError('Please enter a Betway booking code.');
        return;
      }

      if (!BOOKING_CODE_REGEX.test(cleanCode)) {
        setStatus('error');
        setSlip(null);
        setError('Booking code must be between 4 and 15 alphanumeric characters (e.g. BW6D7ABCFB).');
        return;
      }

      const requestId = ++activeRequestRef.current;
      setStatus('loading');
      setError(null);

      try {
        const resolvedSlip = await resolveFn(cleanCode);

        // Discard stale responses if a newer request was dispatched
        if (requestId === activeRequestRef.current) {
          setSlip(resolvedSlip);
          setStatus('success');
          setError(null);
        }
      } catch (err: unknown) {
        if (requestId === activeRequestRef.current) {
          setSlip(null);
          setStatus('error');
          if (err instanceof ApiClientError) {
            setError(err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to resolve booking code. Please try again.');
          }
        }
      }
    },
    [resolveFn]
  );

  const reset = useCallback(() => {
    activeRequestRef.current++;
    setStatus('idle');
    setSlip(null);
    setError(null);
    setBookingCode('');
  }, []);

  return {
    status,
    slip,
    error,
    bookingCode,
    resolveCode,
    setBookingCode,
    reset,
    isLoading: status === 'loading',
  };
}
