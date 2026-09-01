'use client';

import React, { useState } from 'react';
import type { BetSlip } from '../core/domain/BetSlip';
import type { BetSelection } from '../core/domain/BetSelection';

export interface BetSlipCardProps {
  /** The canonical BetSlip domain model to display */
  slip: BetSlip;
  /** Optional custom title or action button slot */
  headerAction?: React.ReactNode;
}

/**
 * Renders an individual betting selection (leg).
 */
function SelectionItem({
  selection,
  index,
}: {
  selection: BetSelection;
  index: number;
}) {
  return (
    <div
      data-testid={`selection-item-${index}`}
      className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 transition-all hover:border-emerald-500/40 dark:hover:border-emerald-500/40"
    >
      {/* Top row: Match & League / Region */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-tight">
            {selection.eventName}
          </h4>
        </div>

        {(selection.league || selection.region) && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 pl-7 sm:pl-0">
            {selection.league && (
              <span className="font-medium bg-zinc-200/70 dark:bg-zinc-700/60 px-2 py-0.5 rounded text-[11px] text-zinc-700 dark:text-zinc-300">
                {selection.league}
              </span>
            )}
            {selection.region && (
              <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                ({selection.region})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Middle row: Market & Outcome with Odds */}
      <div className="pl-7 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/40">
        <div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
            Market
          </span>
          <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {selection.marketName}
          </span>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block sm:text-right">
              Selection
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs sm:text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              {selection.selectionName}
            </span>
          </div>

          <div className="text-right pl-2 border-l border-zinc-200 dark:border-zinc-700">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
              Odds
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              {selection.odds.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card component displaying canonical BetSlip details, individual selection legs, and cumulative odds.
 */
export function BetSlipCard({ slip, headerAction }: BetSlipCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!slip.bookingCode) return;
    try {
      await navigator.clipboard.writeText(slip.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard permission is denied
    }
  };

  const legsCount = slip.selections.length;
  const isSingle = slip.isSingleBet || legsCount === 1;

  return (
    <div
      data-testid="bet-slip-card"
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden transition-all"
    >
      {/* Slip Header */}
      <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Booking Code
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                {slip.bookingCode || 'UNSAVED'}
              </span>
              {slip.bookingCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
                  aria-label="Copy booking code to clipboard"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {isSingle ? 'Single Bet' : `Multi Bet (${legsCount} legs)`}
              </span>
              {slip.createdAt && (
                <span>
                  • Created: {new Date(slip.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {headerAction && (
            <div className="flex items-center gap-2">{headerAction}</div>
          )}
        </div>
      </div>

      {/* Selections List */}
      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Selections ({legsCount})
          </h3>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Canonical Domain View
          </span>
        </div>

        {slip.selections.map((selection, idx) => (
          <SelectionItem
            key={`${selection.selectionId}-${idx}`}
            selection={selection}
            index={idx}
          />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="p-5 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <span>Cumulative slip product calculated across all active legs.</span>
          </div>

          <div className="flex items-baseline justify-between sm:justify-end gap-3">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Total Odds:
            </span>
            <div className="flex items-baseline gap-1">
              <span
                data-testid="total-odds-value"
                className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight"
              >
                {slip.totalOdds.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
