import { describe, expect, it } from 'vitest';
import type { BetSelection } from '@/core/domain/BetSelection';
import { AppError } from '@/core/errors/AppError';
import type { BetwayRawBookResponse } from '@/core/gateway/BetwayTypes';
import { MockBetwayGateway } from '@/core/gateway/MockBetwayGateway';
import { CreateBookingCodeUseCase } from '@/core/use-cases/CreateBookingCodeUseCase';
import createFixture from '../../fixtures/create_response.json';

describe('CreateBookingCodeUseCase', () => {
  const sampleSelections: BetSelection[] = [
    {
      eventId: '72221212',
      eventName: 'Aston Villa vs. Arsenal FC',
      marketId: '72221212546',
      marketName: 'Double Chance & Both Teams To Score',
      selectionId: '722212125461718',
      selectionName: 'Aston Villa/Draw & Yes',
      odds: 3.35,
      isMarketActive: true,
    },
    {
      eventId: '72221313',
      eventName: 'Brighton vs. Manchester United',
      marketId: '72221313101',
      marketName: 'Match Result 1X2',
      selectionId: '7222131310101',
      selectionName: 'Brighton',
      odds: 2.45,
      isMarketActive: true,
    },
  ];

  describe('execute with valid input', () => {
    it('creates booking code from canonical selections array using MockBetwayGateway fixture', async () => {
      const gateway = new MockBetwayGateway({
        createFixture: createFixture as BetwayRawBookResponse,
      });
      const useCase = new CreateBookingCodeUseCase(gateway);

      const code = await useCase.execute(sampleSelections);

      expect(code).toBe('BW6D7AC4BA');
      expect(gateway.getCreateCallCount()).toBe(1);

      const lastOutcomes = gateway.getLastCreatedOutcomes();
      expect(lastOutcomes).toHaveLength(2);
      expect(lastOutcomes?.[0]).toEqual({
        outcomeId: '722212125461718',
        eventId: 72221212,
        marketId: '72221212546',
        selected: true,
      });
      expect(gateway.getLastIsSingleBet()).toBe(false);
    });

    it('accepts CreateBookingCodeRequest object and respects explicit isSingleBet flag', async () => {
      const gateway = new MockBetwayGateway({
        createFixture: { bookingCode: 'BW_SINGLE' },
      });
      const useCase = new CreateBookingCodeUseCase(gateway);

      const code = await useCase.execute({
        selections: sampleSelections,
        isSingleBet: true,
      });

      expect(code).toBe('BW_SINGLE');
      expect(gateway.getLastIsSingleBet()).toBe(true);
    });

    it('infers isSingleBet = true when exactly one selection is provided', async () => {
      const gateway = new MockBetwayGateway({
        createFixture: { bookingCode: 'BW_SINGLE_LEG' },
      });
      const useCase = new CreateBookingCodeUseCase(gateway);

      const code = await useCase.execute([sampleSelections[0]]);

      expect(code).toBe('BW_SINGLE_LEG');
      expect(gateway.getLastIsSingleBet()).toBe(true);
    });

    it('generates a synthetic booking code when no fixture is configured in MockBetwayGateway', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new CreateBookingCodeUseCase(gateway);

      const code = await useCase.execute(sampleSelections);

      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
      expect(code.startsWith('BW')).toBe(true);
    });
  });

  describe('input validation errors (400 INVALID_INPUT)', () => {
    it('throws AppError 400 when selections array is empty', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new CreateBookingCodeUseCase(gateway);

      await expect(useCase.execute([])).rejects.toThrowError(AppError);
      await expect(useCase.execute({ selections: [] })).rejects.toThrowError(AppError);

      try {
        await useCase.execute([]);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_INPUT');
        expect(appErr.statusCode).toBe(400);
      }
    });

    it('throws AppError 400 when input is null, undefined, or not an array', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new CreateBookingCodeUseCase(gateway);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(useCase.execute(null as any)).rejects.toThrowError(AppError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(useCase.execute(undefined as any)).rejects.toThrowError(AppError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(useCase.execute({} as any)).rejects.toThrowError(AppError);
    });

    it('throws AppError 400 when a selection is missing selectionId or has empty selectionId', async () => {
      const gateway = new MockBetwayGateway();
      const useCase = new CreateBookingCodeUseCase(gateway);

      const invalidSelection: BetSelection = {
        eventId: '1234',
        eventName: 'Team A vs Team B',
        marketId: '5678',
        marketName: '1X2',
        selectionId: '',
        selectionName: 'Draw',
        odds: 3.1,
      };

      await expect(useCase.execute([invalidSelection])).rejects.toThrowError(AppError);

      try {
        await useCase.execute([invalidSelection]);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_INPUT');
        expect(appErr.statusCode).toBe(400);
      }
    });
  });

  describe('upstream errors handling', () => {
    it('propagates upstream gateway failure (502 UPSTREAM_BETWAY_ERROR)', async () => {
      const gateway = new MockBetwayGateway({ shouldFailCreate: true });
      const useCase = new CreateBookingCodeUseCase(gateway);

      await expect(useCase.execute(sampleSelections)).rejects.toThrowError(AppError);

      try {
        await useCase.execute(sampleSelections);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('UPSTREAM_BETWAY_ERROR');
        expect(appErr.statusCode).toBe(502);
      }
    });

    it('throws AppError 502 when gateway returns an empty bookingCode', async () => {
      const gateway = new MockBetwayGateway({
        createFixture: { bookingCode: '' },
      });
      const useCase = new CreateBookingCodeUseCase(gateway);

      await expect(useCase.execute(sampleSelections)).rejects.toThrowError(AppError);

      try {
        await useCase.execute(sampleSelections);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('UPSTREAM_BETWAY_ERROR');
        expect(appErr.statusCode).toBe(502);
      }
    });
  });
});
