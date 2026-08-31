import { NextResponse } from 'next/server';
import type { BetSelection } from '@/core/domain/BetSelection';
import { BetwayHttpGateway } from '@/core/gateway/BetwayHttpGateway';
import type { IBetwayGateway } from '@/core/gateway/IBetwayGateway';
import { CreateBookingCodeUseCase } from '@/core/use-cases/CreateBookingCodeUseCase';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-response';
import { createBookingCodeSchema } from '@/lib/validation';

/**
 * Handles incoming create booking code requests.
 * Accepts optional IBetwayGateway for deterministic testing and dependency injection.
 */
export async function handleCreateRequest(
  request: Request,
  gateway: IBetwayGateway = new BetwayHttpGateway()
): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiErrorResponse(new SyntaxError('Malformed JSON in request body.'), 400);
    }

    const validated = createBookingCodeSchema.parse(body);
    const useCase = new CreateBookingCodeUseCase(gateway);

    // Map input selections to BetSelection objects for use case
    const selections: BetSelection[] = validated.selections.map((s) => ({
      eventId: s.eventId,
      eventName: s.eventName ?? '',
      marketId: s.marketId,
      marketName: s.marketName ?? '',
      selectionId: s.selectionId,
      selectionName: s.selectionName ?? '',
      odds: s.odds ?? 1.0,
      sportId: s.sportId,
      league: s.league,
      region: s.region,
      eventStartTime: s.eventStartTime,
      isMarketActive: s.isMarketActive,
    }));

    const bookingCode = await useCase.execute({
      selections,
      isSingleBet: validated.isSingleBet,
    });

    return apiSuccessResponse({ bookingCode });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
