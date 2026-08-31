import { describe, expect, it } from 'vitest';
import { AppError } from '@/core/errors/AppError';
import { MockBetwayGateway } from '@/core/gateway/MockBetwayGateway';
import type { BetwayOutcomePayload, BetwayRawFindResponse } from '@/core/gateway/BetwayTypes';
import createFixture from '../../fixtures/create_response.json';
import resolveFixture from '../../fixtures/resolve_response.json';

describe('MockBetwayGateway', () => {
  const sampleOutcomes: BetwayOutcomePayload[] = [
    {
      outcomeId: '722212125461718',
      eventId: 72221212,
      marketId: '72221212546',
      selected: true,
    },
  ];

  describe('resolve', () => {
    it('returns provided resolve fixture and tracks call history', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
      });

      const result = await gateway.resolve('BW6D7ABCFB');

      expect(result).toEqual(resolveFixture);
      expect(gateway.getResolveCallCount()).toBe(1);
      expect(gateway.getLastResolvedCode()).toBe('BW6D7ABCFB');
      expect(gateway.getResolvedCodes()).toEqual(['BW6D7ABCFB']);
    });

    it('returns a clone of the fixture preventing caller mutations from polluting mock', async () => {
      const gateway = new MockBetwayGateway({
        resolveFixture: resolveFixture as BetwayRawFindResponse,
      });

      const result1 = await gateway.resolve('CODE1');
      if (result1.selections && result1.selections.length > 0) {
        result1.selections[0].eventName = 'Mutated Event Name';
      }

      const result2 = await gateway.resolve('CODE2');
      expect(result2.selections?.[0].eventName).toBe('Aston Villa vs. Arsenal FC');
    });

    it('returns synthetic response when no fixture is configured', async () => {
      const gateway = new MockBetwayGateway();
      const result = await gateway.resolve('BW123456');

      expect(result.selections).toHaveLength(1);
      expect(result.selections?.[0].outcomeId).toBe('722212125461718');
    });

    it('throws AppError 404 for NOT_FOUND / INVALID404 / EXPIRED booking codes', async () => {
      const gateway = new MockBetwayGateway();

      await expect(gateway.resolve('NOT_FOUND')).rejects.toThrowError(AppError);
      await expect(gateway.resolve('INVALID404')).rejects.toThrowError(AppError);
      await expect(gateway.resolve('EXPIRED')).rejects.toThrowError(AppError);

      try {
        await gateway.resolve('NOT_FOUND');
      } catch (err) {
        expect((err as AppError).code).toBe('BOOKING_CODE_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });

    it('throws AppError 400 for empty booking codes', async () => {
      const gateway = new MockBetwayGateway();

      await expect(gateway.resolve('')).rejects.toThrowError(AppError);
      await expect(gateway.resolve('   ')).rejects.toThrowError(AppError);
    });

    it('simulates upstream failure when shouldFailResolve is enabled', async () => {
      const gateway = new MockBetwayGateway({ shouldFailResolve: true });

      await expect(gateway.resolve('BW6D7ABCFB')).rejects.toThrowError(AppError);

      try {
        await gateway.resolve('BW6D7ABCFB');
      } catch (err) {
        expect((err as AppError).code).toBe('UPSTREAM_BETWAY_ERROR');
        expect((err as AppError).statusCode).toBe(502);
      }
    });
  });

  describe('create', () => {
    it('returns provided create fixture and records created outcomes history', async () => {
      const gateway = new MockBetwayGateway({ createFixture });

      const result = await gateway.create(sampleOutcomes, true);

      expect(result).toEqual(createFixture);
      expect(gateway.getCreateCallCount()).toBe(1);
      expect(gateway.getLastCreatedOutcomes()).toEqual(sampleOutcomes);
      expect(gateway.getCreatedOutcomesHistory()).toEqual([sampleOutcomes]);
      expect(gateway.getLastIsSingleBet()).toBe(true);
    });

    it('generates synthetic booking code when no create fixture is provided', async () => {
      const gateway = new MockBetwayGateway();
      const result = await gateway.create(sampleOutcomes);

      expect(result.bookingCode).toMatch(/^BW[A-Z0-9]+$/);
    });

    it('throws AppError 400 for empty outcomes list', async () => {
      const gateway = new MockBetwayGateway();

      await expect(gateway.create([])).rejects.toThrowError(AppError);
    });

    it('simulates upstream failure when shouldFailCreate is enabled', async () => {
      const gateway = new MockBetwayGateway({ shouldFailCreate: true });

      await expect(gateway.create(sampleOutcomes)).rejects.toThrowError(AppError);
    });
  });

  describe('reset and dynamic mutation', () => {
    it('resets call history and failure flags correctly', async () => {
      const gateway = new MockBetwayGateway();

      await gateway.resolve('CODE1');
      await gateway.create(sampleOutcomes);
      gateway.setFailResolve(true);

      expect(gateway.getResolveCallCount()).toBe(1);
      expect(gateway.getCreateCallCount()).toBe(1);

      gateway.reset();

      expect(gateway.getResolveCallCount()).toBe(0);
      expect(gateway.getCreateCallCount()).toBe(0);
      expect(gateway.getLastResolvedCode()).toBeUndefined();
      expect(gateway.getLastCreatedOutcomes()).toBeUndefined();

      // After reset, resolve should succeed again
      await expect(gateway.resolve('CODE2')).resolves.toBeDefined();
    });

    it('dynamically updates fixtures via setter methods', async () => {
      const gateway = new MockBetwayGateway();

      gateway.setResolveFixture(resolveFixture as BetwayRawFindResponse);
      const resResult = await gateway.resolve('TEST_CODE');
      expect(resResult).toEqual(resolveFixture);

      gateway.setCreateFixture({ bookingCode: 'DYNAMIC_CODE' });
      const createResult = await gateway.create(sampleOutcomes);
      expect(createResult.bookingCode).toBe('DYNAMIC_CODE');
    });
  });
});
