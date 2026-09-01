'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface VerificationGuideModalProps {
  /** Flag indicating whether the modal dialog is visible */
  isOpen: boolean;
  /** Callback fired to close the modal */
  onClose: () => void;
  /** Newly converted or active booking code to verify */
  bookingCode: string;
  /** Optional original/source booking code */
  sourceCode?: string;
}

/**
 * Modal dialog presenting step-by-step verification instructions, copyable code,
 * and outbound links to Betway Nigeria for Loom walkthrough verification.
 */
export function VerificationGuideModal({
  isOpen,
  onClose,
  bookingCode,
  sourceCode,
}: VerificationGuideModalProps) {
  const [copied, setCopied] = useState(false);

  // Handle ESC key to dismiss modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    if (!bookingCode) return;
    try {
      await navigator.clipboard.writeText(bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-testid="verification-guide-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <h2
                id="verification-modal-title"
                className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight"
              >
                Verify on Betway Nigeria
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live verification guide for Loom walkthrough
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close verification modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Booking Code Callout */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Converted Booking Code to Test
            </span>
            <div className="flex items-center justify-between gap-3">
              <span
                data-testid="modal-booking-code"
                className="font-mono font-black text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400 tracking-wider"
              >
                {bookingCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                data-testid="modal-copy-code-button"
                aria-label="Copy booking code from modal"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copied ? '✓ Copied' : 'Copy Code'}
              </button>
            </div>
            {sourceCode && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Replaces source code: <span className="font-mono font-medium">{sourceCode}</span>
              </p>
            )}
          </div>

          {/* Step-by-step instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Step-by-Step Verification Procedure
            </h3>

            <ol className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Copy the Code:</strong> Click the copy button above to put the new code (<code className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">{bookingCode}</code>) onto your clipboard.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Open Betway Nigeria:</strong> Navigate to{' '}
                  <a
                    href="https://www.betway.com.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-700"
                  >
                    betway.com.ng
                  </a>{' '}
                  in a browser tab (no login or account required).
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Navigate to &ldquo;Book-a-Bet&rdquo;:</strong> Open the Betslip sidebar or footer panel and switch to the <strong>&ldquo;Book-a-Bet&rdquo;</strong> tab.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  <strong>Paste &amp; Search:</strong> Paste your code into the search box and click the <strong>&ldquo;Search / Load Slip&rdquo;</strong> button.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  5
                </span>
                <span>
                  <strong>Confirm Selections:</strong> Verify that the exact same matches, markets, and selections populate the official Betway betslip.
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors"
          >
            Close
          </button>

          <a
            href="https://www.betway.com.ng"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="outbound-betway-link"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/20 transition-all text-center"
          >
            <span>Open Betway Nigeria (betway.com.ng)</span>
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
