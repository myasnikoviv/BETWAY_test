'use client';

import React from 'react';

export interface ConvertActionBarProps {
  /** The booking code to convert */
  bookingCode: string;
  /** Callback to trigger conversion */
  onConvert: (bookingCode: string) => void | Promise<unknown>;
  /** Indicates whether conversion request is currently in-flight */
  isConverting?: boolean;
  /** Disable button interaction */
  disabled?: boolean;
}

/**
 * Action bar component providing 1-click re-encoding / conversion for an active betslip.
 */
export function ConvertActionBar({
  bookingCode,
  onConvert,
  isConverting = false,
  disabled = false,
}: ConvertActionBarProps) {
  const handleClick = () => {
    if (isConverting || disabled || !bookingCode) return;
    onConvert(bookingCode);
  };

  const isDisabled = disabled || isConverting || !bookingCode;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        data-testid="convert-action-button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label="Convert / Re-Encode Bet"
        aria-busy={isConverting}
        className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/50 dark:disabled:bg-emerald-800/40 disabled:cursor-not-allowed transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        {isConverting ? (
          <>
            <svg
              className="animate-spin -ml-0.5 h-3.5 w-3.5 text-white"
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
            <span>Converting...</span>
          </>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Convert / Re-Encode Bet</span>
          </>
        )}
      </button>
    </div>
  );
}
