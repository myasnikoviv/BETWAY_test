/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BetSlipCard } from '@/components/BetSlipCard';
import type { BetSlip } from '@/core/domain/BetSlip';

describe('BetSlipCard component', () => {
  const multiLegSlip: BetSlip = {
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
        region: 'England',
      },
      {
        eventId: '72221315',
        eventName: 'Real Madrid vs. Barcelona',
        marketId: '72221315100',
        marketName: 'Match Result',
        selectionId: '722213151001',
        selectionName: 'Real Madrid',
        odds: 2.15,
        league: 'La Liga',
        region: 'Spain',
      },
      {
        eventId: '72221420',
        eventName: 'Bayern Munich vs. Dortmund',
        marketId: '72221420200',
        marketName: 'Over/Under 2.5 Goals',
        selectionId: '722214202002',
        selectionName: 'Over 2.5',
        odds: 1.50,
        league: 'Bundesliga',
        region: 'Germany',
      },
    ],
  };

  const singleLegSlip: BetSlip = {
    bookingCode: 'BWSINGLE123',
    totalOdds: 1.85,
    isSingleBet: true,
    createdAt: '2026-08-31T16:00:00.000Z',
    selections: [
      {
        eventId: '72221212',
        eventName: 'Chelsea vs. Liverpool',
        marketId: '72221212100',
        marketName: 'Both Teams To Score',
        selectionId: '722212121001',
        selectionName: 'Yes',
        odds: 1.85,
        league: 'Premier League',
      },
    ],
  };

  it('renders booking code, multi-bet status badge, and total odds', () => {
    render(<BetSlipCard slip={multiLegSlip} />);

    expect(screen.getByText('BW6D7ABCFB')).toBeInTheDocument();
    expect(screen.getByText(/Multi Bet \(3 legs\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('total-odds-value')).toHaveTextContent('21.57');
  });

  it('renders all selection items with match, market, selection, and individual odds', () => {
    render(<BetSlipCard slip={multiLegSlip} />);

    expect(screen.getByText('Aston Villa vs. Arsenal FC')).toBeInTheDocument();
    expect(screen.getByText('Double Chance & Both Teams To Score (GG/NG)')).toBeInTheDocument();
    expect(screen.getByText('Aston Villa/Draw & Yes')).toBeInTheDocument();
    expect(screen.getByText('3.35')).toBeInTheDocument();
    expect(screen.getByText('Premier League')).toBeInTheDocument();
    expect(screen.getByText('(England)')).toBeInTheDocument();

    expect(screen.getByText('Real Madrid vs. Barcelona')).toBeInTheDocument();
    expect(screen.getByText('2.15')).toBeInTheDocument();

    expect(screen.getByText('Bayern Munich vs. Dortmund')).toBeInTheDocument();
    expect(screen.getByText('1.50')).toBeInTheDocument();
  });

  it('renders single bet badge correctly', () => {
    render(<BetSlipCard slip={singleLegSlip} />);

    expect(screen.getByText('BWSINGLE123')).toBeInTheDocument();
    expect(screen.getByText('Single Bet')).toBeInTheDocument();
    expect(screen.getByTestId('total-odds-value')).toHaveTextContent('1.85');
  });

  it('renders headerAction slot when provided', () => {
    render(
      <BetSlipCard
        slip={multiLegSlip}
        headerAction={<button type="button">Convert Code</button>}
      />
    );

    expect(screen.getByRole('button', { name: /Convert Code/i })).toBeInTheDocument();
  });

  it('handles copying booking code to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<BetSlipCard slip={multiLegSlip} />);

    const copyBtn = screen.getByRole('button', { name: /Copy/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('BW6D7ABCFB');
    expect(screen.getByText(/✓ Copied/i)).toBeInTheDocument();
  });
});
