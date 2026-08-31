import { describe, it, expect } from 'vitest';
import type { BetSelection } from '@/core/domain';

describe('BetSelection Domain Model', () => {
  it('should instantiate a complete BetSelection matching canonical interface', () => {
    const selection: BetSelection = {
      eventId: '72221212',
      eventName: 'Aston Villa vs. Arsenal FC',
      marketId: '72221212546',
      marketName: 'Double Chance & Both Teams To Score (GG/NG)',
      selectionId: '722212125461718',
      selectionName: 'Aston Villa/Draw & Yes',
      odds: 3.35,
      sportId: 'soccer',
      league: 'Premier League',
      region: 'England',
      eventStartTime: 1725116400,
      isMarketActive: true,
    };

    expect(selection.eventId).toBe('72221212');
    expect(selection.eventName).toBe('Aston Villa vs. Arsenal FC');
    expect(selection.marketId).toBe('72221212546');
    expect(selection.marketName).toBe('Double Chance & Both Teams To Score (GG/NG)');
    expect(selection.selectionId).toBe('722212125461718');
    expect(selection.selectionName).toBe('Aston Villa/Draw & Yes');
    expect(selection.odds).toBe(3.35);
    expect(selection.sportId).toBe('soccer');
    expect(selection.league).toBe('Premier League');
    expect(selection.region).toBe('England');
    expect(selection.eventStartTime).toBe(1725116400);
    expect(selection.isMarketActive).toBe(true);
  });

  it('should allow optional fields to be omitted', () => {
    const selection: BetSelection = {
      eventId: '1001',
      eventName: 'Team A vs Team B',
      marketId: '2001',
      marketName: 'Match Result',
      selectionId: '3001',
      selectionName: 'Team A',
      odds: 1.85,
    };

    expect(selection.eventId).toBe('1001');
    expect(selection.odds).toBe(1.85);
    expect(selection.sportId).toBeUndefined();
    expect(selection.league).toBeUndefined();
    expect(selection.region).toBeUndefined();
    expect(selection.eventStartTime).toBeUndefined();
    expect(selection.isMarketActive).toBeUndefined();
  });
});
