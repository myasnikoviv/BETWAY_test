'use client';

import React, { useState, useEffect, type FormEvent } from 'react';
import { BOOKING_CODE_REGEX } from '../lib/validation/schemas';

export interface BookingCodeInputFormProps {
  /** Callback fired when user submits a booking code */
  onDecode: (bookingCode: string) => void | Promise<void>;
  /** Indicates whether a decode request is currently in flight */
  isLoading?: boolean;
  /** Initial booking code to populate the input */
  initialValue?: string;
  /** External validation error to display */
  externalError?: string | null;
  /** Optional callback to clear external errors when input changes */
  onInputChange?: (value: string) => void;
}

const SAMPLE_CODES = ['BW6D7ABCFB', 'BW6D7AC4BA'];

/**
 * Interactive input form for entering, validating, and submitting Betway Nigeria booking codes.
 */
export function BookingCodeInputForm({
  onDecode,
  isLoading = false,
  initialValue = '',
  externalError = null,
  onInputChange,
}: BookingCodeInputFormProps) {
  const [code, setCode] = useState<string>(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);

  // Synchronize when initialValue changes externally
  useEffect(() => {
    if (initialValue) {
      setCode(initialValue);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(rawVal);
    setLocalError(null);
    onInputChange?.(rawVal);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const sanitized = pastedText.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(sanitized);
    setLocalError(null);
    onInputChange?.(sanitized);
  };

  const handleSampleClick = (sampleCode: string) => {
    setCode(sampleCode);
    setLocalError(null);
    onInputChange?.(sampleCode);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setLocalError('Please enter a Betway booking code.');
      return;
    }

    if (!BOOKING_CODE_REGEX.test(cleanCode)) {
      setLocalError(
        'Booking code must be between 4 and 15 alphanumeric characters (e.g. BW6D7ABCFB).'
      );
      return;
    }

    setLocalError(null);
    onDecode(cleanCode);
  };

  const displayError = localError || externalError;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="booking-code-input"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5"
          >
            Betway Booking Code
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Enter or paste any valid Betway Nigeria booking code (4–15 characters) to inspect its full bet slip.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                id="booking-code-input"
                name="bookingCode"
                type="text"
                value={code}
                onChange={handleChange}
                onPaste={handlePaste}
                disabled={isLoading}
                maxLength={15}
                placeholder="e.g. BW6D7ABCFB"
                aria-invalid={Boolean(displayError)}
                aria-describedby={displayError ? 'booking-code-error' : undefined}
                className={`w-full h-12 px-4 rounded-lg font-mono text-base tracking-wider uppercase border transition-colors outline-none focus:ring-2 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed ${
                  displayError
                    ? 'border-red-400 dark:border-red-500/70 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200 focus:ring-red-500/30'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {code && !isLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setCode('');
                    setLocalError(null);
                    onInputChange?.('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 text-xs font-semibold"
                  aria-label="Clear booking code input"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-6 rounded-lg font-semibold text-sm sm:text-base text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/50 dark:disabled:bg-emerald-800/40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Decoding...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Decode Slip</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation error display */}
        {displayError && (
          <div
            id="booking-code-error"
            role="alert"
            className="flex items-center gap-2 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg p-2.5"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{displayError}</span>
          </div>
        )}

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
            Quick Samples:
          </span>
          {SAMPLE_CODES.map((sample) => (
            <button
              key={sample}
              type="button"
              disabled={isLoading}
              onClick={() => handleSampleClick(sample)}
              className="px-2.5 py-1 text-xs font-mono rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-colors disabled:opacity-50"
            >
              {sample}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
