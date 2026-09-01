'use client';

import React from 'react';

export interface LoadingFeedbackProps {
  /** Optional loading message to display */
  message?: string;
}

/**
 * Animated loading spinner with accessible status feedback.
 */
export function LoadingFeedback({
  message = 'Resolving booking code from Betway Nigeria...',
}: LoadingFeedbackProps) {
  return (
    <div
      data-testid="loading-feedback"
      role="status"
      aria-live="polite"
      className="w-full p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs"
    >
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-200 dark:border-emerald-950 border-t-emerald-600 dark:border-t-emerald-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
          BW
        </div>
      </div>
      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base mb-1">
        Fetching Bet Slip
      </h4>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
        {message}
      </p>
    </div>
  );
}

export interface ErrorBannerProps {
  /** Error message to display */
  message: string;
  /** Optional title for the error alert */
  title?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Optional dismiss callback */
  onDismiss?: () => void;
}

/**
 * User-friendly error alert card with informative troubleshooting context.
 */
export function ErrorBanner({
  message,
  title = 'Failed to Decode Booking Code',
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <div
      data-testid="error-banner"
      role="alert"
      className="w-full p-5 sm:p-6 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-xl shadow-xs transition-all"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
          <svg
            className="w-5 h-5"
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-red-900 dark:text-red-200 text-sm sm:text-base mb-1">
            {title}
          </h4>
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300/90 leading-relaxed mb-3">
            {message}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state placeholder when no slip has been queried yet.
 */
export function IdlePlaceholder() {
  return (
    <div
      data-testid="idle-placeholder"
      className="w-full p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl"
    >
      <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-3">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base mb-1">
        No Bet Slip Loaded
      </h4>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
        Enter a Betway booking code above or choose one of the quick samples to decode match events, markets, selections, and total odds.
      </p>
    </div>
  );
}
