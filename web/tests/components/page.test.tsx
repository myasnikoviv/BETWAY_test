/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Home from '@/app/page';
import type { BetSlip } from '@/core/domain/BetSlip';
import type { ConvertResult } from '@/core/domain/ConvertResult';

describe('Home page (app/page.tsx) integration', () => {
  const sampleSlip: BetSlip = {
    bookingCode: 'BW6D7ABCFB',
    totalOdds: 21.57,
    isSingleBet: false,
    createdAt: '2026-08-31T15:40:00.000Z',
    selections: [
      {
        eventId: '72221212',
        eventName: 'Aston Villa vs. Arsenal FC',
        marketId: '72221212546',
        marketName: 'Double Chance & Both Teams To Score (GG/NG)',
        selectionId: '722212125461718',
        selectionName: 'Aston Villa/Draw & Yes',
        odds: 3.35,
        league: 'Premier League',
      },
    ],
  };

  const sampleConvertResult: ConvertResult = {
    sourceBookingCode: 'BW6D7ABCFB',
    newBookingCode: 'BW6D7AC4BA',
    convertedAt: '2026-08-31T15:40:05.000Z',
    slip: {
      ...sampleSlip,
      bookingCode: 'BW6D7AC4BA',
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial page shell with header, input form, and idle placeholder', () => {
    render(<Home />);

    expect(
      screen.getByText(/Betway Nigeria Booking Code Resolver & Converter/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('idle-placeholder')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Decode Slip/i })
    ).toBeInTheDocument();
  });

  it('decodes booking code and displays resolved BetSlipCard with convert button', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: sampleSlip,
      }),
    });

    render(<Home />);

    const input = screen.getByLabelText(/Betway Booking Code/i);
    fireEvent.change(input, { target: { value: 'BW6D7ABCFB' } });

    const submitBtn = screen.getByRole('button', { name: /Decode Slip/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Check that BetSlipCard is displayed
    expect(screen.getByTestId('bet-slip-card')).toBeInTheDocument();
    expect(screen.getByText('Aston Villa vs. Arsenal FC')).toBeInTheDocument();
    expect(screen.getByTestId('total-odds-value')).toHaveTextContent('21.57');

    // Convert button in headerAction should be visible
    expect(
      screen.getByRole('button', { name: /Convert \/ Re-Encode Bet/i })
    ).toBeInTheDocument();
  });

  it('performs full conversion workflow: resolve -> convert -> display comparison badge -> open verification modal', async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/resolve')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: sampleSlip,
          }),
        };
      }
      if (url.includes('/api/v1/convert')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: sampleConvertResult,
          }),
        };
      }
      return { ok: false, status: 404 };
    });

    globalThis.fetch = mockFetch;

    render(<Home />);

    // Step 1: Decode source booking code
    const input = screen.getByLabelText(/Betway Booking Code/i);
    fireEvent.change(input, { target: { value: 'BW6D7ABCFB' } });

    const decodeBtn = screen.getByRole('button', { name: /Decode Slip/i });
    await act(async () => {
      fireEvent.click(decodeBtn);
    });

    expect(screen.getByTestId('bet-slip-card')).toBeInTheDocument();

    // Step 2: Click Convert / Re-Encode button
    const convertBtn = screen.getByRole('button', { name: /Convert \/ Re-Encode Bet/i });
    await act(async () => {
      fireEvent.click(convertBtn);
    });

    // Step 3: Verify CodeComparisonBadge is shown with source and new code
    expect(screen.getByTestId('code-comparison-badge')).toBeInTheDocument();
    expect(screen.getByTestId('source-code-display')).toHaveTextContent('BW6D7ABCFB');
    expect(screen.getByTestId('new-code-display')).toHaveTextContent('BW6D7AC4BA');

    // Step 4: Open VerificationGuideModal
    const verifyBtn = screen.getByTestId('open-verification-modal-button');
    act(() => {
      fireEvent.click(verifyBtn);
    });

    expect(screen.getByTestId('verification-guide-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-booking-code')).toHaveTextContent('BW6D7AC4BA');

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Close verification modal/i });
    act(() => {
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByTestId('verification-guide-modal')).not.toBeInTheDocument();
  });

  it('handles conversion failure cleanly without destroying or hiding the active BetSlipCard', async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/resolve')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: sampleSlip,
          }),
        };
      }
      if (url.includes('/api/v1/convert')) {
        return {
          ok: false,
          status: 422,
          json: async () => ({
            success: false,
            error: {
              code: 'STALE_SELECTIONS',
              message: 'All selections in the booking code are concluded or inactive.',
              details: null,
            },
          }),
        };
      }
      return { ok: false, status: 404 };
    });

    globalThis.fetch = mockFetch;

    render(<Home />);

    // Resolve slip
    const input = screen.getByLabelText(/Betway Booking Code/i);
    fireEvent.change(input, { target: { value: 'BW6D7ABCFB' } });

    const decodeBtn = screen.getByRole('button', { name: /Decode Slip/i });
    await act(async () => {
      fireEvent.click(decodeBtn);
    });

    expect(screen.getByTestId('bet-slip-card')).toBeInTheDocument();

    // Trigger conversion that will fail
    const convertBtn = screen.getByRole('button', { name: /Convert \/ Re-Encode Bet/i });
    await act(async () => {
      fireEvent.click(convertBtn);
    });

    // Conversion error banner is displayed
    expect(
      screen.getByText('All selections in the booking code are concluded or inactive.')
    ).toBeInTheDocument();

    // The BetSlipCard is STILL rendered and intact! (Architectural Guarantee)
    expect(screen.getByTestId('bet-slip-card')).toBeInTheDocument();
    expect(screen.getByText('Aston Villa vs. Arsenal FC')).toBeInTheDocument();

    // Dismiss conversion error
    const dismissBtn = screen.getByRole('button', { name: /^Dismiss$/i });
    act(() => {
      fireEvent.click(dismissBtn);
    });

    expect(
      screen.queryByText('All selections in the booking code are concluded or inactive.')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('bet-slip-card')).toBeInTheDocument();
  });

  it('displays error banner when booking code resolution fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: {
          code: 'BOOKING_CODE_NOT_FOUND',
          message: 'The provided Betway booking code could not be found or has expired.',
          details: null,
        },
      }),
    });

    render(<Home />);

    const input = screen.getByLabelText(/Betway Booking Code/i);
    fireEvent.change(input, { target: { value: 'BW00000000' } });

    const submitBtn = screen.getByRole('button', { name: /Decode Slip/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The provided Betway booking code could not be found or has expired.'
      )
    ).toBeInTheDocument();
  });
});

