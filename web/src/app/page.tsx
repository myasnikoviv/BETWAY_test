'use client';

import React, { useState } from 'react';
import { useBetSlip } from '@/hooks/useBetSlip';
import { useConvertBetSlip } from '@/hooks/useConvertBetSlip';
import {
  Header,
  BookingCodeInputForm,
  BetSlipCard,
  ConvertActionBar,
  CodeComparisonBadge,
  VerificationGuideModal,
  LoadingFeedback,
  ErrorBanner,
  IdlePlaceholder,
} from '@/components';

export default function Home() {
  const {
    status,
    slip,
    error,
    bookingCode,
    resolveCode,
    reset,
    isLoading,
  } = useBetSlip();

  const {
    convertResult,
    convertError,
    convert,
    reset: resetConvert,
    setConvertError,
    isConverting,
  } = useConvertBetSlip();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDecode = async (code: string) => {
    resetConvert();
    await resolveCode(code);
  };

  const handleReset = () => {
    reset();
    resetConvert();
  };

  const handleConvert = async (codeToConvert: string) => {
    await convert(codeToConvert);
  };

  const activeSlip = convertResult ? convertResult.slip : slip;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Intro banner */}
        <section className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Betway Nigeria Booking Code Resolver &amp; Converter
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Ingest live booking codes, extract canonical selections, re-encode fresh booking codes, and verify directly on Betway Nigeria.
          </p>
        </section>

        {/* Form input section */}
        <section aria-label="Booking Code Input">
          <BookingCodeInputForm
            onDecode={handleDecode}
            isLoading={isLoading}
            initialValue={bookingCode}
          />
        </section>

        {/* Dynamic feedback and results section */}
        <section aria-label="Bet Slip Results" className="space-y-5 transition-all">
          {status === 'loading' && <LoadingFeedback />}

          {status === 'error' && error && (
            <ErrorBanner
              message={error}
              onRetry={bookingCode ? () => resolveCode(bookingCode) : undefined}
              onDismiss={handleReset}
            />
          )}

          {status === 'success' && slip && activeSlip && (
            <div className="space-y-4">
              {/* Conversion error banner (does not hide the active slip) */}
              {convertError && (
                <ErrorBanner
                  message={convertError}
                  title="Conversion Failed"
                  onRetry={
                    slip.bookingCode
                      ? () => {
                          if (slip.bookingCode) {
                            handleConvert(slip.bookingCode);
                          }
                        }
                      : undefined
                  }
                  onDismiss={() => setConvertError(null)}
                />
              )}

              {/* Conversion comparison badge */}
              {convertResult && (
                <CodeComparisonBadge
                  sourceCode={convertResult.sourceBookingCode}
                  newCode={convertResult.newBookingCode}
                  totalOdds={convertResult.slip.totalOdds}
                  legsCount={convertResult.slip.selections.length}
                  onOpenVerificationModal={() => setIsModalOpen(true)}
                />
              )}

              {/* Canonical Bet Slip view */}
              <BetSlipCard
                slip={activeSlip}
                headerAction={
                  slip.bookingCode ? (
                    <ConvertActionBar
                      bookingCode={slip.bookingCode}
                      onConvert={handleConvert}
                      isConverting={isConverting}
                    />
                  ) : undefined
                }
              />

              {/* Modal dialog for Loom walkthrough verification */}
              <VerificationGuideModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                bookingCode={convertResult?.newBookingCode || slip.bookingCode || ''}
                sourceCode={convertResult?.sourceBookingCode || slip.bookingCode}
              />
            </div>
          )}

          {status === 'idle' && <IdlePlaceholder />}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Stellar Logic Assessment • Full-Stack TypeScript Engineering</span>
          <span className="font-mono text-[11px]">Next.js App Router • Tailwind CSS • Vitest</span>
        </div>
      </footer>
    </div>
  );
}

