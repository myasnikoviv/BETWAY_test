'use client';

import React, { useState } from 'react';

export interface CodeComparisonBadgeProps {
  /** Source / original booking code */
  sourceCode: string;
  /** Newly generated / converted booking code */
  newCode: string;
  /** Optional total odds to display comparison parity */
  totalOdds?: number;
  /** Optional number of selection legs */
  legsCount?: number;
  /** Optional callback to trigger verification guide modal */
  onOpenVerificationModal?: () => void;
}

/**
 * Renders a visual comparison badge highlighting original booking code vs freshly generated code,
 * with 1-click copy buttons and confirmation of preserved selections and odds.
 */
export function CodeComparisonBadge({
  sourceCode,
  newCode,
  totalOdds,
  legsCount,
  onOpenVerificationModal,
}: CodeComparisonBadgeProps) {
  const [copiedNew, setCopiedNew] = useState(false);
  const [copiedSource, setCopiedSource] = useState(false);

  const handleCopyNew = async () => {
    try {
      await navigator.clipboard.writeText(newCode);
      setCopiedNew(true);
      setTimeout(() => setCopiedNew(false), 2000);
    } catch {
      // Fallback if clipboard permission is denied
    }
  };

  const handleCopySource = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopiedSource(true);
      setTimeout(() => setCopiedSource(false), 2000);
    } catch {
      // Fallback if clipboard permission is denied
    }
  };

  return (
    <div
      data-testid="code-comparison-badge"
      className="w-full bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-teal-950/30 border border-emerald-500/30 dark:border-emerald-700/50 rounded-xl p-4 sm:p-5 shadow-xs transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left column: Codes comparison */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
              Conversion Successful
            </span>
            {totalOdds !== undefined && (
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {legsCount ? `${legsCount} legs • ` : ''}Odds: {totalOdds.toFixed(2)}x
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Source Code */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1">
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase">
                Source:
              </span>
              <span
                data-testid="source-code-display"
                className="font-mono font-bold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
              >
                {sourceCode}
              </span>
              <button
                type="button"
                onClick={handleCopySource}
                aria-label="Copy source booking code"
                className="ml-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                {copiedSource ? '✓' : 'Copy'}
              </button>
            </div>

            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              ➔
            </span>

            {/* New Converted Code */}
            <div className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-lg px-3 py-1 shadow-xs">
              <span className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider">
                New Code:
              </span>
              <span
                data-testid="new-code-display"
                className="font-mono font-black text-sm sm:text-base tracking-wider"
              >
                {newCode}
              </span>
              <button
                type="button"
                onClick={handleCopyNew}
                data-testid="copy-new-code-button"
                aria-label="Copy new booking code"
                className="ml-1 px-2 py-0.5 rounded text-xs font-bold bg-white/20 hover:bg-white/30 active:bg-white/40 text-white transition-colors"
              >
                {copiedNew ? '✓ Copied' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Verification CTA */}
        {onOpenVerificationModal && (
          <div className="flex sm:justify-end shrink-0">
            <button
              type="button"
              onClick={onOpenVerificationModal}
              data-testid="open-verification-modal-button"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <svg
                className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Verify on Betway</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation footer note */}
      <div className="mt-2.5 pt-2 border-t border-emerald-500/20 dark:border-emerald-800/30 flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
        <svg
          className="w-3.5 h-3.5 shrink-0"
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
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>
          Identical bet reconstructed: All fixtures, markets, and leg outcomes match the source slip.
        </span>
      </div>
    </div>
  );
}
