import React from 'react';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * Top navigation and branding header for the Betway Booking Code Application.
 */
export function Header({
  title = 'Betway Booking Code Engine',
  subtitle = 'Decode Betway Nigeria booking codes, inspect fixtures, markets, odds, and slip details.',
}: HeaderProps) {
  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-emerald-600/30">
            BW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg tracking-tight">
                {title}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                Nigeria 🇳🇬
              </span>
            </div>
            <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-md">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Assessment metadata badge */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700/60">
            Stellar Logic Assessment
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            API v1 Ready
          </span>
        </div>
      </div>
    </header>
  );
}
