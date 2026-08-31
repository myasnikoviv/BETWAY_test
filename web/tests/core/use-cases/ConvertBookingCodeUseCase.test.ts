import { describe, expect, it } from 'vitest';
import { AppError } from '@/core/errors/AppError';
import type { BetwayRawBookResponse, BetwayRawFindResponse } from '@/core/gateway/BetwayTypes';
import { MockBetwayGateway } from '@/core/gateway/MockBetwayGateway';
import { ConvertBookingCodeUseCase } from '@/core/use-cases/ConvertBookingCodeUseCase';
import { CreateBookingCodeUseCase } from '@/core/use-cases/CreateBookingCodeUseCase';
import { ResolveBookingCodeUseCase } from '@/core/use-cases/ResolveBookingCodeUseCase';
import createFixture from '../../fixtures/create_response.json';
import resolveFixture from '../../fixtures/resolve_response.json';

describe('ConvertBookingCodeUseCase', () => {
  describe('execute stateless composition (INV-05)', () => {
    it('successfully converts an existing booking code into a new booking code with canonical ConvertResult', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
        createFixture: createFixture as BetwayRawBookResponse,
      });

      const useCase = new ConvertBookingCodeUseCase(gateway);

      const result = await useCase.execute('BW6D7ABCFB');

      expect(result.sourceBookingCode).toBe('BW6D7ABCFB');
      expect(result.newBookingCode).toBe('BW6D7AC4BA');
      expect(result.convertedAt).toBeDefined();

      expect(result.slip).toBeDefined();
      expect(result.slip.bookingCode).toBe('BW6D7AC4BA');
      expect(result.slip.selections).toHaveLength(2);
      expect(result.slip.totalOdds).toBe(10.89);
      expect(result.slip.isSingleBet).toBe(false);

      expect(gateway.getResolveCallCount()).toBe(1);
      expect(gateway.getLastResolvedCode()).toBe('BW6D7ABCFB');
      expect(gateway.getCreateCallCount()).toBe(1);

      const outcomes = gateway.getLastCreatedOutcomes();
      expect(outcomes).toHaveLength(2);
    });

    it('accepts ConvertBookingCodeRequest object with sourceBookingCode or bookingCode', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
        createFixture: createFixture as BetwayRawBookResponse,
      });

      const useCase = new ConvertBookingCodeUseCase(gateway);

      const result1 = await useCase.execute({ sourceBookingCode: 'BW6D7ABCFB' });
      expect(result1.sourceBookingCode).toBe('BW6D7ABCFB');
      expect(result1.newBookingCode).toBe('BW6D7AC4BA');

      const result2 = await useCase.execute({ bookingCode: 'BW6D7ABCFB' });
      expect(result2.sourceBookingCode).toBe('BW6D7ABCFB');
      expect(result2.newBookingCode).toBe('BW6D7AC4BA');
    });

    it('supports custom injected ResolveBookingCodeUseCase and CreateBookingCodeUseCase instances', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
        createFixture: createFixture as BetwayRawBookResponse,
      });

      const resolveUC = new ResolveBookingCodeUseCase(gateway);
      const createUC = new CreateBookingCodeUseCase(gateway);
      const useCase = new ConvertBookingCodeUseCase(resolveUC, createUC);

      const result = await useCase.execute('BW6D7ABCFB');

      expect(result.sourceBookingCode).toBe('BW6D7ABCFB');
      expect(result.newBookingCode).toBe('BW6D7AC4BA');
      expect(result.slip.selections).toHaveLength(2);
    });
  });

  describe('input validation errors (400 INVALID_INPUT)', () => {
    it('throws AppError 400 when source booking code is empty or whitespace', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ConvertBookingCodeUseCase(gateway);

      try {
        await useCase.execute('');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_INPUT');
        expect(appErr.statusCode).toBe(400);
      }

      await expect(useCase.execute('   ')).rejects.toThrowError(AppError);
      await expect(useCase.execute({ sourceBookingCode: '' })).rejects.toThrowError(AppError);

      // Create should never be called
      expect(gateway.getCreateCallCount()).toBe(0);
    });

    it('throws AppError 400 when source code fails syntax validation (< 4 chars)', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ConvertBookingCodeUseCase(gateway);

      try {
        await useCase.execute('XYZ');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_INPUT');
        expect(appErr.statusCode).toBe(400);
      }

      expect(gateway.getCreateCallCount()).toBe(0);
    });
  });

  describe('resolve failure short-circuiting', () => {
    it('propagates 404 BOOKING_CODE_NOT_FOUND without calling create', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new ConvertBookingCodeUseCase(gateway);

      try {
        await useCase.execute('INVALID404');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('BOOKING_CODE_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }

      expect(gateway.getCreateCallCount()).toBe(0);
    });

    it('propagates 502 UPSTREAM_BETWAY_ERROR on resolve without calling create', async () => {
      const gateway = new MockBetwayGateway({ shouldFailResolve: true });
      const useCase = new ConvertBookingCodeUseCase(gateway);

      try {
        await useCase.execute('BW6D7ABCFB');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('UPSTREAM_BETWAY_ERROR');
        expect(appErr.statusCode).toBe(502);
      }

      expect(gateway.getCreateCallCount()).toBe(0);
    });
  });

  describe('stale selections handling (422 STALE_SELECTIONS)', () => {
    it('throws AppError 422 when a selection has isMarketActive: false and does not call create', async () => {
      const fixtureWithInactiveLeg: BetwayRawFindResponse = {
        selections: [
          {
            eventId: '72221212',
            eventName: 'Aston Villa vs. Arsenal FC',
            marketId: '72221212546',
            marketName: 'Match Result',
            outcomeId: '722212125461718',
            outcomeName: 'Home',
            priceDecimal: 2.1,
            isMarketActive: true,
          },
          {
            eventId: '72221313',
            eventName: 'Fulham vs. Leicester City',
            marketId: '72221313101',
            marketName: 'Match Result',
            outcomeId: '7222131310101',
            outcomeName: 'Away',
            priceDecimal: 3.4,
            isMarketActive: false, // Suspended / closed market
          },
        ],
      };

      const gateway = new MockBetwayGateway({
        resolveFixture: fixtureWithInactiveLeg,
        createFixture: createFixture as BetwayRawBookResponse,
      });

      const useCase = new ConvertBookingCodeUseCase(gateway);

      try {
        await useCase.execute('BW6D7ABCFB');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('STALE_SELECTIONS');
        expect(appErr.statusCode).toBe(422);
      }

      expect(gateway.getCreateCallCount()).toBe(0);
    });
  });

  describe('create failure propagation', () => {
    it('propagates upstream create failure when resolve succeeded', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
        shouldFailCreate: true,
      });

      const useCase = new ConvertBookingCodeUseCase(gateway);

      try {
        await useCase.execute('BW6D7ABCFB');
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('UPSTREAM_BETWAY_ERROR');
        expect(appErr.statusCode).toBe(502);
      }

      expect(gateway.getResolveCallCount()).toBe(1);
      expect(gateway.getCreateCallCount()).toBe(1);
    });
  });

  describe('statelessness and call isolation', () => {
    it('ensures repeated calls are isolated and do not leak state between executions', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
        createFixture: createFixture as BetwayRawBookResponse,
      });

      const useCase = new ConvertBookingCodeUseCase(gateway);

      const res1 = await useCase.execute('CODE001');
      const res2 = await useCase.execute('CODE002');

      expect(res1.sourceBookingCode).toBe('CODE001');
      expect(res2.sourceBookingCode).toBe('CODE002');
      expect(gateway.getResolveCallCount()).toBe(2);
      expect(gateway.getCreateCallCount()).toBe(2);
      expect(gateway.getResolvedCodes()).toEqual(['CODE001', 'CODE002']);
    });
  });
});
