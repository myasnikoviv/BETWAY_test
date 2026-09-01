/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Home from '@/app/page';
import type { BetSlip } from '@/core/domain/BetSlip';

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

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial page shell with header, input form, and idle placeholder', () => {
    render(<Home />);

    expect(
      screen.getByText('Betway Nigeria Booking Code Resolver')
    ).toBeInTheDocument();
    expect(screen.getByTestId('idle-placeholder')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Decode Slip/i })
    ).toBeInTheDocument();
  });

  it('decodes booking code and displays resolved BetSlipCard', async () => {
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
