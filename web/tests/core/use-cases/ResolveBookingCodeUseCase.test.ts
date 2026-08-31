import { describe, expect, it } from 'vitest';
import { AppError } from '@/core/errors/AppError';
import type { BetwayRawFindResponse } from '@/core/gateway/BetwayTypes';
import { MockBetwayGateway } from '@/core/gateway/MockBetwayGateway';
import { ResolveBookingCodeUseCase } from '@/core/use-cases/ResolveBookingCodeUseCase';
import resolveFixture from '../../fixtures/resolve_response.json';

describe('ResolveBookingCodeUseCase', () => {
  describe('execute with valid input', () => {
    it('resolves booking code string to a canonical BetSlip using MockBetwayGateway fixture', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
      });
      const useCase = new ResolveBookingCodeUseCase(gateway);

      const slip = await useCase.execute('BW6D7ABCFB');

      expect(slip.bookingCode).toBe('BW6D7ABCFB');
      expect(slip.selections).toHaveLength(2);
      expect(slip.isSingleBet).toBe(false);
      expect(slip.totalOdds).toBe(10.89);
      expect(slip.createdAt).toBeDefined();
      expect(typeof slip.createdAt).toBe('string');

      expect(slip.selections[0]).toEqual({
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
        eventStartTime: 1788202800,
        isMarketActive: true,
      });

      expect(gateway.getResolveCallCount()).toBe(1);
      expect(gateway.getLastResolvedCode()).toBe('BW6D7ABCFB');
    });

    it('accepts ResolveBookingCodeRequest object parameter', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
      });
      const useCase = new ResolveBookingCodeUseCase(gateway);

      const slip = await useCase.execute({ bookingCode: 'BW6D7ABCFB' });

      expect(slip.bookingCode).toBe('BW6D7ABCFB');
      expect(slip.selections).toHaveLength(2);
      expect(slip.totalOdds).toBe(10.89);
    });

    it('trims leading and trailing whitespace from booking code', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
      });
      const useCase = new ResolveBookingCodeUseCase(gateway);

      const slip = await useCase.execute('  BW6D7ABCFB  ');

      expect(slip.bookingCode).toBe('BW6D7ABCFB');
      expect(gateway.getLastResolvedCode()).toBe('BW6D7ABCFB');
    });

    it('resolves single bet with single-leg fixture and correctly marks isSingleBet = true', async () => {
      const singleLegFixture: BetwayRawFindResponse = {
        selections: [
          {
            eventId: '888111',
            eventName: 'Chelsea vs. Liverpool',
            marketId: '88811101',
            marketName: 'Match Result 1X2',
            outcomeId: '8881110101',
            outcomeName: 'Home',
            priceDecimal: 2.5,
            isMarketActive: true,
          },
        ],
        isSingleBet: true,
      };

      const gateway = new MockBetwayGateway({ resolveFixture: singleLegFixture });
      const useCase = new ResolveBookingCodeUseCase(gateway);

      const slip = await useCase.execute('BW1234');

      expect(slip.bookingCode).toBe('BW1234');
      expect(slip.selections).toHaveLength(1);
      expect(slip.isSingleBet).toBe(true);
      expect(slip.totalOdds).toBe(2.5);
    });
  });

  describe('input validation errors (400 INVALID_INPUT)', () => {
    it('throws AppError 400 when booking code is empty string or whitespace', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ResolveBookingCodeUseCase(gateway);

      try {
        await useCase.execute('');
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_INPUT');
        expect(appErr.statusCode).toBe(400);
      }

      await expect(useCase.execute('   ')).rejects.toThrowError(AppError);
      await expect(useCase.execute({ bookingCode: '' })).rejects.toThrowError(AppError);
    });

    it('throws AppError 400 when booking code is shorter than 4 characters', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ResolveBookingCodeUseCase(gateway);

      try {
        await useCase.execute('ABC');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_INPUT');
        expect(appErr.statusCode).toBe(400);
      }
    });

    it('throws AppError 400 when booking code is longer than 15 characters', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ResolveBookingCodeUseCase(gateway);

      try {
        await useCase.execute('1234567890123456');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_INPUT');
        expect(appErr.statusCode).toBe(400);
      }
    });

    it('throws AppError 400 when booking code contains special characters', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ResolveBookingCodeUseCase(gateway);

      await expect(useCase.execute('BW-1234!')).rejects.toThrowError(AppError);
      await expect(useCase.execute('BW_12345')).rejects.toThrowError(AppError);
      await expect(useCase.execute('BW 12345')).rejects.toThrowError(AppError);
    });

    it('throws AppError 400 when input is null, undefined, or invalid object', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ResolveBookingCodeUseCase(gateway);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(useCase.execute(undefined as any)).rejects.toThrowError(AppError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(useCase.execute(null as any)).rejects.toThrowError(AppError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(useCase.execute({} as any)).rejects.toThrowError(AppError);
    });
  });

  describe('gateway errors propagation', () => {
    it('propagates 404 BOOKING_CODE_NOT_FOUND when booking code does not exist', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ResolveBookingCodeUseCase(gateway);

      try {
        await useCase.execute('INVALID404');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('BOOKING_CODE_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });

    it('propagates 502 UPSTREAM_BETWAY_ERROR when gateway fails', async () => {
      const gateway = new MockBetwayGateway({ shouldFailResolve: true });
      const useCase = new ResolveBookingCodeUseCase(gateway);

      try {
        await useCase.execute('BW6D7ABCFB');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('UPSTREAM_BETWAY_ERROR');
        expect(appErr.statusCode).toBe(502);
      }
    });
  });
});
